import jpeg from "jpeg-js";
import { searchOffProducts } from "@/lib/server/off";
import { foods, macrosForGrams, type Food } from "@/lib/foods";
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
  if (pg > 0.22) return { templateId: "lose", confidence: Math.min(0.72, 0.4 + pg) };
  if (pb > 0.12 && py > 0.08) return { templateId: "lose", confidence: 0.48 };
  if (py > 0.18) return { templateId: "post", confidence: 0.45 };
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
  const q = hint.trim().toLowerCase();
  if (q.length < 2) return null;
  const local = foods.filter((f) =>
    `${f.nameRo} ${f.nameEn} ${f.brand ?? ""}`.toLowerCase().includes(q.split(/\s+/)[0] ?? q),
  );
  const off = await searchOffProducts(hint, true).catch(() => []);
  const picked = [...local.slice(0, 2), ...off.slice(0, 2)];
  if (picked.length === 0) return null;
  return itemsFromFoods(
    picked.slice(0, 3).map((food, i) => ({
      food,
      grams: food.defaultGrams,
      confidence: 0.55 - i * 0.08,
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

function guessesFromModel(raw: { items?: Array<Record<string, unknown>> }): PlateGuess[] {
  const out: PlateGuess[] = [];
  for (const item of raw.items ?? []) {
    const nameRo = String(item.nameRo ?? item.name ?? "");
    const nameEn = String(item.nameEn ?? item.name ?? nameRo);
    const grams = Math.max(20, Math.min(600, Number(item.grams) || 120));
    const food =
      foods.find((f) => f.id === item.foodId) ??
      foods.find(
        (f) =>
          f.nameRo.toLowerCase() === nameRo.toLowerCase() ||
          f.nameEn.toLowerCase() === nameEn.toLowerCase(),
      );
    const macros = food
      ? macrosForGrams(food, grams)
      : {
          kcal: Math.round(Number(item.kcal) || 0),
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
        };
    if (!nameRo || macros.kcal <= 0) continue;
    out.push({
      nameRo,
      nameEn,
      grams,
      macros,
      foodId: food?.id,
      confidence: Math.max(0.2, Math.min(0.95, Number(item.confidence) || 0.6)),
    });
    if (out.length >= 6) break;
  }
  return out;
}

const VISION_PROMPT = `You estimate a Romanian meal from a plate photo.
Return ONLY JSON: {"items":[{"nameRo":"...","nameEn":"...","grams":120,"kcal":200,"protein":10,"carbs":20,"fat":8,"confidence":0.7,"foodId":"optional-id"}]}
Prefer typical RO portions (farfurie, lingură, pahar). foodId if it matches: sarmale, pui-piept, mamaliga, salata-varza, shaorma-pui, covrig, oua, iaurt-napolact, ton-scandia, ciorba-burta, mici.`;

async function geminiEstimate(base64: string, mime: string, hint: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${VISION_PROMPT}${hint ? `\nUser hint: ${hint}` : ""}` },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
  const parsed = parseJsonBlob(text);
  if (!parsed) return null;
  const items = guessesFromModel(parsed);
  return items.length ? items : null;
}

async function openaiEstimate(base64: string, mime: string, hint: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${VISION_PROMPT}${hint ? `\nUser hint: ${hint}` : ""}` },
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
      noteRo: "Estimare din poză (Gemini).",
      noteEn: "Estimate from the photo (Gemini).",
    };
  }
  const openai = await openaiEstimate(input.imageBase64.replace(/^data:[^;]+;base64,/, ""), mime, hint);
  if (openai) {
    return {
      provider: "openai",
      items: openai,
      noteRo: "Estimare din poză (OpenAI).",
      noteEn: "Estimate from the photo (OpenAI).",
    };
  }

  const hinted = hint ? await fromHint(hint) : null;
  if (hinted) {
    return {
      provider: "heuristic",
      items: hinted,
      noteRo: "Fără cheie vision: am folosit textul tău + Open Food Facts / catalogul RO.",
      noteEn: "No vision key: used your hint + Open Food Facts / the RO catalog.",
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
      confidence: hist.confidence,
    });
  }

  return {
    provider: "heuristic",
    items,
    noteRo:
      "Estimare locală din culorile pozei + farfurie RO. Pentru recunoaștere de feluri, pune GEMINI_API_KEY.",
    noteEn:
      "Local estimate from photo colors + a RO plate template. For dish recognition, set GEMINI_API_KEY.",
  };
}
