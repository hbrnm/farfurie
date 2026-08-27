import { NextResponse } from "next/server";
import { hasVisionKey } from "@/lib/server/vision";

export const runtime = "nodejs";

/** Public flag only — never returns the key. */
export async function GET() {
  return NextResponse.json({ vision: hasVisionKey() });
}
