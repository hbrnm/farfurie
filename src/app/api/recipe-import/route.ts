import { NextResponse } from "next/server";
import { importedToRecipe, importRecipeFromUrl } from "@/lib/server/recipe-import";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as { url?: string };
  const url = body.url?.trim() ?? "";
  if (url.length < 8) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }
  try {
    const imported = await importRecipeFromUrl(url);
    return NextResponse.json({ recipe: importedToRecipe(imported) });
  } catch (err) {
    const code = err instanceof Error ? err.message : "import_failed";
    const status = code === "invalid_url" ? 400 : 502;
    return NextResponse.json({ error: code }, { status });
  }
}
