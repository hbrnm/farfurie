import { NextRequest } from "next/server";
import { foods, macrosForGrams } from "@/lib/foods";
import { recipes } from "@/lib/recipes";
import { localDateKey } from "@/lib/dates";
import type { MealKey } from "@/lib/diary";
import type { FoodLogSource } from "@/domain/models";
import { premiumOrPaywall } from "@/server/premium";

const PREMIUM_SOURCES: FoodLogSource[] = ["photo", "voice", "ai"];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    meal?: MealKey;
    foodId?: string;
    recipeId?: string;
    grams?: number;
    source?: FoodLogSource;
    nameRo?: string;
    nameEn?: string;
    macros?: { kcal: number; protein: number; carbs: number; fat: number };
  };

  const source: FoodLogSource = body.source ?? "search";
  if (PREMIUM_SOURCES.includes(source)) {
    const blocked = premiumOrPaywall(request, source === "photo" ? "photoLog" : source === "voice" ? "voiceLog" : "aiFoodCreate");
    if (blocked) return blocked;
  }

  if (body.foodId) {
    const food = foods.find((f) => f.id === body.foodId);
    if (!food) return Response.json({ error: "food_not_found" }, { status: 404 });
    const grams = body.grams ?? food.defaultGrams;
    return Response.json({
      ok: true,
      entry: {
        meal: body.meal ?? "lunch",
        source,
        foodId: food.id,
        nameRo: food.nameRo,
        nameEn: food.nameEn,
        grams,
        macros: macrosForGrams(food, grams),
        dateKey: localDateKey(),
        createdAt: new Date().toISOString(),
      },
    });
  }

  if (body.recipeId) {
    const recipe = recipes.find((r) => r.id === body.recipeId);
    if (!recipe) return Response.json({ error: "recipe_not_found" }, { status: 404 });
    return Response.json({
      ok: true,
      entry: {
        meal: body.meal ?? "lunch",
        source: "recipe",
        recipeId: recipe.id,
        nameRo: recipe.nameRo,
        nameEn: recipe.nameEn,
        macros: recipe.perServing,
        dateKey: localDateKey(),
        createdAt: new Date().toISOString(),
      },
    });
  }

  if (body.macros && body.nameRo) {
    return Response.json({
      ok: true,
      entry: {
        meal: body.meal ?? "lunch",
        source,
        nameRo: body.nameRo,
        nameEn: body.nameEn ?? body.nameRo,
        macros: body.macros,
        grams: body.grams,
        dateKey: localDateKey(),
        createdAt: new Date().toISOString(),
      },
    });
  }

  return Response.json({ error: "invalid_log" }, { status: 400 });
}
