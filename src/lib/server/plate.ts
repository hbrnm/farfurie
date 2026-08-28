import { GoogleGenAI } from "@google/genai";
import jpeg from "jpeg-js";
import { searchOffProducts } from "@/lib/server/off";
import { foods, macrosForGrams, searchFoods, type Food } from "@/lib/foods";
import { plateTemplates } from "@/lib/plates";
import type { PlateEstimate, PlateGuess } from "@/lib/plate-types";

export type { PlateEstimate, PlateGuess };

function decodeJpeg(buffer: Buffer): { width: number; height: number; data: Uint8Array } | null {
  try {
    return jpeg.decode(buffer, { useTArray: true });
  } catch {
    return null;
  }
}

function histogramGuess(buffer: Buffer): { templateId: string; confidence: number } {
  const img = decodeJpeg(buffer);
  if (!img) return { templateId: "office", confidence: 0.35 };
  let green = 0;
  let brown = 0;
  let white = 0;
  let yellow = 0;
  const step = Math.max(1, Math.floor(img.data.length / 4 / 4000));
  let samples = 0;
  for (let i = 0; i < img.data.length; i += 4 * step) {
    const r = img.data[i];
    const g = img.data[i + 1];
    const b = img.data[i + 2];
    samples += 1;
    if (g > r + 18 && g > b + 12 && g > 70) green += 1;
    else if (r > 150 && g > 130 && b < 110 && r > b + 30) yellow += 1;
    else if (r > 90 && r > g + 15 && g > b && r < 180 && g < 130) brown += 1;
    else if (r > 200 && g > 200 && b > 180) white += 1;
  }
  const pg = green / Math.max(samples, 1);
  const pb = brown / Math.max(samples, 1);
  const py = yellow / Math.max(samples, 1);
  const pw = white / Math.max(samples, 1);
  if (pg > 0.22) return { templateId: "lose", confidence: Math.min(0.72, 0.4 + pg) };
  if (pb > 0.12 && py > 0.08) return { templateId: "lose", confidence: 0.48 };
  if (py > 0.18) return { templateId: "post", confidence: 0.45 };
  if (pw > 0.35) return { templateId: "office", confidence: 0.42 };
  return { templateId: "office", confidence: 0.4 };
}

function itemsFromFoods(rows: Array<{ food: Food; grams: number; confidence: number }>): PlateGuess[] {
  return rows.map((row) => ({
    nameRo: row.food.nameRo,
    nameEn: row.food.nameEn,
    grams: row.grams,
    macros: macrosForGrams(row.food, row.grams),
    foodId: row.food.id,
    confidence: row.confidence,
  }));
}

function foodById(id: string) {
  return foods.find((f) => f.id === id);
}

async function fromHint(hint: string): Promise<PlateGuess[] | null> {
  if (hint.trim().length < 2) return null;
  const local = searchFoods(hint, "ro");
  const off = await searchOffProducts(hint, true).catch(() => []);
  const seen = new Set<string>();
  const picked: Food[] = [];
  for (const food of [...local, ...off]) {
    const key = food.ean || food.id;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(food);
    if (picked.length >= 3) break;
  }
  if (picked.length === 0) return null;
  return itemsFromFoods(
    picked.map((food, i) => ({
      food,
      grams: food.defaultGrams,
      confidence: 0.62 - i * 0.08,
    })),
  );
}

function parseJsonBlob(text: string): { items?: Array<Record<string, unknown>> } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as { items?: Array<Record<string, unknown>> };
  } catch {
    return null;
  }
}

const KNOWN_FOODS_SUMMARY = foods
  .slice(0, 50)
  .map((f) => `${f.id}: ${f.nameRo}`)
  .join(", ");

const VISION_PROMPT = `You are an expert precision food identification and nutritional estimation AI for Romanian and European cuisine.

Task: Analyze the meal photo and user context, perform spatial volume & portion weight estimation, and return a JSON breakdown of every distinct food component.

Steps to perform internally:
1. Identify dish components separately (main protein, sides, sauces, salads, bread, drinks).
2. Estimate portion weight in grams based on visual volume, container scale (standard plate is ~24cm), and food density.
3. Account for cooking methods and visible/implied fats (e.g. oil coating, butter, sour cream).
4. Match items to local food IDs if applicable: ${KNOWN_FOODS_SUMMARY}

Return strictly JSON matching this structure:
{
  "items": [
    {
      "nameRo": "Nume românesc al preparatului",
      "nameEn": "English food name",
      "grams": 150,
      "kcal": 220,
      "protein": 25,
      "carbs": 10,
      "fat": 8,
      "confidence": 0.88,
      "foodId": "optional-id-from-list"
    }
  ]
}`;

