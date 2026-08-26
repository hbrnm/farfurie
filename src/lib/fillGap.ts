import type { Macros } from "./foods";
import { foods, macrosForGrams } from "./foods";
import { recipes } from "./recipes";

export type Remaining = Macros;

export type GapSuggestion = {
  id: string;
  kind: "food" | "recipe";
  nameRo: string;
  nameEn: string;
  macros: Macros;
  score: number;
  reasonRo: string;
  reasonEn: string;
  foodId?: string;
  recipeId?: string;
  grams?: number;
};

/**
 * Rank candidates by how well they close remaining kcal + protein
 * without heavily overshooting carbs/fat. Unique vs simple "under X kcal".
 */
export function fillTheGap(remaining: Remaining): GapSuggestion[] {
  const needKcal = Math.max(remaining.kcal, 0);
  const needP = Math.max(remaining.protein, 0);
  if (needKcal < 80 && needP < 5) return [];

  const suggestions: GapSuggestion[] = [];

  for (const food of foods) {
    // try default portion and a scaled portion toward remaining kcal
    const targets = [
      food.defaultGrams,
      Math.round((needKcal / Math.max(food.per100g.kcal, 1)) * 100),
    ]
      .map((g) => Math.min(Math.max(g, 40), 450))
      .filter((g, i, arr) => arr.indexOf(g) === i);

    for (const grams of targets) {
      const m = macrosForGrams(food, grams);
      const score = scoreFit(m, remaining);
      if (score < 0.25) continue;
      suggestions.push({
        id: `food-${food.id}-${grams}`,
        kind: "food",
        nameRo: food.nameRo,
        nameEn: food.nameEn,
        macros: m,
        score,
        reasonRo: reasonRo(m, remaining),
        reasonEn: reasonEn(m, remaining),
        foodId: food.id,
        grams,
      });
    }
  }

  for (const recipe of recipes) {
    const m = recipe.perServing;
    const score = scoreFit(m, remaining);
    if (score < 0.28) continue;
    suggestions.push({
      id: `recipe-${recipe.id}`,
      kind: "recipe",
      nameRo: recipe.nameRo,
      nameEn: recipe.nameEn,
      macros: m,
      score,
      reasonRo: reasonRo(m, remaining),
      reasonEn: reasonEn(m, remaining),
      recipeId: recipe.id,
    });
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .filter((s, i, arr) => arr.findIndex((x) => x.nameRo === s.nameRo) === i)
    .slice(0, 5);
}

function scoreFit(m: Macros, rem: Remaining): number {
  if (rem.kcal <= 0) return 0;
  const kcalRatio = m.kcal / rem.kcal;
  if (kcalRatio > 1.25 || kcalRatio < 0.35) return 0;

  const kcalScore = 1 - Math.abs(1 - kcalRatio);

  let proteinScore = 0.5;
  if (rem.protein > 8) {
    const pRatio = m.protein / rem.protein;
    if (pRatio > 1.4) proteinScore = 0.2;
    else proteinScore = 1 - Math.abs(1 - Math.min(pRatio, 1));
  } else {
    proteinScore = Math.min(m.protein / 15, 1);
  }

  const overFat = rem.fat > 0 ? Math.max(0, m.fat - rem.fat) / Math.max(rem.fat, 1) : 0;
  const penalty = Math.min(overFat, 1) * 0.35;

  return Math.max(0, kcalScore * 0.45 + proteinScore * 0.55 - penalty);
}

function reasonRo(m: Macros, rem: Remaining): string {
  const parts: string[] = [];
  if (rem.protein > 10 && m.protein >= rem.protein * 0.6) {
    parts.push("acoperă proteina rămasă");
  }
  if (Math.abs(m.kcal - rem.kcal) < rem.kcal * 0.2) {
    parts.push("aproape de bugetul caloric");
  }
  if (parts.length === 0) parts.push("potrivit pentru ce ți-a rămas");
  return parts.join(" · ");
}

function reasonEn(m: Macros, rem: Remaining): string {
  const parts: string[] = [];
  if (rem.protein > 10 && m.protein >= rem.protein * 0.6) {
    parts.push("covers remaining protein");
  }
  if (Math.abs(m.kcal - rem.kcal) < rem.kcal * 0.2) {
    parts.push("close to calorie budget");
  }
  if (parts.length === 0) parts.push("fits what’s left today");
  return parts.join(" · ");
}
