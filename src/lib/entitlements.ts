import type { SubscriptionTier } from "@/domain/models";

/** R1: real local features are free. Mocks stay premium and are hidden from the UI. */
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
  customMacros: "free",
  historyExport: "free",
  autoShopping: "free",
  fastingTimer: "free",
  photoLog: "premium",
  voiceLog: "premium",
  aiFoodCreate: "premium",
  dynamicCalories: "premium",
  healthSync: "premium",
  foodCompare: "premium",
  autoMealPlan: "premium",
  mealPlanBuilder: "premium",
  personalizedRecipes: "premium",
  autoServings: "premium",
  syncedPlans: "premium",
  exportPlanPdf: "premium",
  dietType: "premium",
  bodyFat: "premium",
  bodyFatCalc: "premium",
  measurements: "premium",
  progressPhotos: "premium",
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
