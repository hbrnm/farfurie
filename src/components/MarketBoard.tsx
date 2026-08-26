"use client";

import Link from "next/link";
import { MONTH_NAMES, marketForMonth } from "@/lib/market";
import { recipes } from "@/lib/recipes";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";
import { pricePer20gProtein, foods, foodName } from "@/lib/foods";

const statusLabel = {
  ro: { peak: "Vârf de sezon", good: "Bun acum", ending: "Se termină" },
  en: { peak: "Peak season", good: "Good now", ending: "Ending soon" },
};

export function MarketBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const monthIndex = new Date().getMonth();
  const items = marketForMonth(monthIndex);

  const ranked = foods
    .map((f) => ({ food: f, price: pricePer20gProtein(f) }))
    .filter((x): x is { food: (typeof foods)[number]; price: number } => x.price !== null)
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "marketTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "marketDesc")}</p>
        <p className="mt-2 text-sm font-semibold text-brand">
          {MONTH_NAMES[locale][monthIndex]} · {t(locale, "romania")}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <article
            key={item.id}
            className="surface animate-rise p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-brand">
              {statusLabel[locale][item.status]}
            </p>
            <h2 className="display mt-1 text-xl">
              {locale === "ro" ? item.nameRo : item.nameEn}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {locale === "ro" ? item.priceHintRo : item.priceHintEn}
            </p>
            {item.cooksWith.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.cooksWith.map((id) => {
                  const recipe = recipes.find((r) => r.id === id);
                  if (!recipe) return null;
                  return (
                    <Link
                      key={id}
                      href="/app/recipes"
                      className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:text-brand"
                    >
                      {locale === "ro" ? recipe.nameRo : recipe.nameEn}
                    </Link>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="surface p-5">
        <h2 className="display text-2xl">{t(locale, "priceProtein")}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {locale === "ro"
            ? "Nutriție care respectă bugetul — aproximări magazine RO."
            : "Nutrition that respects the budget — RO store estimates."}
        </p>
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {ranked.map(({ food, price }) => (
            <li key={food.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{foodName(food, locale)}</p>
                <p className="text-xs text-ink-soft">{food.brand ?? food.category}</p>
              </div>
              <p className="font-bold text-brand">{price.toFixed(2)} RON</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
