import { NextResponse } from "next/server";
import {
  importedToRecipe,
  importRecipeFromImage,
  importRecipeFromText,
  importRecipeFromUrl,
} from "@/lib/server/recipe-import";

export const runtime = "nodejs";

const CLIENT_ERRORS = new Set(["invalid_url", "missing_source", "empty_recipe"]);
const UNPROCESSABLE = new Set(["needs_vision", "instagram_blocked"]);

export async function POST(req: Request) {
  const body = (await req.json()) as {
    url?: string;
    text?: string;
    imageBase64?: string;
    mime?: string;
  };
  const url = body.url?.trim() ?? "";
  const text = body.text?.trim() ?? "";
  const imageBase64 = body.imageBase64?.trim() ?? "";

  try {
    const imported = imageBase64
      ? await importRecipeFromImage(imageBase64, body.mime ?? "image/jpeg")
      : url
        ? await importRecipeFromUrl(url)
        : text
          ? await importRecipeFromText(text)
          : null;
    if (!imported) {
      return NextResponse.json({ error: "missing_source" }, { status: 400 });
    }
    return NextResponse.json({ recipe: importedToRecipe(imported) });
  } catch (err) {
    const code = err instanceof Error ? err.message : "import_failed";
    const status = CLIENT_ERRORS.has(code) ? 400 : UNPROCESSABLE.has(code) ? 422 : 502;
    return NextResponse.json({ error: code }, { status });
  }
}
