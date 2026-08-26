import { NextRequest } from "next/server";
import { lookupBarcode } from "@/server/catalog";
import { macrosForGrams } from "@/lib/foods";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const food = lookupBarcode(code);
  if (!food) {
    return Response.json({ found: false, code }, { status: 404 });
  }
  return Response.json({
    found: true,
    code,
    food: {
      id: food.id,
      nameRo: food.nameRo,
      nameEn: food.nameEn,
      brand: food.brand,
      defaultGrams: food.defaultGrams,
      macros: macrosForGrams(food, food.defaultGrams),
      per100g: food.per100g,
    },
  });
}
