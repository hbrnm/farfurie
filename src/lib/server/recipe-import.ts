import { foldRo, macrosForGrams, searchFoods } from "@/lib/foods";
import { searchOffProducts } from "@/lib/server/off";
import type { Recipe } from "@/lib/recipes";
import {
  ingredientQuery,
  parseGrams,
  parseRecipeText,
  type ParsedRecipeText,
} from "@/lib/recipe-text";

export type ImportedRecipe = {
  name: string;
  servings: number;
  minutes: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  source: string;
};

type JsonLd = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const iso = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (iso && (iso[1] || iso[2])) {
      return Number(iso[1] || 0) * 60 + Number(iso[2] || 0);
    }
    const n = Number(value.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&frac14;/g, "¼")
    .replace(/&frac12;/g, "½")
    .replace(/&frac34;/g, "¾")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function textOf(value: unknown): string {
  if (typeof value === "string") {
    return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  }
  if (value && typeof value === "object" && "text" in value) return textOf((value as { text: unknown }).text);
  return "";
}

function pickRecipe(graph: unknown): JsonLd | null {
  const nodes = asArray(graph);
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const n = node as JsonLd;
    const types = asArray(n["@type"]).map((x) => String(x).toLowerCase());
    if (types.includes("recipe")) return n;
    if (n["@graph"]) {
      const nested = pickRecipe(n["@graph"]);
      if (nested) return nested;
    }
  }
  return null;
}

function instructionsOf(recipe: JsonLd | null): string[] {
  if (!recipe) return [];
  return asArray(recipe.recipeInstructions)
    .flatMap((item) => {
      if (typeof item === "string") return [textOf(item)];
      if (item && typeof item === "object") {
        const row = item as JsonLd;
        const how = textOf(row.text) || textOf(row.name);
        return how ? [how] : [];
      }
      return [];
    })
    .filter(Boolean)
    .slice(0, 24);
}

function metaContent(html: string, prop: string) {
  const re1 = new RegExp(`property=["']${prop}["'][^>]*content=["']([^"']+)`, "i");
  const re2 = new RegExp(`content=["']([^"']+)["'][^>]*property=["']${prop}["']`, "i");
  const re3 = new RegExp(`name=["']${prop}["'][^>]*content=["']([^"']+)`, "i");
  return decodeEntities(html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? html.match(re3)?.[1] ?? "");
}

function isInstagram(url: URL) {
  return /(^|\.)instagram\.com$/i.test(url.hostname) || /(^|\.)instagr\.am$/i.test(url.hostname);
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 Farfurie/0.3",
  Accept: "text/html,application/json",
};

function dishMacrosFromName(name: string) {
  const tokens = name.split(/[\s,/]+/).filter((w) => foldRo(w).length >= 4);
  for (const token of tokens) {
    const food = searchFoods(token, "ro")[0];
    if (!food) continue;
    const q = foldRo(token);
    if (
      foldRo(food.nameRo).includes(q) ||
      foldRo(food.nameEn).includes(q) ||
      foldRo(food.id).includes(q)
    ) {
      return macrosForGrams(food, food.defaultGrams);
    }
  }
  return null;
}

async function nutritionFromIngredients(ingredients: string[], servings: number) {
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let hits = 0;

  for (const ing of ingredients.slice(0, 12)) {
    const q = ingredientQuery(ing);
    if (q.length < 2) continue;
    const food = searchFoods(q, "ro")[0];
    if (!food) continue;
    const grams = parseGrams(ing) ?? food.defaultGrams;
    const macros = macrosForGrams(food, grams);
    kcal += macros.kcal;
    protein += macros.protein;
    carbs += macros.carbs;
    fat += macros.fat;
    hits += 1;
  }

  if (hits > 0) {
    const div = Math.max(1, servings);
    return {
      kcal: Math.round(kcal / div),
      protein: Math.round(protein / div),
      carbs: Math.round(carbs / div),
      fat: Math.round((fat / div) * 10) / 10,
      hits,
    };
  }

  const guessed = ingredients.slice(0, 6).flatMap((ing) => {
    const q = ingredientQuery(ing);
    return q ? searchFoods(q, "ro").slice(0, 1) : [];
  });
  if (guessed.length) {
    return {
      kcal: Math.round(guessed.reduce((a, f) => a + f.per100g.kcal, 0) / guessed.length),
      protein: Math.round(guessed.reduce((a, f) => a + f.per100g.protein, 0) / guessed.length),
      carbs: Math.round(guessed.reduce((a, f) => a + f.per100g.carbs, 0) / guessed.length),
      fat: Math.round((guessed.reduce((a, f) => a + f.per100g.fat, 0) / guessed.length) * 10) / 10,
      hits: guessed.length,
    };
  }

  if (ingredients[0]) {
    const off = await searchOffProducts(ingredientQuery(ingredients[0]) || ingredients[0], true).catch(
      () => [],
    );
    if (off[0]) {
      return {
        kcal: off[0].per100g.kcal,
        protein: off[0].per100g.protein,
        carbs: off[0].per100g.carbs,
        fat: off[0].per100g.fat,
        hits: 1,
      };
    }
  }

  return { kcal: 0, protein: 0, carbs: 0, fat: 0, hits: 0 };
}

