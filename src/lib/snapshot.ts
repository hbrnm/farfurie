import type { Food, Macros } from "@/lib/foods";
import type { Locale } from "@/lib/i18n";
import type { ProfileInput } from "@/lib/goals";

export type SnapshotMeal = "breakfast" | "lunch" | "dinner" | "snack";
export type SnapshotDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type FarfurieSnapshot = {
  v: 1;
  updatedAt: string;
  locale: Locale;
  holidayMode: boolean;
  waterByDate: Record<string, number>;
  entries: Array<{
    id: string;
    date: string;
    meal: SnapshotMeal;
    nameRo: string;
    nameEn: string;
    macros: Macros;
    createdAt: string;
    grams?: number;
    foodId?: string;
  }>;
  profile: ProfileInput;
  goals: Macros & { waterMl: number };
  favoriteRecipeIds: string[];
  favoriteFoodIds: string[];
  shopping: Array<{
    id: string;
    nameRo: string;
    nameEn: string;
    checked: boolean;
    fromRecipeId?: string;
  }>;
  fastingProtocolId: string;
  fastingStartedAt: string | null;
  exerciseLogs: Array<{
    id: string;
    date: string;
    exerciseId: string;
    nameRo: string;
    nameEn: string;
    minutes: number;
    kcal: number;
    createdAt: string;
  }>;
  onboardingDone: boolean;
  weekPlan: Record<SnapshotDay, Partial<Record<SnapshotMeal, string>>>;
  theme: "light" | "dark";
  dayNotes: Record<string, string>;
  weightLogs: Array<{ date: string; kg: number }>;
  savedMeals: Array<{
    id: string;
    nameRo: string;
    nameEn: string;
    items: Array<{
      nameRo: string;
      nameEn: string;
      macros: Macros;
      meal: SnapshotMeal;
    }>;
  }>;
  recoveryUntil: string | null;
  targetWeightKg: number;
  catalogFoods: Food[];
};

export function isSnapshot(value: unknown): value is FarfurieSnapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as FarfurieSnapshot;
  return s.v === 1 && Array.isArray(s.entries) && Array.isArray(s.catalogFoods);
}