function guessesFromModel(raw: { items?: Array<Record<string, unknown>> }): PlateGuess[] {
  const out: PlateGuess[] = [];
  for (const item of raw.items ?? []) {
    const rawNameRo = String(item.nameRo ?? item.name ?? "").trim();
    const rawNameEn = String(item.nameEn ?? item.name ?? rawNameRo).trim();
    const grams = Math.max(10, Math.min(800, Math.round(Number(item.grams) || 120)));
    
    // Attempt database grounding against local food catalog
    const matchedFood =
      (item.foodId ? foods.find((f) => f.id === String(item.foodId).trim()) : null) ??
      foods.find(
        (f) =>
          f.id === rawNameRo.toLowerCase() ||
          f.nameRo.toLowerCase() === rawNameRo.toLowerCase() ||
          f.nameEn.toLowerCase() === rawNameEn.toLowerCase() ||
          rawNameRo.toLowerCase().includes(f.nameRo.toLowerCase()),
      );

    const nameRo = matchedFood ? matchedFood.nameRo : rawNameRo;
    const nameEn = matchedFood ? matchedFood.nameEn : rawNameEn;
    
    // Programmatic macro grounding if food is matched in database
    const macros = matchedFood
      ? macrosForGrams(matchedFood, grams)
      : {
          kcal: Math.max(1, Math.round(Number(item.kcal) || (grams * 1.5))),
          protein: Math.max(0, Math.round((Number(item.protein) || 0) * 10) / 10),
          carbs: Math.max(0, Math.round((Number(item.carbs) || 0) * 10) / 10),
          fat: Math.max(0, Math.round((Number(item.fat) || 0) * 10) / 10),
        };

    if (!nameRo || (macros.kcal <= 0 && !matchedFood)) continue;

    const rawConfidence = Number(item.confidence);
    const confidence = Math.max(
      0.3,
      Math.min(0.98, !isNaN(rawConfidence) ? rawConfidence : matchedFood ? 0.85 : 0.65),
    );

    out.push({
      nameRo,
      nameEn,
      grams,
      macros,
      foodId: matchedFood?.id,
      confidence: Math.round(confidence * 100) / 100,
    });

    if (out.length >= 8) break;
  }
  return out;
}

async function geminiEstimate(base64: string, mime: string, hint: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `${VISION_PROMPT}${hint ? `\nUser hint / context: ${hint}` : ""}` },
            {
              inlineData: {
                mimeType: mime,
                data: base64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text ?? "";
    const parsed = parseJsonBlob(text);
    if (!parsed) return null;
    const items = guessesFromModel(parsed);
    return items.length ? items : null;
  } catch {
    return null;
  }
}

async function openaiEstimate(base64: string, mime: string, hint: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `${VISION_PROMPT}${hint ? `\nUser hint / context: ${hint}` : ""}` },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const parsed = parseJsonBlob(data.choices?.[0]?.message?.content ?? "");
    if (!parsed) return null;
    const items = guessesFromModel(parsed);
    return items.length ? items : null;
  } catch {
    return null;
  }
}

export async function estimatePlate(input: {
  imageBase64: string;
  mime?: string;
  hint?: string;
}): Promise<PlateEstimate> {
  const mime = input.mime || "image/jpeg";
  const hint = input.hint?.trim() ?? "";
  const raw = Buffer.from(input.imageBase64.replace(/^data:[^;]+;base64,/, ""), "base64");

  const gemini = await geminiEstimate(input.imageBase64.replace(/^data:[^;]+;base64,/, ""), mime, hint);
  if (gemini) {
    return {
      provider: "gemini",
      items: gemini,
      noteRo: "Identificare și estimare precisă AI (Gemini 2.5 Vision).",
      noteEn: "Precise AI vision identification & portion estimate (Gemini 2.5 Flash).",
    };
  }
  const openai = await openaiEstimate(input.imageBase64.replace(/^data:[^;]+;base64,/, ""), mime, hint);
  if (openai) {
    return {
      provider: "openai",
      items: openai,
      noteRo: "Identificare și estimare precisă AI (OpenAI Vision).",
      noteEn: "Precise AI vision identification & portion estimate (OpenAI Vision).",
    };
  }

  const hinted = hint ? await fromHint(hint) : null;
  if (hinted) {
    return {
      provider: "heuristic",
      items: hinted,
      noteRo: "Fără cheie AI Vision: s-a folosit indiciul tău + căutarea în catalogul de alimente.",
      noteEn: "No AI vision key: used your hint + food catalog search.",
    };
  }

  const hist = histogramGuess(raw);
  const plate = plateTemplates.find((p) => p.id === hist.templateId) ?? plateTemplates[0];
  const items: PlateGuess[] = [];
  for (const row of plate.items) {
    const food = foodById(row.foodId);
    if (!food) continue;
    items.push({
      nameRo: food.nameRo,
      nameEn: food.nameEn,
      grams: row.grams,
      macros: macrosForGrams(food, row.grams),
      foodId: food.id,
      confidence: 0.35,
    });
  }

  return {
    provider: "heuristic",
    items,
    noteRo:
      "Atenție: GEMINI_API_KEY nu este configurată pe server. Pentru identificare foto precisă, adaugă cheia API în file-ul .env.local.",
    noteEn:
      "Warning: GEMINI_API_KEY is not configured on server. For precise photo AI recognition, add the API key to .env.local.",
  };
}
