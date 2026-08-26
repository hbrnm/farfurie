export type Sex = "female" | "male";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";
export type GoalType = "lose" | "maintain" | "gain";

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

export function calorieFloor(sex: Sex): number {
  return sex === "male" ? 1500 : 1200;
}

export function calcCalorieGoal(p: ProfileInput): number {
  const tdee = calcTdee(p);
  const floor = calorieFloor(p.sex);
  if (p.goal === "lose") return Math.max(floor, tdee - 400);
  if (p.goal === "gain") return tdee + 300;
  return tdee;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function clampProfile(p: ProfileInput): ProfileInput {
  return {
    ...p,
    age: Math.round(clamp(p.age, 14, 100)),
    heightCm: Math.round(clamp(p.heightCm, 120, 230)),
    weightKg: Math.round(clamp(p.weightKg, 35, 250) * 10) / 10,
  };
}

export function calcMacroGoals(kcal: number, weightKg: number) {
  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((kcal * 0.28) / 9);
  const carbsRaw = Math.round((kcal - protein * 4 - fat * 9) / 4);
  const floorWouldBe = protein * 4 + 80 * 4 + fat * 9;
  const carbs =
    carbsRaw >= 80
      ? carbsRaw
      : floorWouldBe > kcal + 20
        ? Math.max(carbsRaw, 0)
        : 80;
  return {
    kcal,
    protein,
    carbs,
    fat,
    waterMl: Math.round(weightKg * 35),
  };
}

export const defaultProfile: ProfileInput = {
  sex: "female",
  age: 32,
  heightCm: 168,
  weightKg: 68,
  activity: "light",
  goal: "maintain",
};
