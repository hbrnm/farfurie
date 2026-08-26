"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./i18n";
import type { Macros } from "./foods";
import { foods, macrosForGrams } from "./foods";
import { recipes } from "./recipes";

export type MealKey = "breakfast" | "lunch" | "dinner" | "snack";

export type DiaryEntry = {
  id: string;
  meal: MealKey;
  nameRo: string;
  nameEn: string;
  macros: Macros;
  createdAt: string;
};

type Goals = Macros & { waterMl: number };

type State = {
  locale: Locale;
  holidayMode: boolean;
  waterMl: number;
  streak: number;
  entries: DiaryEntry[];
  setLocale: (locale: Locale) => void;
  toggleHoliday: () => void;
  addWater: () => void;
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => void;
  addFoodToMeal: (foodId: string, meal: MealKey, grams?: number) => void;
  addRecipeToMeal: (recipeId: string, meal: MealKey) => void;
  removeEntry: (id: string) => void;
  baseGoals: () => Goals;
  effectiveGoals: () => Goals;
  totals: () => Macros;
  remaining: () => Macros;
};

const BASE: Goals = {
  kcal: 2100,
  protein: 130,
  carbs: 220,
  fat: 70,
  waterMl: 2500,
};

export const useFarfurieStore = create<State>()(
  persist(
    (set, get) => ({
      locale: "ro",
      holidayMode: false,
      waterMl: 750,
      streak: 4,
      entries: [
        {
          id: "seed-1",
          meal: "breakfast",
          nameRo: "Ovăz cu iaurt Napolact și mere",
          nameEn: "Oats with Napolact yogurt and apple",
          macros: { kcal: 340, protein: 14, carbs: 52, fat: 9 },
          createdAt: new Date().toISOString(),
        },
        {
          id: "seed-2",
          meal: "lunch",
          nameRo: "Piept de pui la grătar",
          nameEn: "Grilled chicken breast",
          macros: { kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 },
          createdAt: new Date().toISOString(),
        },
      ],
      setLocale: (locale) => set({ locale }),
      toggleHoliday: () => set((s) => ({ holidayMode: !s.holidayMode })),
      addWater: () => set((s) => ({ waterMl: Math.min(s.waterMl + 250, 5000) })),
      addEntry: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries,
            {
              ...entry,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      addFoodToMeal: (foodId, meal, grams) => {
        const food = foods.find((f) => f.id === foodId);
        if (!food) return;
        const g = grams ?? food.defaultGrams;
        const macros = macrosForGrams(food, g);
        get().addEntry({
          meal,
          nameRo: food.nameRo,
          nameEn: food.nameEn,
          macros,
        });
      },
      addRecipeToMeal: (recipeId, meal) => {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (!recipe) return;
        get().addEntry({
          meal,
          nameRo: recipe.nameRo,
          nameEn: recipe.nameEn,
          macros: recipe.perServing,
        });
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      baseGoals: () => BASE,
      effectiveGoals: () => {
        const holiday = get().holidayMode;
        if (!holiday) return BASE;
        return {
          kcal: Math.round(BASE.kcal * 1.15),
          protein: BASE.protein,
          carbs: Math.round(BASE.carbs * 1.15),
          fat: Math.round(BASE.fat * 1.15),
          waterMl: BASE.waterMl,
        };
      },
      totals: () => {
        return get().entries.reduce(
          (acc, e) => ({
            kcal: acc.kcal + e.macros.kcal,
            protein: Math.round((acc.protein + e.macros.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + e.macros.carbs) * 10) / 10,
            fat: Math.round((acc.fat + e.macros.fat) * 10) / 10,
          }),
          { kcal: 0, protein: 0, carbs: 0, fat: 0 },
        );
      },
      remaining: () => {
        const goals = get().effectiveGoals();
        const totals = get().totals();
        return {
          kcal: goals.kcal - totals.kcal,
          protein: Math.round((goals.protein - totals.protein) * 10) / 10,
          carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
          fat: Math.round((goals.fat - totals.fat) * 10) / 10,
        };
      },
    }),
    { name: "farfurie-demo-v1" },
  ),
);
