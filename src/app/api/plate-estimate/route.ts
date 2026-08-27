import { NextResponse } from "next/server";
import { estimatePlate } from "@/lib/server/plate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    imageBase64?: string;
    mime?: string;
    hint?: string;
  };
  if (!body.imageBase64 || body.imageBase64.length < 100) {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }
  if (body.imageBase64.length > 8_000_000) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }
  try {
    const estimate = await estimatePlate({
      imageBase64: body.imageBase64,
      mime: body.mime,
      hint: body.hint,
    });
    return NextResponse.json(estimate);
  } catch {
    return NextResponse.json({ error: "estimate_failed" }, { status: 500 });
  }
}
