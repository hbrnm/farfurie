import type { Macros } from "./foods";
import { shiftDateKey } from "./dates";

export type MealKey = "breakfast" | "lunch" | "dinner" | "snack";

export type DatedEntry = {
  meal: MealKey;
  dateKey?: string;
  createdAt: string;
  macros: Macros;
  recipeId?: string;
  nameRo: string;
};

export type DatedExercise = {
  dateKey?: string;
  createdAt: string;
  kcal: number;
};

export type ShoppingLike = {
  nameRo: string;
  fromRecipeId?: string;
};

const MEALS: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

export function dateKeyOf(item: { dateKey?: string; createdAt: string }): string {
  if (item.dateKey) return item.dateKey;
  return item.createdAt.slice(0, 10);
}

export function onDate<T extends { dateKey?: string; createdAt: string }>(
  items: T[],
  dateKey: string,
): T[] {
  return items.filter((item) => dateKeyOf(item) === dateKey);
}

export function sumMacros(entries: { macros: Macros }[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.macros.kcal,
      protein: Math.round((acc.protein + e.macros.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.macros.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.macros.fat) * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function remainingMacros(goals: Macros, totals: Macros): Macros {
  return {
    kcal: goals.kcal - totals.kcal,
    protein: Math.round((goals.protein - totals.protein) * 10) / 10,
    carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
    fat: Math.round((goals.fat - totals.fat) * 10) / 10,
  };
}

/** Consecutive logged days. Empty today still counts yesterday's streak. */
export function calcStreak(loggedDates: Iterable<string>, today: string): number {
  const set = loggedDates instanceof Set ? loggedDates : new Set(loggedDates);
  let cursor = set.has(today) ? today : shiftDateKey(today, -1);
  if (!set.has(cursor)) return 0;
  let n = 0;
  while (set.has(cursor)) {
    n += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return n;
}

export function loggedDateKeys(entries: DatedEntry[]): Set<string> {
  return new Set(entries.map(dateKeyOf));
}

export function kcalOnDate(entries: DatedEntry[], dateKey: string): number {
  return onDate(entries, dateKey).reduce((a, e) => a + e.macros.kcal, 0);
}

export function recipeAlreadyOnMeal(
  entries: DatedEntry[],
  meal: MealKey,
  recipeId: string,
): boolean {
  return entries.some((e) => e.meal === meal && e.recipeId === recipeId);
}

export function pickGapMeal(entries: DatedEntry[]): MealKey {
  const kcal: Record<MealKey, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };
  for (const e of entries) kcal[e.meal] += e.macros.kcal;
  const empty = MEALS.find((m) => kcal[m] === 0);
  if (empty) return empty;
  return MEALS.reduce((best, meal) => (kcal[meal] < kcal[best] ? meal : best));
}

export function shoppingHasIngredient(
  existing: ShoppingLike[],
  recipeId: string,
  nameRo: string,
): boolean {
  const needle = nameRo.trim().toLowerCase();
  return existing.some(
    (item) =>
      item.fromRecipeId === recipeId && item.nameRo.trim().toLowerCase() === needle,
  );
}
