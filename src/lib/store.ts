"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./i18n";
import { foods, macrosForGrams, type Food, type Macros } from "./foods";
import { recipes } from "./recipes";
import {
  calcBmr,
  calcCalorieGoal,
  calcMacroGoals,
  calcTdee,
  clampProfile,
  defaultProfile,
  type ProfileInput,
} from "./goals";
import { exercises, type FastingProtocol, fastingProtocols } from "./activity";
import { localDateKey } from "./dates";
import {
  dateKeyOf,
  onDate,
  pickGapMeal,
  recipeAlreadyOnMeal,
  remainingMacros,
  shoppingHasIngredient,
  sumMacros,
  type MealKey,
} from "./diary";
import { defaultPotMembers, type PotMember } from "./pot";
import type { SubscriptionTier, WeightLog, BodyFatLog, BodyMeasurements, ProgressPhoto, DietType, CustomFoodInput } from "@/domain/models";
import { canUse } from "./entitlements";

export type { MealKey, PotMember };

export type DiaryEntry = {
  id: string;
  meal: MealKey;
  nameRo: string;
  nameEn: string;
  macros: Macros;
  createdAt: string;
  dateKey: string;
  recipeId?: string;
  foodId?: string;
  grams?: number;
  source?: "text" | "barcode" | "search" | "recipe" | "custom" | "photo" | "voice" | "ai";
  barcode?: string;
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
  dateKey: string;
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
  waterByDate: Record<string, number>;
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
  potMembers: PotMember[];
  subscriptionTier: SubscriptionTier;
  customMacros: (Macros & { waterMl: number }) | null;
  useCustomMacros: boolean;
  waterGoalMl: number | null;
  customFoods: Food[];
  weightLogs: WeightLog[];
  bodyFatLogs: BodyFatLog[];
  measurements: BodyMeasurements[];
  progressPhotos: ProgressPhoto[];
  dietType: DietType | null;
  reminders: { meals: boolean; water: boolean; weigh: boolean };
  setLocale: (locale: Locale) => void;
  toggleHoliday: () => void;
  addWater: () => void;
  addEntry: (
    entry: Omit<DiaryEntry, "id" | "createdAt" | "dateKey"> & { dateKey?: string },
  ) => void;
  addFoodToMeal: (foodId: string, meal: MealKey, grams?: number) => void;
  addRecipeToMeal: (recipeId: string, meal: MealKey) => void;
  removeEntry: (id: string) => void;
  setProfile: (profile: ProfileInput) => void;
  applyProfileGoals: () => void;
  completeOnboarding: () => void;
  setPlanSlot: (day: DayKey, meal: MealKey, recipeId: string | null) => void;
  applyTodayPlanToDiary: () => number;
  addWeekPlanToShopping: () => void;
  toggleFavoriteRecipe: (id: string) => void;
  toggleFavoriteFood: (id: string) => void;
  addRecipeToShopping: (recipeId: string) => number;
  toggleShoppingItem: (id: string) => void;
  clearCheckedShopping: () => void;
  clearShopping: () => void;
  setFastingProtocol: (id: string) => void;
  startFasting: () => void;
  stopFasting: () => void;
  logExercise: (exerciseId: string, minutes: number) => void;
  removeExercise: (id: string) => void;
  setPotMembers: (members: PotMember[]) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setCustomMacros: (macros: (Macros & { waterMl: number }) | null) => void;
  setUseCustomMacros: (on: boolean) => void;
  setWaterGoalMl: (ml: number) => void;
  addCustomFood: (food: CustomFoodInput) => void;
  addWeightLog: (kg: number, dateKey?: string) => void;
  addBodyFatLog: (percent: number) => void;
  addMeasurements: (m: Omit<BodyMeasurements, "id" | "createdAt">) => void;
  addProgressPhoto: (dataUrl: string) => void;
  setDietType: (diet: DietType | null) => void;
  setReminders: (r: { meals: boolean; water: boolean; weigh: boolean }) => void;
  generateAutoPlan: () => number;
  resetToday: () => void;
  resetAllLogs: () => void;
  exportPayload: () => Record<string, unknown>;
  todayEntries: () => DiaryEntry[];
  todayWater: () => number;
  gapMeal: () => MealKey;
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
  const clamped = clampProfile(profile);
  const kcal = calcCalorieGoal(clamped);
  return calcMacroGoals(kcal, clamped.weightKg);
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

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFarfurieStore = create<State>()(
  persist(
    (set, get) => ({
      locale: "ro",
      holidayMode: false,
      waterByDate: {},
      onboardingDone: false,
      weekPlan: emptyWeekPlan(),
      profile: defaultProfile,
      goals: INITIAL_GOALS,
      favoriteRecipeIds: [],
      favoriteFoodIds: [],
      shopping: [],
      fastingProtocolId: "16-8",
      fastingStartedAt: null,
      exerciseLogs: [],
      entries: [],
      potMembers: defaultPotMembers(),
      subscriptionTier: "free",
      customMacros: null,
      useCustomMacros: false,
      waterGoalMl: null,
      customFoods: [],
      weightLogs: [],
      bodyFatLogs: [],
      measurements: [],
      progressPhotos: [],
      dietType: null,
      reminders: { meals: false, water: false, weigh: false },
      setLocale: (locale) => set({ locale }),
      toggleHoliday: () => set((s) => ({ holidayMode: !s.holidayMode })),
      addWater: () =>
        set((s) => {
          const day = localDateKey();
          const current = s.waterByDate[day] ?? 0;
          return {
            waterByDate: {
              ...s.waterByDate,
              [day]: Math.min(current + 250, 5000),
            },
          };
        }),
      addEntry: (entry) =>
        set((s) => {
          const createdAt = new Date().toISOString();
          return {
            entries: [
              ...s.entries,
              {
                ...entry,
                id: newId(),
                createdAt,
                dateKey: entry.dateKey ?? localDateKey(),
              },
            ],
          };
        }),
      addFoodToMeal: (foodId, meal, grams) => {
        const food =
          foods.find((f) => f.id === foodId) ??
          get().customFoods.find((f) => f.id === foodId);
        if (!food) return;
        const g = grams ?? food.defaultGrams;
        const macros = macrosForGrams(food, g);
        get().addEntry({
          meal,
          nameRo: food.nameRo,
          nameEn: food.nameEn,
          macros,
          foodId,
          grams: g,
          source: "search",
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
          recipeId,
          source: "recipe",
        });
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      setProfile: (profile) => set({ profile: clampProfile(profile) }),
      applyProfileGoals: () => {
        const profile = clampProfile(get().profile);
        const goals = goalsFromProfile(profile);
        set({ profile, goals });
      },
      completeOnboarding: () => {
        const profile = clampProfile(get().profile);
        const goals = goalsFromProfile(profile);
        set({
          profile,
          goals,
          onboardingDone: true,
          entries: [],
          waterByDate: {},
          exerciseLogs: [],
          shopping: [],
        });
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
        const today = onDate(get().entries, localDateKey());
        let added = 0;
        (Object.entries(slots) as [MealKey, string][]).forEach(([meal, recipeId]) => {
          if (!recipeId) return;
          if (recipeAlreadyOnMeal(today, meal, recipeId)) return;
          get().addRecipeToMeal(recipeId, meal);
          added += 1;
        });
        return added;
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
        if (!recipe) return 0;
        const existing = get().shopping;
        const items: ShoppingItem[] = recipe.ingredientsRo.flatMap((nameRo, i) => {
          if (shoppingHasIngredient(existing, recipeId, nameRo)) return [];
          return [
            {
              id: `${newId()}-${i}`,
              nameRo,
              nameEn: recipe.ingredientsEn[i] ?? nameRo,
              checked: false,
              fromRecipeId: recipeId,
            },
          ];
        });
        if (items.length === 0) return 0;
        set((s) => ({ shopping: [...s.shopping, ...items] }));
        return items.length;
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
        const createdAt = new Date().toISOString();
        set((s) => ({
          exerciseLogs: [
            ...s.exerciseLogs,
            {
              id: newId(),
              exerciseId,
              nameRo: ex.nameRo,
              nameEn: ex.nameEn,
              minutes,
              kcal,
              createdAt,
              dateKey: localDateKey(),
            },
          ],
        }));
      },
      removeExercise: (id) =>
        set((s) => ({
          exerciseLogs: s.exerciseLogs.filter((e) => e.id !== id),
        })),
      setPotMembers: (members) => set({ potMembers: members }),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      setCustomMacros: (macros) => set({ customMacros: macros, useCustomMacros: Boolean(macros) }),
      setUseCustomMacros: (on) => set({ useCustomMacros: on }),
      setWaterGoalMl: (ml) => set({ waterGoalMl: Math.min(5000, Math.max(500, Math.round(ml))) }),
      addCustomFood: (input) =>
        set((s) => ({
          customFoods: [
            ...s.customFoods,
            {
              id: `custom-${newId()}`,
              nameRo: input.nameRo,
              nameEn: input.nameEn || input.nameRo,
              category: "custom",
              per100g: input.per100g,
              defaultGrams: input.defaultGrams || 100,
              unitRo: "porție",
              unitEn: "serving",
              tags: ["custom"],
              barcode: input.barcode,
            },
          ],
        })),
      addWeightLog: (kg, dateKey) =>
        set((s) => ({
          weightLogs: [
            ...s.weightLogs.filter((w) => w.dateKey !== (dateKey ?? localDateKey())),
            {
              id: newId(),
              dateKey: dateKey ?? localDateKey(),
              kg,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      addBodyFatLog: (percent) =>
        set((s) => ({
          bodyFatLogs: [
            ...s.bodyFatLogs,
            {
              id: newId(),
              dateKey: localDateKey(),
              percent,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      addMeasurements: (m) =>
        set((s) => ({
          measurements: [
            ...s.measurements,
            { ...m, id: newId(), createdAt: new Date().toISOString() },
          ],
        })),
      addProgressPhoto: (dataUrl) =>
        set((s) => ({
          progressPhotos: [
            ...s.progressPhotos.slice(-3),
            {
              id: newId(),
              dateKey: localDateKey(),
              dataUrl,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      setDietType: (diet) => set({ dietType: diet }),
      setReminders: (r) => set({ reminders: r }),
      generateAutoPlan: () => {
        if (!canUse(get().subscriptionTier, "autoMealPlan")) return 0;
        const goals = get().effectiveGoals();
        const picks = recipes.slice(0, 4);
        const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];
        const day = todayDayKey();
        picks.forEach((recipe, i) => {
          const meal = meals[i] ?? "snack";
          if (recipe.perServing.kcal < goals.kcal) {
            get().setPlanSlot(day, meal, recipe.id);
          }
        });
        return picks.length;
      },
      resetToday: () =>
        set((s) => {
          const day = localDateKey();
          const waterByDate = { ...s.waterByDate };
          delete waterByDate[day];
          return {
            entries: s.entries.filter((e) => dateKeyOf(e) !== day),
            exerciseLogs: s.exerciseLogs.filter((e) => dateKeyOf(e) !== day),
            waterByDate,
          };
        }),
      resetAllLogs: () =>
        set({
          entries: [],
          exerciseLogs: [],
          waterByDate: {},
          shopping: [],
        }),
      exportPayload: () => {
        const s = get();
        return {
          exportedAt: new Date().toISOString(),
          locale: s.locale,
          profile: s.profile,
          goals: s.goals,
          entries: s.entries,
          waterByDate: s.waterByDate,
          exerciseLogs: s.exerciseLogs,
          shopping: s.shopping,
          weekPlan: s.weekPlan,
          holidayMode: s.holidayMode,
        };
      },
      todayEntries: () => onDate(get().entries, localDateKey()),
      todayWater: () => get().waterByDate[localDateKey()] ?? 0,
      gapMeal: () => pickGapMeal(get().todayEntries()),
      baseGoals: () => get().goals,
      effectiveGoals: () => {
        const s = get();
        const base =
          s.useCustomMacros && s.customMacros && canUse(s.subscriptionTier, "customMacros")
            ? s.customMacros
            : s.goals;
        const withWater = {
          ...base,
          waterMl: s.waterGoalMl ?? base.waterMl,
        };
        if (!s.holidayMode) return withWater;
        return {
          kcal: Math.round(withWater.kcal * 1.15),
          protein: withWater.protein,
          carbs: Math.round(withWater.carbs * 1.15),
          fat: Math.round(withWater.fat * 1.15),
          waterMl: withWater.waterMl,
        };
      },
      totals: () => sumMacros(get().todayEntries()),
      remaining: () => remainingMacros(get().effectiveGoals(), get().totals()),
      burnedToday: () =>
        onDate(get().exerciseLogs, localDateKey()).reduce((a, e) => a + e.kcal, 0),
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
    {
      name: "farfurie-v4",
      version: 1,
      migrate: (persisted) => {
        const data = persisted as Record<string, unknown>;
        const entries = Array.isArray(data.entries) ? data.entries : [];
        data.entries = (entries as DiaryEntry[])
          .filter((e) => !String(e.id).startsWith("seed-"))
          .map((e) => ({
            ...e,
            dateKey: e.dateKey ?? dateKeyOf(e),
          }));
        const logs = Array.isArray(data.exerciseLogs) ? data.exerciseLogs : [];
        data.exerciseLogs = (logs as ExerciseLog[]).map((e) => ({
          ...e,
          dateKey: e.dateKey ?? dateKeyOf(e),
        }));
        if (!data.waterByDate || typeof data.waterByDate !== "object") {
          const old = typeof data.waterMl === "number" ? data.waterMl : 0;
          data.waterByDate = old > 0 ? { [localDateKey()]: old } : {};
        }
        delete data.streak;
        delete data.waterMl;
        if (!Array.isArray(data.potMembers)) data.potMembers = defaultPotMembers();
        if (data.subscriptionTier !== "premium") data.subscriptionTier = "free";
        if (!Array.isArray(data.customFoods)) data.customFoods = [];
        if (!Array.isArray(data.weightLogs)) data.weightLogs = [];
        if (!Array.isArray(data.bodyFatLogs)) data.bodyFatLogs = [];
        if (!Array.isArray(data.measurements)) data.measurements = [];
        if (!Array.isArray(data.progressPhotos)) data.progressPhotos = [];
        if (!data.reminders) data.reminders = { meals: false, water: false, weigh: false };
        if (Array.isArray(data.shopping)) {
          data.shopping = (data.shopping as ShoppingItem[]).filter(
            (i) => !String(i.id).startsWith("seed-"),
          );
        }
        return data as unknown as State;
      },
    },
  ),
);

export { calcBmr, calcTdee, todayDayKey };
