"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { Locale } from "./i18n";
import type { Macros } from "./foods";
import { macrosForGrams, resolveFood, type Food } from "./foods";
import { recipes } from "./recipes";
import type { FarfurieSnapshot } from "./snapshot";
import {
  calcBmr,
  calcCalorieGoal,
  calcMacroGoals,
  calcTdee,
  defaultProfile,
  type ProfileInput,
} from "./goals";
import { exercises, type FastingProtocol, fastingProtocols } from "./activity";
import {
  localISO,
  shiftISO,
  weekISODates,
  weekdayKeyFromISO,
} from "./dates";

export type MealKey = "breakfast" | "lunch" | "dinner" | "snack";

export type DiaryEntry = {
  id: string;
  date: string;
  meal: MealKey;
  nameRo: string;
  nameEn: string;
  macros: Macros;
  createdAt: string;
  grams?: number;
  foodId?: string;
};

export type WeightLog = {
  date: string;
  kg: number;
};

export type SavedMeal = {
  id: string;
  nameRo: string;
  nameEn: string;
  items: Array<{
    nameRo: string;
    nameEn: string;
    macros: Macros;
    meal: MealKey;
  }>;
};

export type ThemeName = "light" | "dark";

export type ShoppingItem = {
  id: string;
  nameRo: string;
  nameEn: string;
  checked: boolean;
  fromRecipeId?: string;
};

export type ExerciseLog = {
  id: string;
  date: string;
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
  selectedDate: string;
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
  theme: ThemeName;
  dayNotes: Record<string, string>;
  weightLogs: WeightLog[];
  savedMeals: SavedMeal[];
  recoveryUntil: string | null;
  lastAddedId: string | null;
  targetWeightKg: number;
  catalogFoods: Food[];
  setLocale: (locale: Locale) => void;
  toggleHoliday: () => void;
  setSelectedDate: (date: string) => void;
  shiftSelectedDate: (days: number) => void;
  goToToday: () => void;
  addWater: () => void;
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt" | "date"> & { date?: string }) => void;
  addFoodToMeal: (foodId: string, meal: MealKey, grams?: number) => void;
  addRecipeToMeal: (recipeId: string, meal: MealKey) => void;
  addCustomFood: (meal: MealKey, name: string, macros: Macros) => void;
  copyPreviousDay: () => number;
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
  totalsFor: (date: string) => Macros;
  totals: () => Macros;
  remaining: () => Macros;
  burnedOn: (date: string) => number;
  burnedToday: () => number;
  waterForSelected: () => number;
  currentStreak: () => number;
  weekKcal: () => number[];
  previousDayHasMeals: () => boolean;
  isRecovery: () => boolean;
  toggleTheme: () => void;
  setDayNote: (date: string, note: string) => void;
  logWeight: (kg: number) => void;
  undoLastEntry: () => void;
  saveMealFromSelected: (meal: MealKey, name: string) => void;
  addSavedMealToDiary: (id: string) => void;
  removeSavedMeal: (id: string) => void;
  startRecovery: () => void;
  stopRecovery: () => void;
  addSelectedDayToShopping: () => void;
  copyMealToDate: (meal: MealKey, targetDate: string) => number;
  setTargetWeight: (kg: number) => void;
  saveNamedMeal: (
    name: string,
    items: SavedMeal["items"],
  ) => void;
  addCatalogFood: (food: Food) => void;
  exportSnapshot: () => FarfurieSnapshot;
  importSnapshot: (snapshot: FarfurieSnapshot) => void;
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
const TODAY = localISO();
const YESTERDAY = shiftISO(TODAY, -1);

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
  return weekdayKeyFromISO(localISO()) as DayKey;
}

function emptyMacros(): Macros {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
}

function sumEntries(entries: DiaryEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.macros.kcal,
      protein: Math.round((acc.protein + e.macros.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.macros.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.macros.fat) * 10) / 10,
    }),
    emptyMacros(),
  );
}

