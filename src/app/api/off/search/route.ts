import { NextResponse } from "next/server";
import { searchOffProducts } from "@/lib/server/off";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ foods: [] });
  }
  try {
    const foods = await searchOffProducts(q, true);
    return NextResponse.json({ foods, source: "openfoodfacts" });
  } catch {
    return NextResponse.json({ foods: [], error: "off_unavailable" }, { status: 502 });
  }
}
