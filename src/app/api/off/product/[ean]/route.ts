import { NextResponse } from "next/server";
import { fetchOffProduct } from "@/lib/server/off";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ ean: string }> },
) {
  const { ean } = await ctx.params;
  const food = await fetchOffProduct(ean);
  if (!food) {
    return NextResponse.json({ food: null }, { status: 404 });
  }
  return NextResponse.json({ food, source: "openfoodfacts" });
}
