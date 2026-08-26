import { searchFoods } from "@/lib/foods";
import { searchOffProducts } from "@/lib/server/off";
import type { Recipe } from "@/lib/recipes";

export type ImportedRecipe = {
  name: string;
  servings: number;
  minutes: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
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
    const n = Number(value.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

export async function importRecipeFromUrl(rawUrl: string): Promise<ImportedRecipe> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("invalid_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("invalid_url");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Farfurie/0.3 (https://github.com/hbrnm/farfurie)",
      Accept: "text/html,application/json",
    },
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
  const ingredients = asArray(recipe?.recipeIngredient)
    .map((x) => textOf(x))
    .filter(Boolean)
    .slice(0, 24);
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

  if (!kcal || kcal < 40) {
    const guessed = ingredients.slice(0, 6).flatMap((ing) => {
      const q = ing.replace(/^\d[\d.,/]*\s*(g|kg|ml|l|linguri|buc)?\s*/i, "").slice(0, 28);
      return searchFoods(q, "ro").slice(0, 1);
    });
    if (guessed.length) {
      kcal = Math.round(guessed.reduce((a, f) => a + f.per100g.kcal, 0) / guessed.length);
      protein = Math.round(guessed.reduce((a, f) => a + f.per100g.protein, 0) / guessed.length);
      carbs = Math.round(guessed.reduce((a, f) => a + f.per100g.carbs, 0) / guessed.length);
      fat = Math.round((guessed.reduce((a, f) => a + f.per100g.fat, 0) / guessed.length) * 10) / 10;
    }
  }

  if ((!kcal || kcal < 40) && ingredients[0]) {
    const off = await searchOffProducts(ingredients[0], true).catch(() => []);
    if (off[0]) {
      kcal = off[0].per100g.kcal;
      protein = off[0].per100g.protein;
      carbs = off[0].per100g.carbs;
      fat = off[0].per100g.fat;
    }
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
    source: url.hostname,
  };
}

export function importedToRecipe(row: ImportedRecipe): Recipe {
  const id = `url-${Date.now().toString(36)}`;
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
    stepsRo: [`Importat de pe ${row.source}.`],
    stepsEn: [`Imported from ${row.source}.`],
    imageHue: 140,
  };
}
