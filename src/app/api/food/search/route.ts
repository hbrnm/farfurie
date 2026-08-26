import { NextRequest } from "next/server";
import { searchCatalog } from "@/server/catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "ro";
  const results = searchCatalog(q, locale).slice(0, 20).map((food) => ({
    id: food.id,
    nameRo: food.nameRo,
    nameEn: food.nameEn,
    brand: food.brand,
    defaultGrams: food.defaultGrams,
    per100g: food.per100g,
    unitRo: food.unitRo,
    unitEn: food.unitEn,
    verified: true,
  }));
  return Response.json({
    count: results.length,
    catalogHint: "verified_seed",
    results,
  });
}
