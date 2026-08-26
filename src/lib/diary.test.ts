import { describe, expect, it } from "vitest";
import { lastNDateKeys, localDateKey, shiftDateKey } from "./dates";
import {
  calcStreak,
  pickGapMeal,
  remainingMacros,
  recipeAlreadyOnMeal,
  shoppingHasIngredient,
  sumMacros,
} from "./diary";
import { calorieFloor, calcCalorieGoal, calcMacroGoals, clampProfile } from "./goals";
import { splitPotByGoals } from "./pot";
import { marketForMonth } from "./market";

describe("dates", () => {
  it("formats local YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 7, 26))).toBe("2026-08-26");
  });
  it("shifts across month boundaries", () => {
    expect(shiftDateKey("2026-08-01", -1)).toBe("2026-07-31");
  });
  it("returns 7 keys ending today", () => {
    const keys = lastNDateKeys(7, "2026-08-26");
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe("2026-08-20");
    expect(keys[6]).toBe("2026-08-26");
  });
});

describe("streak", () => {
  it("is 0 when nothing is logged", () => {
    expect(calcStreak([], "2026-08-26")).toBe(0);
  });
  it("keeps yesterday's streak if today is empty", () => {
    expect(calcStreak(["2026-08-24", "2026-08-25"], "2026-08-26")).toBe(2);
  });
  it("counts today plus previous consecutive days", () => {
    expect(calcStreak(["2026-08-24", "2026-08-25", "2026-08-26"], "2026-08-26")).toBe(3);
  });
  it("breaks on a missed day", () => {
    expect(calcStreak(["2026-08-23", "2026-08-25"], "2026-08-26")).toBe(1);
  });
});

describe("diary helpers", () => {
  it("sums macros", () => {
    expect(
      sumMacros([
        { macros: { kcal: 100, protein: 10, carbs: 5, fat: 2 } },
        { macros: { kcal: 50, protein: 1.15, carbs: 2.24, fat: 0.4 } },
      ]),
    ).toEqual({ kcal: 150, protein: 11.2, carbs: 7.2, fat: 2.4 });
  });

  it("does not add burned calories into remaining", () => {
    const rem = remainingMacros(
      { kcal: 1800, protein: 100, carbs: 200, fat: 60 },
      { kcal: 500, protein: 20, carbs: 40, fat: 10 },
    );
    expect(rem.kcal).toBe(1300);
  });

  it("skips a recipe already on the same meal", () => {
    expect(
      recipeAlreadyOnMeal(
        [{ meal: "lunch", recipeId: "pui-orez", dateKey: "2026-08-26", createdAt: "", nameRo: "x", macros: { kcal: 1, protein: 0, carbs: 0, fat: 0 } }],
        "lunch",
        "pui-orez",
      ),
    ).toBe(true);
  });

  it("dedupes shopping ingredients per recipe", () => {
    expect(
      shoppingHasIngredient(
        [{ nameRo: "300g piept de pui", fromRecipeId: "pui-orez" }],
        "pui-orez",
        "300g piept de pui",
      ),
    ).toBe(true);
  });

  it("picks the first empty meal for fill-the-gap", () => {
    expect(
      pickGapMeal([
        { meal: "breakfast", dateKey: "d", createdAt: "", nameRo: "a", macros: { kcal: 300, protein: 0, carbs: 0, fat: 0 } },
      ]),
    ).toBe("lunch");
  });
});

describe("goals", () => {
  it("uses a higher calorie floor for men", () => {
    expect(calorieFloor("male")).toBe(1500);
    expect(calorieFloor("female")).toBe(1200);
  });

  it("clamps profile stats", () => {
    const p = clampProfile({
      sex: "female",
      age: 3,
      heightCm: 80,
      weightKg: 10,
      activity: "light",
      goal: "lose",
    });
    expect(p.age).toBe(14);
    expect(p.heightCm).toBe(120);
    expect(p.weightKg).toBe(35);
  });

  it("does not let carb floor overshoot calories", () => {
    const macros = calcMacroGoals(1260, 85);
    const fromMacros = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
    expect(fromMacros).toBeLessThanOrEqual(1260 + 25);
  });

  it("keeps lose goal at least at the sex floor", () => {
    const kcal = calcCalorieGoal({
      sex: "female",
      age: 32,
      heightCm: 160,
      weightKg: 50,
      activity: "sedentary",
      goal: "lose",
    });
    expect(kcal).toBeGreaterThanOrEqual(1200);
  });
});

describe("family pot", () => {
  it("splits by calorie goals, not equal shares", () => {
    const [you, other] = splitPotByGoals(
      { kcal: 1000, protein: 50, carbs: 80, fat: 20 },
      [
        { id: "you", goalKcal: 2000 },
        { id: "alex", goalKcal: 3000 },
      ],
    );
    expect(you.macros.kcal).toBe(400);
    expect(other.macros.kcal).toBe(600);
  });
});

describe("market calendar", () => {
  it("returns August produce including tomatoes", () => {
    const items = marketForMonth(7);
    expect(items.some((i) => i.id === "rosii")).toBe(true);
  });
  it("returns January citrus, not field tomatoes", () => {
    const items = marketForMonth(0);
    expect(items.some((i) => i.id === "citrice")).toBe(true);
    expect(items.some((i) => i.id === "rosii")).toBe(false);
  });
});
