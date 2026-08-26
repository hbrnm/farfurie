"use client";

import { Clock } from "lucide-react";
import { recipeName, recipes } from "@/lib/recipes";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function RecipesGrid() {
  const locale = useFarfurieStore((s) => s.locale);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);

  return (
    <div>
      <header className="mb-6 animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "recipesTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "recipesDesc")}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe, i) => (
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
              <button
                type="button"
                className="btn btn-primary w-full text-sm"
                onClick={() => addRecipeToMeal(recipe.id, "lunch")}
              >
                {t(locale, "addToDiary")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
