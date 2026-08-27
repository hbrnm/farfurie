import { NextRequest } from "next/server";
import { premiumOrPaywall } from "@/server/premium";
import { foods, macrosForGrams } from "@/lib/foods";

/** R1: photo/voice AI is not shipped. This route always 402 (header is not auth). */
export async function POST(request: NextRequest) {
  const blocked = premiumOrPaywall(request, "photoLog");
  if (blocked) return blocked;
  const food = foods.find((f) => f.id === "pui-piept") ?? foods[0];
  const grams = 180;
  return Response.json({
    source: "photo",
    confidence: 0.62,
    demo: true,
    foodId: food.id,
    nameRo: food.nameRo,
    nameEn: food.nameEn,
    grams,
    macros: macrosForGrams(food, grams),
  });
}
