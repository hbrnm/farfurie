export type Sex = "female" | "male";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";
export type GoalType = "lose" | "maintain" | "gain";
export type DietStyle = "balanced" | "highProtein" | "lowCarb" | "keto";
export type ProgramMode = "coached" | "manual";

export type ProfileInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: GoalType;
};

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/** Mifflin–St Jeor */
export function calcBmr(p: ProfileInput): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

export function calcTdee(p: ProfileInput): number {
  return Math.round(calcBmr(p) * ACTIVITY_MULT[p.activity]);
}

export function calcCalorieGoal(p: ProfileInput): number {
  const tdee = calcTdee(p);
  if (p.goal === "lose") return Math.max(1200, tdee - 400);
  if (p.goal === "gain") return tdee + 300;
  return tdee;
}

export function floorKcal(sex: Sex) {
  return sex === "male" ? 1500 : 1200;
}

/** Don't starve a day when the weekly bank is overspent. */
export function dayKcalFloor(p: ProfileInput) {
  return Math.max(floorKcal(p.sex), Math.round(calcBmr(p) * 1.1));
}

export function macrosForStyle(
  kcal: number,
  weightKg: number,
  style: DietStyle = "balanced",
) {
  const waterMl = Math.round(weightKg * 35);
  if (style === "highProtein") {
    const protein = Math.round(weightKg * 2.2);
    const fat = Math.round((kcal * 0.25) / 9);
    const carbs = Math.max(70, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat, waterMl };
  }
  if (style === "lowCarb") {
    const protein = Math.round(weightKg * 2);
    const fat = Math.round((kcal * 0.4) / 9);
    const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat, waterMl };
  }
  if (style === "keto") {
    const protein = Math.round(weightKg * 1.8);
    const carbs = 30;
    const fat = Math.max(40, Math.round((kcal - protein * 4 - carbs * 4) / 9));
    return { kcal, protein, carbs, fat, waterMl };
  }
  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((kcal * 0.28) / 9);
  const carbs = Math.max(80, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat, waterMl };
}

export function calcMacroGoals(kcal: number, weightKg: number) {
  return macrosForStyle(kcal, weightKg, "balanced");
}

export const WEEKLY_RATE_OPTIONS = [0.25, 0.5, 0.75, 1] as const;

export const defaultProfile: ProfileInput = {
  sex: "female",
  age: 32,
  heightCm: 168,
  weightKg: 68,
  activity: "light",
  goal: "maintain",
};
