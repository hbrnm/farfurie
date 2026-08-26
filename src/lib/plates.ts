import { foods, macrosForGrams, type Macros, type Food } from "./foods";

export type PlateItem = { foodId: string; grams: number };

export type PlateTemplate = {
  id: string;
  nameRo: string;
  nameEn: string;
  reasonRo: string;
  reasonEn: string;
  items: PlateItem[];
};

export const plateTemplates: PlateTemplate[] = [
  {
    id: "lose",
    nameRo: "Farfurie slăbire",
    nameEn: "Cut plate",
    reasonRo: "½ salată · ¼ proteină · ¼ garnitură — fără pâine extra.",
    reasonEn: "½ salad · ¼ protein · ¼ sides — no extra bread.",
    items: [
      { foodId: "pui-lidl", grams: 150 },
      { foodId: "salata-varza", grams: 200 },
      { foodId: "mamaliga", grams: 120 },
    ],
  },
  {
    id: "office",
    nameRo: "Farfurie de birou",
    nameEn: "Office plate",
    reasonRo: "Ton + pâine + iaurt — ținuta de prânz, sub 450 kcal.",
    reasonEn: "Tuna + bread + yogurt — weekday lunch under 450 kcal.",
    items: [
      { foodId: "ton-scandia", grams: 120 },
      { foodId: "paine-neagra", grams: 40 },
      { foodId: "iaurt-napolact", grams: 150 },
    ],
  },
  {
    id: "post",
    nameRo: "Farfurie de post",
    nameEn: "Fasting-day plate",
    reasonRo: "Linte + fasole + pâine — proteină vegetală, ieftin.",
    reasonEn: "Lentils + beans + bread — cheap plant protein.",
    items: [
      { foodId: "linte-carrefour", grams: 80 },
      { foodId: "fasole-batuta", grams: 180 },
      { foodId: "paine-neagra", grams: 50 },
    ],
  },
];

export function plateMacros(items: PlateItem[]): Macros {
  return items.reduce(
    (acc, item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (!food) return acc;
      const m = macrosForGrams(food, item.grams);
      return {
        kcal: acc.kcal + m.kcal,
        protein: Math.round((acc.protein + m.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
        fat: Math.round((acc.fat + m.fat) * 10) / 10,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function plateFoods(items: PlateItem[]): Array<{ food: Food; grams: number }> {
  return items
    .map((item) => {
      const food = foods.find((f) => f.id === item.foodId);
      return food ? { food, grams: item.grams } : null;
    })
    .filter((row): row is { food: Food; grams: number } => row != null);
}
