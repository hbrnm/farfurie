"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ShoppingBag, Sparkles, TrendingDown, Utensils } from "lucide-react";
import {
  getMarketItemsForMonth,
  MONTH_NAMES_EN,
  MONTH_NAMES_RO,
} from "@/lib/market";
import { recipes } from "@/lib/recipes";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";
import { pricePer20gProtein, foods, foodName } from "@/lib/foods";
import { triggerHaptic } from "@/lib/haptics";

const statusLabel = {
  ro: {
    peak: "Vârf de sezon 🌟",
    good: "Bun acum 👍",
    starting: "Începe acum 🌱",
    ending: "Se termină ⏳",
  },
  en: {
    peak: "Peak season 🌟",
    good: "Good now 👍",
    starting: "Starting now 🌱",
    ending: "Ending soon ⏳",
  },
};

export function MarketBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const currentMonthIdx = new Date().getMonth(); // 0 = Jan, 7 = Aug, 11 = Dec
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(currentMonthIdx);

  const monthItems = getMarketItemsForMonth(selectedMonthIdx);

  // Supermarket products ranked by cheapest price per 20g protein
  const rankedFoods = foods
    .map((f) => ({ food: f, price: pricePer20gProtein(f) }))
    .filter((x): x is { food: (typeof foods)[number]; price: number } => x.price !== null)
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  const monthNames = locale === "ro" ? MONTH_NAMES_RO : MONTH_NAMES_EN;

  return (
    <div className="space-y-8">
      {/* Header Calendar Piață */}
      <header className="animate-rise space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-[#55dc88]">
          <Calendar size={14} />
          <span>{locale === "ro" ? "Prețuri & Sezonalitate România" : "Prices & Seasonality Romania"}</span>
        </div>
        <h1 className="display text-3xl font-extrabold md:text-4xl text-gray-900 dark:text-zinc-100">
          {t(locale, "marketTitle")}
        </h1>
        <p className="max-w-2xl text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
          {t(locale, "marketDesc")}
        </p>
      </header>

      {/* Selector Dinamic pe 12 Luni */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="level-kicker text-gray-500 dark:text-zinc-400">
            {locale === "ro" ? "SELECTEAZĂ LUNA DIN AN" : "SELECT MONTH OF YEAR"}
          </p>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-[#55dc88]">
            {monthNames[selectedMonthIdx]} · RO 🇷🇴
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {monthNames.map((monthName, idx) => {
            const isSelected = idx === selectedMonthIdx;
            const isCurrentMonth = idx === currentMonthIdx;

            return (
              <button
                key={monthName}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedMonthIdx(idx);
                }}
                className={`relative flex-shrink-0 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-emerald-600 dark:bg-[#55dc88] text-white dark:text-black shadow-md font-extrabold"
                    : "bg-white dark:bg-[#121214] text-gray-700 dark:text-zinc-300 border border-[var(--line)] hover:border-emerald-500/40"
                }`}
              >
                <span>{monthName.slice(0, 3)}</span>
                {isCurrentMonth && !isSelected && (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid Produse de Sezon din Piață */}
      <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {monthItems.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-8 text-center text-sm text-gray-500 dark:text-zinc-400">
            {locale === "ro"
              ? "Nu sunt date de piata specifice pentru aceasta luna."
              : "No specific market data for this month."}
          </div>
        ) : (
          monthItems.map((item, i) => (
            <article
              key={item.id}
              className="surface animate-rise p-4 dark:bg-[#121214] dark:border-zinc-800 flex flex-col justify-between transition-all hover:border-emerald-500/30"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-[#55dc88]">
                  {statusLabel[locale][item.status]}
                </span>
                <h2 className="display mt-1 text-lg font-extrabold text-gray-900 dark:text-zinc-100">
                  {locale === "ro" ? item.nameRo : item.nameEn}
                </h2>
                <p className="mt-1 font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  {locale === "ro" ? item.priceHintRo : item.priceHintEn}
                </p>
              </div>

              {item.cooksWith.length > 0 && (
                <div className="mt-4 border-t border-[var(--line)] pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1.5">
                    {locale === "ro" ? "Se gătește în:" : "Cooks with:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.cooksWith.map((id) => {
                      const recipe = recipes.find((r) => r.id === id);
                      if (!recipe) return null;
                      return (
                        <Link
                          key={id}
                          href="/app/recipes"
                          className="rounded-full bg-gray-100 dark:bg-[#1c1c1f] px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-[#55dc88] transition-colors"
                        >
                          {locale === "ro" ? recipe.nameRo : recipe.nameEn}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* Tabel Clasament Prețuri Supermarket RO (Lei per 20g Proteină) */}
      <section className="surface p-5 md:p-6 dark:bg-[#121214] dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="display text-xl font-extrabold text-gray-900 dark:text-zinc-100">
              {t(locale, "priceProtein")}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
              {locale === "ro"
                ? "Eficiență bugetară — prețuri estimate în magazinele din România (Lidl, Carrefour, Kaufland, Mega Image)."
                : "Budget efficiency — estimated supermarket prices in Romania."}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-600 dark:text-[#55dc88]">
            {locale === "ro" ? "Calculat la 20g Proteină" : "Calculated per 20g Protein"}
          </span>
        </div>

        <ul className="mt-3 divide-y divide-[var(--line)]">
          {rankedFoods.map(({ food, price }) => (
            <li key={food.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1c1c1f] text-emerald-500">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                    {foodName(food, locale)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {food.brand ?? food.category} · {food.per100g.protein}g proteină / 100g
                  </p>
                </div>
              </div>
              <p className="font-mono text-sm font-black text-emerald-600 dark:text-[#55dc88]">
                {price.toFixed(2)} RON
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
