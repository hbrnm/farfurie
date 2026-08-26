import type { Macros } from "@/lib/foods";
import type { MealKey } from "@/lib/diary";
import type { ProfileInput } from "@/lib/goals";
import type { Locale } from "@/lib/i18n";

export type SubscriptionTier = "free" | "premium";

export type Subscription = {
  tier: SubscriptionTier;
  startedAt: string | null;
};

export type User = {
  id: string;
  locale: Locale;
  profile: ProfileInput;
  subscription: Subscription;
  /** When set (Premium), overrides calculated BMR/TDEE targets. */
  customMacros: (Macros & { waterMl: number }) | null;
  waterGoalMl: number | null;
};

export type FoodLogSource =
  | "text"
  | "barcode"
  | "search"
  | "recipe"
  | "custom"
  | "photo"
  | "voice"
  | "ai";

export type FoodLog = {
  id: string;
  userId: string;
  dateKey: string;
  meal: MealKey;
  source: FoodLogSource;
  nameRo: string;
  nameEn: string;
  macros: Macros;
  grams?: number;
  foodId?: string;
  recipeId?: string;
  barcode?: string;
  createdAt: string;
};

export type DietType =
  | "balanced"
  | "high-protein"
  | "low-carb"
  | "keto"
  | "low-fat";

export type MealPlanSlot = {
  meal: MealKey;
  recipeId: string;
  servings: number;
};

export type MealPlan = {
  id: string;
  userId: string;
  weekStart: string;
  dietType: DietType | null;
  syncedGroupId: string | null;
  days: Record<string, MealPlanSlot[]>;
};

export type WeightLog = {
  id: string;
  dateKey: string;
  kg: number;
  createdAt: string;
};

export type BodyFatLog = {
  id: string;
  dateKey: string;
  percent: number;
  createdAt: string;
};

export type BodyMeasurements = {
  id: string;
  dateKey: string;
  waistCm: number;
  hipsCm: number;
  armsCm: number;
  thighsCm: number;
  chestCm: number;
  neckCm: number;
  createdAt: string;
};

export type ProgressPhoto = {
  id: string;
  dateKey: string;
  dataUrl: string;
  createdAt: string;
};

export type ProgressLog = {
  weight: WeightLog[];
  bodyFat: BodyFatLog[];
  measurements: BodyMeasurements[];
  photos: ProgressPhoto[];
};

export type FastingSession = {
  id: string;
  protocolId: string;
  fastHours: number;
  eatHours: number;
  startedAt: string;
  endedAt: string | null;
  status: "active" | "idle";
};

export type CustomFoodInput = {
  nameRo: string;
  nameEn: string;
  per100g: Macros;
  defaultGrams: number;
  barcode?: string;
};

export type TeamChallenge = {
  id: string;
  nameRo: string;
  nameEn: string;
  members: number;
  joined: boolean;
};
