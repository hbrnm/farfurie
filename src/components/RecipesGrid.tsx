"use client";

import { useRef, useState } from "react";
import { Clock, Heart, ImagePlus, ShoppingCart } from "lucide-react";
import { recipeName, recipes, type Recipe } from "@/lib/recipes";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";
import { useVisionAvailable } from "@/lib/useVisionAvailable";

const ERROR_KEYS: Record<string, TranslationKey> = {
  missing_source: "recipeErrMissing",
  needs_vision: "recipeErrVision",
  instagram_blocked: "recipeErrInstagram",
  fetch_failed: "recipeErrFetch",
  no_nutrition: "recipeErrNutrition",
  empty_recipe: "recipeErrEmpty",
  invalid_url: "recipeErrUrl",
};

function importError(locale: Locale, code: string) {
  const key = ERROR_KEYS[code];
  return key ? t(locale, key) : code;
}

export function RecipesGrid() {
  const locale = useFarfurieStore((s) => s.locale);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);
  const addRecipeToShopping = useFarfurieStore((s) => s.addRecipeToShopping);
  const favoriteRecipeIds = useFarfurieStore((s) => s.favoriteRecipeIds);
  const toggleFavoriteRecipe = useFarfurieStore((s) => s.toggleFavoriteRecipe);
  const userRecipes = useFarfurieStore((s) => s.userRecipes);
  const addUserRecipe = useFarfurieStore((s) => s.addUserRecipe);
  const vision = useVisionAvailable();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState<"url" | "text" | "photo" | "">("");

  const sorted = [...userRecipes, ...recipes].sort((a, b) => {
    const af = favoriteRecipeIds.includes(a.id) ? 0 : 1;
    const bf = favoriteRecipeIds.includes(b.id) ? 0 : 1;
    return af - bf;
  });

  const compress = async (dataUrl: string) => {
    const img = document.createElement("img");
    img.src = dataUrl;
    await new Promise((r) => {
      img.onload = () => r(null);
    });
    const canvas = document.createElement("canvas");
    const max = 960;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  };

  const postImport = async (kind: "url" | "text" | "photo", body: Record<string, string>) => {
    setBusy(kind);
    setStatus("");
    setOk(false);
    try {
      const res = await fetch("/api/recipe-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "import_failed"));
      addUserRecipe(data.recipe as Recipe);
      setStatus(t(locale, "recipeImported"));
      setOk(true);
      setUrl("");
      setText("");
      setPreview(null);
    } catch (err) {
      setOk(false);
      setStatus(importError(locale, err instanceof Error ? err.message : "error"));
    } finally {
      setBusy("");
    }
  };

  const onPhoto = async (file: File) => {
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("empty_recipe"));
        reader.readAsDataURL(file);
      });
      const compact = await compress(dataUrl);
      setPreview(compact);
      await postImport("photo", { imageBase64: compact, mime: "image/jpeg" });
    } catch (err) {
      setOk(false);
      setStatus(importError(locale, err instanceof Error ? err.message : "empty_recipe"));
    }
  };

  return (
    <div>
      <header className="mb-6 animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "recipesTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "recipesDesc")}</p>
      </header>

      <section className="surface mb-6 space-y-4 p-5">
        <h2 className="display text-xl">{t(locale, "importRecipe")}</h2>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void postImport("url", { url });
          }}
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t(locale, "recipeUrl")}
            className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
          />
          <button type="submit" className="btn btn-primary text-sm" disabled={Boolean(busy) || url.length < 8}>
            {busy === "url" ? t(locale, "importingRecipe") : t(locale, "importFromUrl")}
          </button>
        </form>

        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`${t(locale, "recipePaste")}\n${t(locale, "recipePasteHint")}`}
            rows={6}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
          />
          <button
            type="button"
            className="btn btn-ghost text-sm"
            disabled={Boolean(busy) || text.trim().length < 8}
            onClick={() => void postImport("text", { text })}
          >
            {busy === "text" ? t(locale, "importingRecipe") : t(locale, "importFromText")}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-ink-soft">
            {vision ? t(locale, "recipePhotoHint") : t(locale, "recipePhotoHintOff")}
          </p>
          {vision ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void onPhoto(file);
                }}
              />
              <button
                type="button"
                className="btn btn-ghost text-sm"
                disabled={Boolean(busy)}
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus size={14} />
                {busy === "photo" ? t(locale, "importingRecipe") : t(locale, "importFromPhoto")}
              </button>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="mt-2 h-28 rounded-2xl object-cover" />
              )}
            </>
          ) : null}
        </div>
        {status && (
          <p className={`text-sm font-semibold ${ok ? "text-brand" : "text-red-700"}`}>{status}</p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((recipe, i) => {
          const fav = favoriteRecipeIds.includes(recipe.id);
          return (
            <article
              key={recipe.id}
              className="surface animate-rise overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="relative h-36"
                style={{
                  background: `linear-gradient(135deg, hsl(${recipe.imageHue} 42% 42%), hsl(${recipe.imageHue + 30} 50% 62%))`,
                }}
              >
                <div className="absolute inset-0 hero-grain opacity-40" />
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-brand"
                  onClick={() => toggleFavoriteRecipe(recipe.id)}
                  aria-label={t(locale, "favorites")}
                >
                  <Heart size={16} fill={fav ? "currentColor" : "none"} />
                </button>
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold">
                  <Clock size={12} />
                  {recipe.minutes} {t(locale, "cookMinutes")}
                </div>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="display text-xl leading-tight">
                  {recipeName(recipe, locale)}
                </h2>
                <p className="text-sm font-semibold text-brand">
                  {recipe.perServing.kcal} kcal · P {recipe.perServing.protein}g ·{" "}
                  {recipe.servings} {t(locale, "servings").toLowerCase()}
                </p>
                <ul className="space-y-1 text-sm text-ink-soft">
                  {(locale === "ro" ? recipe.ingredientsRo : recipe.ingredientsEn)
                    .slice(0, 4)
                    .map((ing) => (
                      <li key={ing}>· {ing}</li>
                    ))}
                </ul>
                <div className="grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary w-full text-sm"
                    onClick={() => addRecipeToMeal(recipe.id, "lunch")}
                  >
                    {t(locale, "addToDiary")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost w-full text-sm"
                    onClick={() => addRecipeToShopping(recipe.id)}
                  >
                    <ShoppingCart size={14} />
                    {t(locale, "addToList")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
