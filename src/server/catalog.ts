import { foods, macrosForGrams, searchFoods, type Food, type Macros } from "@/lib/foods";
import type { MealKey } from "@/lib/diary";

const BARCODES: Record<string, string> = {
  "5949046300123": "iaurt-napolact",
  "5941234000017": "ton-scandia",
  "5949046200458": "paine-neagra",
  "5949046500789": "cascaval-pilos",
  "5941234000888": "lapte-napolact",
  "5949046800333": "ciocolata-poiana",
  "5941234000552": "hummus-lidl",
  "4000539324010": "paste-integrale",
};

export function lookupBarcode(code: string): Food | null {
  const id = BARCODES[code.replace(/\s/g, "")];
  if (!id) return null;
  return foods.find((f) => f.id === id) ?? null;
}

export function searchCatalog(query: string, locale: "ro" | "en"): Food[] {
  return searchFoods(query, locale);
}

function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const MEAL_HINTS: { keys: string[]; meal: MealKey }[] = [
  { keys: ["mic dejun", "micul dejun", "breakfast", "dimineata"], meal: "breakfast" },
  { keys: ["pranz", "lunch"], meal: "lunch" },
  { keys: ["cina", "dinner", "seara"], meal: "dinner" },
  { keys: ["gustare", "snack"], meal: "snack" },
];

export type ParsedFoodText = {
  food: Food;
  grams: number;
  macros: Macros;
  meal: MealKey;
  query: string;
};

export function parseFoodText(
  text: string,
  locale: "ro" | "en",
  defaultMeal: MealKey,
): ParsedFoodText | null {
  const raw = text.trim();
  if (!raw) return null;
  const folded = fold(raw);

  let meal = defaultMeal;
  for (const hint of MEAL_HINTS) {
    if (hint.keys.some((k) => folded.includes(fold(k)))) {
      meal = hint.meal;
      break;
    }
  }

  const gramMatch = folded.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|grame|grams?)\b/);
  const gramsFromText = gramMatch
    ? Math.round(Number(gramMatch[1].replace(",", ".")))
    : null;

  const ranked = foods
    .map((food) => {
      const names = [fold(food.nameRo), fold(food.nameEn), fold(food.brand ?? "")];
      const hit = names.some((n) => n && folded.includes(n));
      const tokenHit = fold(food.nameRo)
        .split(/\s+/)
        .filter((t) => t.length > 3)
        .some((t) => folded.includes(t));
      return { food, score: hit ? 2 : tokenHit ? 1 : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const food = ranked[0]?.food ?? searchFoods(raw, locale)[0];
  if (!food) return null;
  const grams = Math.min(800, Math.max(10, gramsFromText ?? food.defaultGrams));
  return {
    food,
    grams,
    macros: macrosForGrams(food, grams),
    meal,
    query: raw,
  };
}

export { BARCODES };