export const useFarfurieStore = create<State>()(
  persist(
    (set, get) => ({
      locale: "ro",
      holidayMode: false,
      selectedDate: TODAY,
      waterByDate: { [TODAY]: 750, [YESTERDAY]: 1750 },
      onboardingDone: false,
      weekPlan: emptyWeekPlan(),
      theme: "light",
      dayNotes: {},
      weightLogs: [
        { date: shiftISO(TODAY, -14), kg: 69.4 },
        { date: shiftISO(TODAY, -7), kg: 68.8 },
        { date: TODAY, kg: 68 },
      ],
      savedMeals: [
        {
          id: "saved-birou",
          nameRo: "Prânz de birou",
          nameEn: "Office lunch",
          items: [
            {
              meal: "lunch",
              nameRo: "Conservă ton Scandia",
              nameEn: "Scandia tuna",
              macros: { kcal: 120, protein: 27.6, carbs: 0, fat: 1.2 },
            },
            {
              meal: "lunch",
              nameRo: "Pâine neagră",
              nameEn: "Dark bread",
              macros: { kcal: 88, protein: 2.8, carbs: 16, fat: 1 },
            },
          ],
        },
      ],
      recoveryUntil: null,
      lastAddedId: null,
      targetWeightKg: 64,
      catalogFoods: [],
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
          id: "seed-y1",
          date: YESTERDAY,
          meal: "dinner",
          nameRo: "Sarmale light",
          nameEn: "Light cabbage rolls",
          macros: { kcal: 420, protein: 28, carbs: 32, fat: 18 },
          createdAt: new Date().toISOString(),
        },
        {
          id: "seed-1",
          date: TODAY,
          meal: "breakfast",
          nameRo: "Ovăz cu iaurt Napolact și mere",
          nameEn: "Oats with Napolact yogurt and apple",
          macros: { kcal: 340, protein: 14, carbs: 52, fat: 9 },
          createdAt: new Date().toISOString(),
        },
        {
          id: "seed-2",
          date: TODAY,
          meal: "lunch",
          nameRo: "Piept de pui la grătar",
          nameEn: "Grilled chicken breast",
          macros: { kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 },
          createdAt: new Date().toISOString(),
        },
      ],
      setLocale: (locale) => set({ locale }),
      toggleHoliday: () => set((s) => ({ holidayMode: !s.holidayMode })),
      setSelectedDate: (date) => {
        if (date > shiftISO(localISO(), 7)) return;
        set({ selectedDate: date });
      },
      shiftSelectedDate: (days) => {
        const next = shiftISO(get().selectedDate, days);
        if (next > shiftISO(localISO(), 7)) return;
        set({ selectedDate: next });
      },
      goToToday: () => set({ selectedDate: localISO() }),
      addWater: () =>
        set((s) => {
          const date = s.selectedDate;
          const current = s.waterByDate[date] ?? 0;
          return {
            waterByDate: {
              ...s.waterByDate,
              [date]: Math.min(current + 250, 5000),
            },
          };
        }),
      addEntry: (entry) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({
          lastAddedId: id,
          entries: [
            ...s.entries,
            {
              date: s.selectedDate,
              ...entry,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },
      addFoodToMeal: (foodId, meal, grams) => {
        const food = resolveFood(foodId, get().catalogFoods);
        if (!food) return;
        const g = grams ?? food.defaultGrams;
        const macros = macrosForGrams(food, g);
        get().addEntry({
          meal,
          foodId,
          grams: g,
          nameRo: `${food.nameRo} · ${g}g`,
          nameEn: `${food.nameEn} · ${g}g`,
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
      addCustomFood: (meal, name, macros) => {
        const trimmed = name.trim();
        if (!trimmed || macros.kcal <= 0) return;
        get().addEntry({
          meal,
          nameRo: trimmed,
          nameEn: trimmed,
          macros,
        });
      },
      copyPreviousDay: () => {
        const target = get().selectedDate;
        const source = shiftISO(target, -1);
        const from = get().entries.filter((e) => e.date === source);
        from.forEach((e) =>
          get().addEntry({
            date: target,
            meal: e.meal,
            nameRo: e.nameRo,
            nameEn: e.nameEn,
            macros: e.macros,
          }),
        );
        return from.length;
      },
      removeEntry: (id) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
          lastAddedId: s.lastAddedId === id ? null : s.lastAddedId,
        })),
      undoLastEntry: () => {
        const id = get().lastAddedId;
        if (id) get().removeEntry(id);
      },
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setDayNote: (date, note) =>
        set((s) => ({ dayNotes: { ...s.dayNotes, [date]: note } })),
      logWeight: (kg) => {
        if (kg < 30 || kg > 250) return;
        const date = get().selectedDate;
        set((s) => ({
          weightLogs: [
            ...s.weightLogs.filter((w) => w.date !== date),
            { date, kg: Math.round(kg * 10) / 10 },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },
      saveMealFromSelected: (meal, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const items = get().entries.filter(
          (e) => e.date === get().selectedDate && e.meal === meal,
        );
        if (items.length === 0) return;
        set((s) => ({
          savedMeals: [
            ...s.savedMeals,
            {
              id: `meal-${Date.now()}`,
              nameRo: trimmed,
              nameEn: trimmed,
              items: items.map((e) => ({
                meal: e.meal,
                nameRo: e.nameRo,
                nameEn: e.nameEn,
                macros: e.macros,
              })),
            },
          ],
        }));
      },
      addSavedMealToDiary: (id) => {
        const meal = get().savedMeals.find((m) => m.id === id);
        if (!meal) return;
        meal.items.forEach((item) => get().addEntry({ ...item }));
      },
      removeSavedMeal: (id) =>
        set((s) => ({ savedMeals: s.savedMeals.filter((m) => m.id !== id) })),
      startRecovery: () =>
        set({
          holidayMode: false,
          recoveryUntil: shiftISO(localISO(), 1),
        }),
      stopRecovery: () => set({ recoveryUntil: null }),
      addSelectedDayToShopping: () => {
        const date = get().selectedDate;
        const items = get()
          .entries.filter((e) => e.date === date)
          .map((e) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            nameRo: e.nameRo,
            nameEn: e.nameEn,
            checked: false,
          }));
        set((s) => ({ shopping: [...s.shopping, ...items] }));
      },
      copyMealToDate: (meal, targetDate) => {
        if (targetDate > shiftISO(localISO(), 7)) return 0;
        const source = get().selectedDate;
        const items = get().entries.filter((e) => e.date === source && e.meal === meal);
        items.forEach((e) =>
          get().addEntry({
            date: targetDate,
            meal: e.meal,
            nameRo: e.nameRo,
            nameEn: e.nameEn,
            macros: e.macros,
            grams: e.grams,
            foodId: e.foodId,
          }),
        );
        return items.length;
      },
      setTargetWeight: (kg) => {
        if (kg < 30 || kg > 250) return;
        set({ targetWeightKg: Math.round(kg * 10) / 10 });
      },
      saveNamedMeal: (name, items) => {
        const trimmed = name.trim();
        if (!trimmed || items.length === 0) return;
        set((s) => ({
          savedMeals: [
            ...s.savedMeals,
            {
              id: `meal-${Date.now()}`,
              nameRo: trimmed,
              nameEn: trimmed,
              items,
            },
          ],
        }));
      },
      addCatalogFood: (food) =>
        set((s) => ({
          catalogFoods: [
            food,
            ...s.catalogFoods.filter((f) => f.id !== food.id && f.ean !== food.ean),
          ].slice(0, 200),
        })),
      exportSnapshot: () => {
        const s = get();
        return {
          v: 1,
          updatedAt: new Date().toISOString(),
          locale: s.locale,
          holidayMode: s.holidayMode,
          waterByDate: s.waterByDate,
          entries: s.entries,
          profile: s.profile,
          goals: s.goals,
          favoriteRecipeIds: s.favoriteRecipeIds,
          favoriteFoodIds: s.favoriteFoodIds,
          shopping: s.shopping,
          fastingProtocolId: s.fastingProtocolId,
          fastingStartedAt: s.fastingStartedAt,
          exerciseLogs: s.exerciseLogs,
          onboardingDone: s.onboardingDone,
          weekPlan: s.weekPlan,
          theme: s.theme,
          dayNotes: s.dayNotes,
          weightLogs: s.weightLogs,
          savedMeals: s.savedMeals,
          recoveryUntil: s.recoveryUntil,
          targetWeightKg: s.targetWeightKg,
          catalogFoods: s.catalogFoods,
        };
      },
      importSnapshot: (snapshot) => {
        set({
          locale: snapshot.locale,
          holidayMode: snapshot.holidayMode,
          waterByDate: snapshot.waterByDate,
          entries: snapshot.entries,
          profile: snapshot.profile,
          goals: snapshot.goals,
          favoriteRecipeIds: snapshot.favoriteRecipeIds,
          favoriteFoodIds: snapshot.favoriteFoodIds,
          shopping: snapshot.shopping,
          fastingProtocolId: snapshot.fastingProtocolId,
          fastingStartedAt: snapshot.fastingStartedAt,
          exerciseLogs: snapshot.exerciseLogs,
          onboardingDone: snapshot.onboardingDone,
          weekPlan: snapshot.weekPlan,
          theme: snapshot.theme,
          dayNotes: snapshot.dayNotes,
          weightLogs: snapshot.weightLogs,
          savedMeals: snapshot.savedMeals,
          recoveryUntil: snapshot.recoveryUntil,
          targetWeightKg: snapshot.targetWeightKg,
          catalogFoods: snapshot.catalogFoods,
          lastAddedId: null,
          selectedDate: localISO(),
        });
      },
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
        const day = weekdayKeyFromISO(get().selectedDate) as DayKey;
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
              date: localISO(),
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
        const recovery = get().isRecovery();
        const holiday = get().holidayMode;
        const kcal = holiday ? Math.round(base.kcal * 1.15) : base.kcal;
        return {
          kcal,
          protein: recovery ? Math.round(base.protein * 1.1) : base.protein,
          carbs: holiday ? Math.round(base.carbs * 1.15) : base.carbs,
          fat: holiday ? Math.round(base.fat * 1.15) : base.fat,
          waterMl: base.waterMl,
        };
      },
      totalsFor: (date) =>
        sumEntries(get().entries.filter((e) => e.date === date)),
      totals: () => get().totalsFor(get().selectedDate),
      remaining: () => {
        const goals = get().effectiveGoals();
        const totals = get().totals();
        const burned = get().burnedToday();
        const budget = goals.kcal + burned;
        return {
          kcal: budget - totals.kcal,
          protein: Math.round((goals.protein - totals.protein) * 10) / 10,
          carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
          fat: Math.round((goals.fat - totals.fat) * 10) / 10,
        };
      },
      burnedOn: (date) =>
        get()
          .exerciseLogs.filter((e) => e.date === date)
          .reduce((a, e) => a + e.kcal, 0),
      burnedToday: () => get().burnedOn(get().selectedDate),
      waterForSelected: () => get().waterByDate[get().selectedDate] ?? 0,
      currentStreak: () => {
        const days = new Set(get().entries.map((e) => e.date));
        let cursor = localISO();
        if (!days.has(cursor)) cursor = shiftISO(cursor, -1);
        let streak = 0;
        while (days.has(cursor)) {
          streak += 1;
          cursor = shiftISO(cursor, -1);
        }
        return streak;
      },
      weekKcal: () =>
        weekISODates(localISO()).map((iso) => get().totalsFor(iso).kcal),
      previousDayHasMeals: () => {
        const prev = shiftISO(get().selectedDate, -1);
        return get().entries.some((e) => e.date === prev);
      },
      isRecovery: () => {
        const until = get().recoveryUntil;
        return !!until && localISO() <= until;
      },
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
      name: "farfurie-demo-v3",
      version: 7,
      skipHydration: true,
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Record<string, unknown>;
        const today = localISO();
        const stampDate = (row: Record<string, unknown>) => ({
          ...row,
          date:
            typeof row.date === "string"
              ? row.date
              : typeof row.createdAt === "string"
                ? String(row.createdAt).slice(0, 10)
                : today,
        });
        const entries = Array.isArray(s.entries)
          ? (s.entries as Record<string, unknown>[]).map(stampDate)
          : [];
        const exerciseLogs = Array.isArray(s.exerciseLogs)
          ? (s.exerciseLogs as Record<string, unknown>[]).map(stampDate)
          : [];
        const waterByDate =
          s.waterByDate && typeof s.waterByDate === "object"
            ? (s.waterByDate as Record<string, number>)
            : { [today]: typeof s.waterMl === "number" ? s.waterMl : 0 };
        return {
          ...s,
          entries,
          exerciseLogs,
          waterByDate,
          selectedDate: today,
          theme: s.theme === "dark" ? "dark" : "light",
          dayNotes: s.dayNotes && typeof s.dayNotes === "object" ? s.dayNotes : {},
          weightLogs: Array.isArray(s.weightLogs) ? s.weightLogs : [],
          savedMeals: Array.isArray(s.savedMeals) ? s.savedMeals : [],
          recoveryUntil: typeof s.recoveryUntil === "string" ? s.recoveryUntil : null,
          lastAddedId: null,
          targetWeightKg: typeof s.targetWeightKg === "number" ? s.targetWeightKg : 64,
          catalogFoods: Array.isArray(s.catalogFoods) ? s.catalogFoods : [],
        } as never;
      },
      onRehydrateStorage: () => () => {
        useFarfurieStore.setState({ selectedDate: localISO() });
      },
    },
  ),
);

export { calcBmr, calcTdee, todayDayKey, localISO, shiftISO };

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
