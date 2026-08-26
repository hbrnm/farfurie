"use client";

import { useState } from "react";
import { Clock, Heart, ShoppingCart } from "lucide-react";
import { recipeName, recipes, type Recipe } from "@/lib/recipes";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function RecipesGrid() {
  const locale = useFarfurieStore((s) => s.locale);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);
  const addRecipeToShopping = useFarfurieStore((s) => s.addRecipeToShopping);
  const favoriteRecipeIds = useFarfurieStore((s) => s.favoriteRecipeIds);
  const toggleFavoriteRecipe = useFarfurieStore((s) => s.toggleFavoriteRecipe);
  const userRecipes = useFarfurieStore((s) => s.userRecipes);
  const addUserRecipe = useFarfurieStore((s) => s.addUserRecipe);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const sorted = [...userRecipes, ...recipes].sort((a, b) => {
    const af = favoriteRecipeIds.includes(a.id) ? 0 : 1;
    const bf = favoriteRecipeIds.includes(b.id) ? 0 : 1;
    return af - bf;
  });

  const importUrl = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/recipe-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "import_failed"));
      addUserRecipe(data.recipe as Recipe);
      setStatus(t(locale, "recipeImported"));
      setUrl("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <header className="mb-6 animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "recipesTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "recipesDesc")}</p>
      </header>
      <form
        className="mb-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void importUrl();
        }}
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t(locale, "recipeUrl")}
          className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
        />
        <button type="submit" className="btn btn-primary text-sm" disabled={busy || url.length < 8}>
          {busy ? t(locale, "importingRecipe") : t(locale, "importRecipe")}
        </button>
      </form>
      {status && <p className="mb-4 text-sm font-semibold text-brand">{status}</p>}
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
