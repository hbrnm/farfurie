import { NextRequest } from "next/server";
import { parseFoodText } from "@/server/catalog";
import type { MealKey } from "@/lib/diary";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    text?: string;
    locale?: "ro" | "en";
    meal?: MealKey;
  };
  const parsed = parseFoodText(
    body.text ?? "",
    body.locale === "en" ? "en" : "ro",
    body.meal ?? "lunch",
  );
  if (!parsed) {
    return Response.json({ matched: false }, { status: 404 });
  }
  return Response.json({
    matched: true,
    source: "text",
    foodId: parsed.food.id,
    nameRo: parsed.food.nameRo,
    nameEn: parsed.food.nameEn,
    grams: parsed.grams,
    macros: parsed.macros,
    meal: parsed.meal,
  });
}
