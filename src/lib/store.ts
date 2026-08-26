"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { Locale } from "./i18n";
import type { Macros } from "./foods";
import { foods, macrosForGrams } from "./foods";
import { recipes } from "./recipes";
import {
  calcBmr,
  calcCalorieGoal,
  calcMacroGoals,
  calcTdee,
  defaultProfile,
  type ProfileInput,
} from "./goals";
import { exercises, type FastingProtocol, fastingProtocols } from "./activity";

export type MealKey = "breakfast" | "lunch" | "dinner" | "snack";

export type DiaryEntry = {
  id: string;
  meal: MealKey;
  nameRo: string;
  nameEn: string;
  macros: Macros;
  createdAt: string;
};

export type ShoppingItem = {
  id: string;
  nameRo: string;
  nameEn: string;
  checked: boolean;
  fromRecipeId?: string;
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  nameRo: string;
  nameEn: string;
  minutes: number;
  kcal: number;
  createdAt: string;
};

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WeekPlan = Record<DayKey, Partial<Record<MealKey, string>>>;

export const WEEK_DAYS: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

type Goals = Macros & { waterMl: number };

type State = {
  locale: Locale;
  holidayMode: boolean;
  waterMl: number;
  streak: number;
  entries: DiaryEntry[];
  profile: ProfileInput;
  goals: Goals;
  favoriteRecipeIds: string[];
  favoriteFoodIds: string[];
  shopping: ShoppingItem[];
  fastingProtocolId: string;
  fastingStartedAt: string | null;
  exerciseLogs: ExerciseLog[];
  onboardingDone: boolean;
  weekPlan: WeekPlan;
  setLocale: (locale: Locale) => void;
  toggleHoliday: () => void;
  addWater: () => void;
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => void;
  addFoodToMeal: (foodId: string, meal: MealKey, grams?: number) => void;
  addRecipeToMeal: (recipeId: string, meal: MealKey) => void;
  removeEntry: (id: string) => void;
  setProfile: (profile: ProfileInput) => void;
  applyProfileGoals: () => void;
  completeOnboarding: () => void;
  setPlanSlot: (day: DayKey, meal: MealKey, recipeId: string | null) => void;
  applyTodayPlanToDiary: () => void;
  addWeekPlanToShopping: () => void;
  toggleFavoriteRecipe: (id: string) => void;
  toggleFavoriteFood: (id: string) => void;
  addRecipeToShopping: (recipeId: string) => void;
  toggleShoppingItem: (id: string) => void;
  clearCheckedShopping: () => void;
  clearShopping: () => void;
  setFastingProtocol: (id: string) => void;
  startFasting: () => void;
  stopFasting: () => void;
  logExercise: (exerciseId: string, minutes: number) => void;
  removeExercise: (id: string) => void;
  baseGoals: () => Goals;
  effectiveGoals: () => Goals;
  totals: () => Macros;
  remaining: () => Macros;
  burnedToday: () => number;
  fastingStatus: () => {
    protocol: FastingProtocol;
    active: boolean;
    phase: "fasting" | "eating" | "idle";
    elapsedMin: number;
    remainingMin: number;
  };
};

function goalsFromProfile(profile: ProfileInput): Goals {
  const kcal = calcCalorieGoal(profile);
  return calcMacroGoals(kcal, profile.weightKg);
}

const INITIAL_GOALS = goalsFromProfile(defaultProfile);

function emptyWeekPlan(): WeekPlan {
  return {
    mon: { breakfast: "ovaz-napolact", lunch: "pui-orez" },
    tue: { lunch: "salata-ton", dinner: "fasole-light" },
    wed: { breakfast: "omleta-telemea", dinner: "ciorba-legume" },
    thu: { lunch: "pui-orez" },
    fri: { dinner: "linte-curry" },
    sat: { lunch: "sarmale-light" },
    sun: {},
  };
}

function todayDayKey(): DayKey {
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[new Date().getDay()];
}

