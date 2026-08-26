import type { SubscriptionTier } from "@/domain/models";

export const FEATURES = {
  textLog: "free",
  barcode: "free",
  foodSearch: "free",
  customFoods: "free",
  water: "free",
  widgets: "free",
  teams: "free",
  reminders: "free",
  weightTracking: "free",
  nutrientCharts: "free",
  photoLog: "premium",
  voiceLog: "premium",
  aiFoodCreate: "premium",
  customMacros: "premium",
  dynamicCalories: "premium",
  healthSync: "premium",
  foodCompare: "premium",
  historyExport: "premium",
  autoMealPlan: "premium",
  mealPlanBuilder: "premium",
  personalizedRecipes: "premium",
  autoShopping: "premium",
  autoServings: "premium",
  syncedPlans: "premium",
  exportPlanPdf: "premium",
  dietType: "premium",
  bodyFat: "premium",
  bodyFatCalc: "premium",
  measurements: "premium",
  progressPhotos: "premium",
  fastingTimer: "premium",
  fastingReminders: "premium",
  fastingWidgets: "premium",
} as const;

export type FeatureId = keyof typeof FEATURES;

export function isPremium(tier: SubscriptionTier): boolean {
  return tier === "premium";
}

export function canUse(tier: SubscriptionTier, feature: FeatureId): boolean {
  if (FEATURES[feature] === "free") return true;
  return isPremium(tier);
}

export function featureTier(feature: FeatureId): "free" | "premium" {
  return FEATURES[feature];
}
