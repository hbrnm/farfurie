"use client";

import { useMemo, useRef, useState } from "react";
import { Clock, Eye, Heart, ImagePlus, Search, ShoppingCart, Utensils, X, Check } from "lucide-react";
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

type FilterTag = "all" | "traditional" | "proteina" | "mic-dejun" | "pranz" | "cina" | "post" | "under400" | "quick";

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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<FilterTag>("all");
  const [activeModalRecipe, setActiveModalRecipe] = useState<Recipe | null>(null);
  const [portionScale, setPortionScale] = useState(1);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const allCombined = useMemo(() => [...userRecipes, ...recipes], [userRecipes]);

  const filteredRecipes = useMemo(() => {
    return allCombined.filter((r) => {
      const name = recipeName(r, locale).toLowerCase();
      const ings = (locale === "ro" ? r.ingredientsRo : r.ingredientsEn).join(" ").toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || name.includes(q) || ings.includes(q);

      if (!matchesQuery) return false;

      if (selectedTag === "all") return true;
      if (selectedTag === "traditional") return r.tags.includes("traditional");
      if (selectedTag === "proteina") return r.tags.includes("proteina") || r.perServing.protein >= 25;
      if (selectedTag === "mic-dejun") return r.tags.includes("mic-dejun");
      if (selectedTag === "pranz") return r.tags.includes("pranz");
      if (selectedTag === "cina") return r.tags.includes("cina");
      if (selectedTag === "post") return r.tags.includes("post");
      if (selectedTag === "under400") return r.perServing.kcal <= 400;
      if (selectedTag === "quick") return r.minutes <= 30;

      return true;
    }).sort((a, b) => {
      const af = favoriteRecipeIds.includes(a.id) ? 0 : 1;
      const bf = favoriteRecipeIds.includes(b.id) ? 0 : 1;
      return af - bf;
    });
  }, [allCombined, locale, searchQuery, selectedTag, favoriteRecipeIds]);

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

  const triggerToast = (msg: string) => {
    setAddedNotice(msg);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {addedNotice && (
        <div className="fixed bottom-16 right-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-xl animate-rise">
          <Check size={18} />
          <span className="text-sm font-semibold">{addedNotice}</span>
        </div>
      )}

      <header className="animate-rise">
        <h1 className="display text-3xl font-extrabold md:text-4xl text-gray-900 dark:text-white">
          {t(locale, "recipesTitle")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          {locale === "ro"
            ? "Rețete românești dovedite, calculate caloric per porție și optimizate pentru gust și buget."
            : "Proven Romanian recipes, calorie-counted per serving and budget-friendly."}
        </p>
      </header>

      {/* Căutare & Filtre categorii */}
      <section className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "ro"
                ? "Caută o rețetă (ex. Ciorbă rădăuțeană, Sarmale, Pui...)"
                : "Search recipe by name or ingredient..."
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-white/90 dark:bg-gray-800/90 pl-10 pr-4 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
          />
        </div>

        {/* Tags horizontal bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {[
            { id: "all", labelRo: "Toate", labelEn: "All" },
            { id: "traditional", labelRo: "Tradițional RO 🇷🇴", labelEn: "Romanian 🇷🇴" },
            { id: "proteina", labelRo: "Proteic 💪", labelEn: "High Protein 💪" },
            { id: "mic-dejun", labelRo: "Mic Dejun 🍳", labelEn: "Breakfast 🍳" },
            { id: "pranz", labelRo: "Prânz 🥘", labelEn: "Lunch 🥘" },
            { id: "cina", labelRo: "Cină 🍲", labelEn: "Dinner 🍲" },
            { id: "post", labelRo: "De Post 🌿", labelEn: "Vegan / Fasting 🌿" },
            { id: "under400", labelRo: "< 400 Kcal", labelEn: "< 400 Kcal" },
            { id: "quick", labelRo: "< 30 Min ⚡", labelEn: "< 30 Mins ⚡" },
          ].map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTag(tag.id as FilterTag)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all ${
                selectedTag === tag.id
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-[var(--line)] hover:bg-gray-100"
              }`}
            >
              {locale === "ro" ? tag.labelRo : tag.labelEn}
            </button>
          ))}
        </div>
      </section>

      {/* Secțiune Import Rețetă Custom */}
      <details className="surface overflow-hidden p-4 group">
        <summary className="cursor-pointer font-semibold text-sm flex items-center justify-between text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-2">
            <ImagePlus size={16} className="text-emerald-600" />
            {t(locale, "importRecipe")} (URL / Text / Foto)
          </span>
          <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
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
              className="flex-1 rounded-2xl border border-[var(--line)] bg-white dark:bg-gray-800 px-4 py-2 text-sm outline-none"
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
              rows={4}
              className="w-full rounded-2xl border border-[var(--line)] bg-white dark:bg-gray-800 px-4 py-2 text-sm outline-none"
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

          {vision && (
            <div className="space-y-2">
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
            </div>
          )}
          {status && (
            <p className={`text-sm font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>{status}</p>
          )}
        </div>
      </details>

      {/* Grid Rețete cu Thumbnails */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe, i) => {
          const fav = favoriteRecipeIds.includes(recipe.id);
          return (
            <article
              key={recipe.id}
              className="surface animate-rise overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div>
                {/* Header cu Imagine Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {recipe.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={recipe.imageUrl}
                      alt={recipeName(recipe, locale)}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, hsl(${recipe.imageHue} 42% 42%), hsl(${recipe.imageHue + 30} 50% 62%))`,
                      }}
                    />
                  )}

                  {/* Favorite button */}
                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-rose-500 shadow-md transition-transform hover:scale-110"
                    onClick={() => toggleFavoriteRecipe(recipe.id)}
                    aria-label={t(locale, "favorites")}
                  >
                    <Heart size={16} fill={fav ? "currentColor" : "none"} />
                  </button>

                  {/* Time Badge */}
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white">
                    <Clock size={12} />
                    {recipe.minutes} {t(locale, "cookMinutes")}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="display text-lg font-bold leading-snug text-gray-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                      onClick={() => {
                        setActiveModalRecipe(recipe);
                        setPortionScale(1);
                      }}
                    >
                      {recipeName(recipe, locale)}
                    </h2>
                  </div>

                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {recipe.perServing.kcal} kcal · P {recipe.perServing.protein}g · C {recipe.perServing.carbs}g · F {recipe.perServing.fat}g
                  </p>

                  <ul className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
                    {(locale === "ro" ? recipe.ingredientsRo : recipe.ingredientsEn)
                      .slice(0, 3)
                      .map((ing) => (
                        <li key={ing} className="truncate">· {ing}</li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Acțiuni rapide card */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  type="button"
                  className="btn btn-primary w-full text-xs py-2"
                  onClick={() => {
                    addRecipeToMeal(recipe.id, "lunch");
                    triggerToast(locale === "ro" ? "Rețetă adăugată în jurnal!" : "Recipe logged to diary!");
                  }}
                >
                  <Utensils size={14} />
                  {t(locale, "addToDiary")}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost text-xs py-1.5"
                    onClick={() => {
                      setActiveModalRecipe(recipe);
                      setPortionScale(1);
                    }}
                  >
                    <Eye size={13} />
                    {locale === "ro" ? "Vezi rețeta" : "View"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs py-1.5"
                    onClick={() => {
                      addRecipeToShopping(recipe.id);
                      triggerToast(locale === "ro" ? "Ingrediente adăugate în listă!" : "Ingredients added to list!");
                    }}
                  >
                    <ShoppingCart size={13} />
                    {t(locale, "addToList")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal Detalii Rețetă */}
      {activeModalRecipe && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm animate-rise">
          <div className="surface max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="display text-2xl font-extrabold text-gray-900 dark:text-white">
                  {recipeName(activeModalRecipe, locale)}
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {Math.round(activeModalRecipe.perServing.kcal * portionScale)} kcal · P {Math.round(activeModalRecipe.perServing.protein * portionScale)}g · C {Math.round(activeModalRecipe.perServing.carbs * portionScale)}g · F {Math.round(activeModalRecipe.perServing.fat * portionScale)}g / porție
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setActiveModalRecipe(null)}
              >
                <X size={20} />
              </button>
            </div>

            {activeModalRecipe.imageUrl && (
              <div className="mb-4 h-48 w-full overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeModalRecipe.imageUrl}
                  alt={recipeName(activeModalRecipe, locale)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Scaling Control */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {locale === "ro" ? "Scalare porții:" : "Portion multiplier:"}
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      portionScale === scale
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border"
                    }`}
                    onClick={() => setPortionScale(scale)}
                  >
                    x{scale}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingrediente */}
            <div className="mb-5 space-y-2">
              <h4 className="font-bold text-sm uppercase tracking-wide text-gray-500">
                {locale === "ro" ? "Ingrediente" : "Ingredients"} ({activeModalRecipe.servings * portionScale} {t(locale, "servings").toLowerCase()})
              </h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {(locale === "ro" ? activeModalRecipe.ingredientsRo : activeModalRecipe.ingredientsEn).map((ing) => (
                  <li key={ing} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pași de preparare */}
            <div className="mb-6 space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wide text-gray-500">
                {locale === "ro" ? "Mod de preparare" : "Preparation Steps"}
              </h4>
              <ol className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                {(locale === "ro" ? activeModalRecipe.stepsRo : activeModalRecipe.stepsEn).map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                className="btn btn-primary text-sm"
                onClick={() => {
                  addRecipeToMeal(activeModalRecipe.id, "lunch");
                  setActiveModalRecipe(null);
                  triggerToast(locale === "ro" ? "Rețetă adăugată în jurnal!" : "Recipe logged to diary!");
                }}
              >
                <Utensils size={15} />
                {t(locale, "addToDiary")}
              </button>
              <button
                type="button"
                className="btn btn-ghost text-sm"
                onClick={() => {
                  addRecipeToShopping(activeModalRecipe.id);
                  setActiveModalRecipe(null);
                  triggerToast(locale === "ro" ? "Ingrediente adăugate în listă!" : "Ingredients added to list!");
                }}
              >
                <ShoppingCart size={15} />
                {t(locale, "addToList")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