export const useFarfurieStore = create<State>()(
  persist(
    (set, get) => ({
      locale: "ro",
      holidayMode: false,
      waterMl: 750,
      streak: 4,
      onboardingDone: false,
      weekPlan: emptyWeekPlan(),
      profile: defaultProfile,
      goals: INITIAL_GOALS,
      favoriteRecipeIds: ["ovaz-napolact", "salata-ton"],
      favoriteFoodIds: ["ton-scandia", "iaurt-napolact"],
      shopping: [
        {
          id: "seed-shop-1",
          nameRo: "150g iaurt Napolact",
          nameEn: "150g Napolact yogurt",
          checked: false,
          fromRecipeId: "ovaz-napolact",
        },
        {
          id: "seed-shop-2",
          nameRo: "1 măr",
          nameEn: "1 apple",
          checked: true,
          fromRecipeId: "ovaz-napolact",
        },
      ],
      fastingProtocolId: "16-8",
      fastingStartedAt: null,
      exerciseLogs: [],
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
      setProfile: (profile) => set({ profile }),
      applyProfileGoals: () => {
        const goals = goalsFromProfile(get().profile);
        set({ goals });
      },
      completeOnboarding: () => {
        const goals = goalsFromProfile(get().profile);
        set({ goals, onboardingDone: true });
      },
      setPlanSlot: (day, meal, recipeId) =>
        set((s) => {
          const dayPlan = { ...s.weekPlan[day] };
          if (!recipeId) delete dayPlan[meal];
          else dayPlan[meal] = recipeId;
          return { weekPlan: { ...s.weekPlan, [day]: dayPlan } };
        }),
      applyTodayPlanToDiary: () => {
        const day = todayDayKey();
        const slots = get().weekPlan[day] ?? {};
        (Object.entries(slots) as [MealKey, string][]).forEach(([meal, recipeId]) => {
          if (recipeId) get().addRecipeToMeal(recipeId, meal);
        });
      },
      addWeekPlanToShopping: () => {
        const ids = new Set<string>();
        WEEK_DAYS.forEach((day) => {
          Object.values(get().weekPlan[day] ?? {}).forEach((id) => {
            if (id) ids.add(id);
          });
        });
        ids.forEach((id) => get().addRecipeToShopping(id));
      },
      toggleFavoriteRecipe: (id) =>
        set((s) => ({
          favoriteRecipeIds: s.favoriteRecipeIds.includes(id)
            ? s.favoriteRecipeIds.filter((x) => x !== id)
            : [...s.favoriteRecipeIds, id],
        })),
      toggleFavoriteFood: (id) =>
        set((s) => ({
          favoriteFoodIds: s.favoriteFoodIds.includes(id)
            ? s.favoriteFoodIds.filter((x) => x !== id)
            : [...s.favoriteFoodIds, id],
        })),
      addRecipeToShopping: (recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (!recipe) return;
        const items: ShoppingItem[] = recipe.ingredientsRo.map((nameRo, i) => ({
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          nameRo,
          nameEn: recipe.ingredientsEn[i] ?? nameRo,
          checked: false,
          fromRecipeId: recipeId,
        }));
        set((s) => ({ shopping: [...s.shopping, ...items] }));
      },
      toggleShoppingItem: (id) =>
        set((s) => ({
          shopping: s.shopping.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item,
          ),
        })),
      clearCheckedShopping: () =>
        set((s) => ({ shopping: s.shopping.filter((i) => !i.checked) })),
      clearShopping: () => set({ shopping: [] }),
      setFastingProtocol: (id) => set({ fastingProtocolId: id }),
      startFasting: () => set({ fastingStartedAt: new Date().toISOString() }),
      stopFasting: () => set({ fastingStartedAt: null }),
      logExercise: (exerciseId, minutes) => {
        const ex = exercises.find((e) => e.id === exerciseId);
        if (!ex || minutes <= 0) return;
        const kcal = Math.round(ex.kcalPerMin * minutes);
        set((s) => ({
          exerciseLogs: [
            ...s.exerciseLogs,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              exerciseId,
              nameRo: ex.nameRo,
              nameEn: ex.nameEn,
              minutes,
              kcal,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },
      removeExercise: (id) =>
        set((s) => ({
          exerciseLogs: s.exerciseLogs.filter((e) => e.id !== id),
        })),
      baseGoals: () => get().goals,
      effectiveGoals: () => {
        const base = get().goals;
        if (!get().holidayMode) return base;
        return {
          kcal: Math.round(base.kcal * 1.15),
          protein: base.protein,
          carbs: Math.round(base.carbs * 1.15),
          fat: Math.round(base.fat * 1.15),
          waterMl: base.waterMl,
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
        const burned = get().burnedToday();
        // Net-style remaining: burned adds back to budget (optional MFP-like)
        const budget = goals.kcal + burned;
        return {
          kcal: budget - totals.kcal,
          protein: Math.round((goals.protein - totals.protein) * 10) / 10,
          carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
          fat: Math.round((goals.fat - totals.fat) * 10) / 10,
        };
      },
      burnedToday: () =>
        get().exerciseLogs.reduce((a, e) => a + e.kcal, 0),
      fastingStatus: () => {
        const protocol =
          fastingProtocols.find((p) => p.id === get().fastingProtocolId) ??
          fastingProtocols[0];
        const started = get().fastingStartedAt;
        if (!started) {
          return {
            protocol,
            active: false,
            phase: "idle" as const,
            elapsedMin: 0,
            remainingMin: protocol.fastHours * 60,
          };
        }
        const elapsedMin = Math.floor(
          (Date.now() - new Date(started).getTime()) / 60000,
        );
        const cycleMin = (protocol.fastHours + protocol.eatHours) * 60;
        const inCycle = ((elapsedMin % cycleMin) + cycleMin) % cycleMin;
        const fastingMin = protocol.fastHours * 60;
        if (inCycle < fastingMin) {
          return {
            protocol,
            active: true,
            phase: "fasting" as const,
            elapsedMin: inCycle,
            remainingMin: fastingMin - inCycle,
          };
        }
        return {
          protocol,
          active: true,
          phase: "eating" as const,
          elapsedMin: inCycle - fastingMin,
          remainingMin: cycleMin - inCycle,
        };
      },
    }),
    { name: "farfurie-demo-v3" },
  ),
);

export { calcBmr, calcTdee, todayDayKey };

/**
 * Object-returning store getters must be wrapped with useShallow.
 * Zustand v5 + React 19 compare snapshots with Object.is; a new object
 * every call causes "Maximum update depth exceeded" (minified #185).
 */
export function useEffectiveGoals() {
  return useFarfurieStore(useShallow((s) => s.effectiveGoals()));
}

export function useTotals() {
  return useFarfurieStore(useShallow((s) => s.totals()));
}

export function useRemaining() {
  return useFarfurieStore(useShallow((s) => s.remaining()));
}