async function finishImport(parsed: ParsedRecipeText & { source: string }): Promise<ImportedRecipe> {
  if (parsed.ingredients.length < 1) throw new Error("empty_recipe");
  const n = await nutritionFromIngredients(parsed.ingredients, parsed.servings);
  const dish = dishMacrosFromName(parsed.name);
  const macros = n.hits < 3 && dish ? { ...dish, hits: n.hits } : n;
  if (!macros.kcal || macros.kcal < 40) throw new Error("no_nutrition");
  return {
    name: parsed.name,
    servings: parsed.servings,
    minutes: parsed.minutes,
    kcal: Math.round(macros.kcal),
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fat: Math.round(macros.fat * 10) / 10,
    ingredients: parsed.ingredients,
    steps: parsed.steps,
    source: parsed.source,
  };
}

async function instagramCaption(url: URL): Promise<string | null> {
  try {
    const oembed = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url.toString())}&omitscript=true`;
    const res = await fetch(oembed, {
      headers: { Accept: "application/json", "User-Agent": FETCH_HEADERS["User-Agent"] },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      const title = String(data.title ?? "").trim();
      if (title.length > 24 && !/on Instagram$/i.test(title)) {
        return [data.author_name, title].filter(Boolean).join("\n");
      }
    }
  } catch {
    /* Instagram often blocks oEmbed without a token */
  }

  try {
    const res = await fetch(url.toString(), {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const title = metaContent(html, "og:title");
    const desc = metaContent(html, "og:description");
    const blob = `${title}\n${desc}`.replace(/\\n/g, "\n").trim();
    if (blob.length > 40 && !/log in|sign up|instagram/i.test(blob)) return blob;
  } catch {
    return null;
  }
  return null;
}

async function importFromInstagram(url: URL): Promise<ImportedRecipe> {
  const caption = await instagramCaption(url);
  if (!caption) throw new Error("instagram_blocked");
  const parsed = parseRecipeText(caption);
  if (parsed.ingredients.length < 2) throw new Error("instagram_blocked");
  return finishImport({ ...parsed, source: "instagram.com" });
}

export async function importRecipeFromText(raw: string): Promise<ImportedRecipe> {
  const text = raw.trim();
  if (text.length < 8) throw new Error("empty_recipe");
  return finishImport({ ...parseRecipeText(text), source: "text" });
}

function parseJsonBlob(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parsedFromVision(raw: Record<string, unknown> | null): ParsedRecipeText | null {
  if (!raw) return null;
  const ingredients = asArray(raw.ingredients)
    .map((x) => textOf(x))
    .filter(Boolean);
  const steps = asArray(raw.steps)
    .map((x) => textOf(x))
    .filter(Boolean);
  const name = textOf(raw.name);
  if (!name && ingredients.length < 2) return null;
  return {
    name: name || "Rețetă din poză",
    servings: Math.max(1, Math.round(num(raw.servings) ?? 4)),
    minutes: Math.max(5, Math.round(num(raw.minutes) ?? 30)),
    ingredients,
    steps,
  };
}

const RECIPE_VISION_PROMPT = `Extract a cooking recipe from this photo of a cookbook page, handwritten recipe, or Instagram screenshot.
Return ONLY JSON:
{"name":"...","servings":4,"minutes":30,"ingredients":["500g varză","..."],"steps":["..."]}
Keep quantities. Use Romanian if the source is Romanian. If this is not a recipe, return {"name":"","ingredients":[]}.`;

async function geminiRecipe(base64: string, mime: string) {
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
              { text: RECIPE_VISION_PROMPT },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.1 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
  return parsedFromVision(parseJsonBlob(text));
}

async function openaiRecipe(base64: string, mime: string) {
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
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECIPE_VISION_PROMPT },
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
  return parsedFromVision(parseJsonBlob(data.choices?.[0]?.message?.content ?? ""));
}

export async function importRecipeFromImage(imageBase64: string, mime = "image/jpeg"): Promise<ImportedRecipe> {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error("needs_vision");
  }
  const base64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
  if (base64.length < 80) throw new Error("empty_recipe");
  const parsed = (await geminiRecipe(base64, mime)) ?? (await openaiRecipe(base64, mime));
  if (!parsed || parsed.ingredients.length < 2) throw new Error("empty_recipe");
  return finishImport({ ...parsed, source: "photo" });
}

export async function importRecipeFromUrl(rawUrl: string): Promise<ImportedRecipe> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("invalid_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("invalid_url");
  if (isInstagram(url)) return importFromInstagram(url);

  const res = await fetch(url.toString(), {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("fetch_failed");
  const html = await res.text();
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let recipe: JsonLd | null = null;
  for (const match of scripts) {
    try {
      recipe = pickRecipe(JSON.parse(match[1] ?? "null"));
    } catch {
      recipe = null;
    }
    if (recipe) break;
  }
  const name =
    textOf(recipe?.name) ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ||
    url.hostname;
  let ingredients = asArray(recipe?.recipeIngredient)
    .map((x) => textOf(x))
    .filter(Boolean)
    .slice(0, 24);
  if (ingredients.length === 0) {
    ingredients = [...html.matchAll(/itemprop=["']recipeIngredient["'][^>]*>([^<]+)/gi)]
      .map((m) => decodeEntities(m[1].trim()))
      .filter(Boolean)
      .slice(0, 24);
  }
  const nutrition = (recipe?.nutrition && typeof recipe.nutrition === "object"
    ? (recipe.nutrition as JsonLd)
    : {}) as JsonLd;
  let kcal = num(nutrition.calories) ?? num(nutrition.caloriesContent);
  let protein = num(nutrition.proteinContent) ?? 0;
  let carbs = num(nutrition.carbohydrateContent) ?? 0;
  let fat = num(nutrition.fatContent) ?? 0;
  const servings = Math.max(1, Math.round(num(recipe?.recipeYield) ?? num(recipe?.yield) ?? 2));
  const minutes = Math.max(
    10,
    Math.round(num(recipe?.totalTime) ?? num(recipe?.cookTime) ?? 30),
  );
  const steps = instructionsOf(recipe);

  if (!kcal || kcal < 40) {
    const guessed = await nutritionFromIngredients(ingredients, servings);
    kcal = guessed.kcal;
    protein = guessed.protein;
    carbs = guessed.carbs;
    fat = guessed.fat;
  }

  if (!kcal || kcal < 40) throw new Error("no_nutrition");

  return {
    name,
    servings,
    minutes: Number.isFinite(minutes) ? minutes : 30,
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat * 10) / 10,
    ingredients,
    steps,
    source: url.hostname,
  };
}

export function importedToRecipe(row: ImportedRecipe): Recipe {
  const kind = row.source.includes("instagram")
    ? "ig"
    : row.source === "text"
      ? "text"
      : row.source === "photo"
        ? "photo"
        : "url";
  const id = `${kind}-${Date.now().toString(36)}`;
  const fallbackStep =
    kind === "text"
      ? "Importată din text."
      : kind === "photo"
        ? "Importată din poză."
        : `Importat de pe ${row.source}.`;
  const steps = row.steps.length ? row.steps : [fallbackStep];
  const hue = kind === "photo" ? 28 : kind === "ig" ? 320 : kind === "text" ? 200 : 140;
  return {
    id,
    nameRo: row.name,
    nameEn: row.name,
    minutes: row.minutes,
    servings: row.servings,
    tags: ["import", row.source],
    perServing: {
      kcal: row.kcal,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
    },
    ingredientsRo: row.ingredients.length ? row.ingredients : [row.source],
    ingredientsEn: row.ingredients.length ? row.ingredients : [row.source],
    stepsRo: steps,
    stepsEn: steps,
    imageHue: hue,
  };
}
