"use client";

import { useMemo, useState } from "react";
import {
  foodName,
  foods,
  macrosForGrams,
  pricePer20gProtein,
  searchFoods,
  type Food,
} from "@/lib/foods";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

function Picker({
  label,
  value,
  onPick,
}: {
  label: string;
  value: Food | null;
  onPick: (food: Food) => void;
}) {
  const locale = useFarfurieStore((s) => s.locale);
  const [q, setQ] = useState("");
  const results = useMemo(() => searchFoods(q, locale).slice(0, 6), [q, locale]);
  return (
    <div className="surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      {value && (
        <p className="display mt-1 text-xl">
          {foodName(value, locale)}
          {value.brand ? <span className="text-sm text-ink-soft"> · {value.brand}</span> : null}
        </p>
      )}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t(locale, "searchFood")}
        className="mt-3 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      <ul className="mt-2 space-y-1">
        {results.map((food) => (
          <li key={food.id}>
            <button
              type="button"
              className="w-full rounded-xl px-2 py-1.5 text-left text-sm hover:bg-white"
              onClick={() => {
                onPick(food);
                setQ("");
              }}
            >
              {foodName(food, locale)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompareBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const [a, setA] = useState<Food | null>(foods.find((f) => f.id === "ton-scandia") ?? null);
  const [b, setB] = useState<Food | null>(foods.find((f) => f.id === "shaorma-pui") ?? null);

  const stats = (food: Food | null) => {
    if (!food) return null;
    const m = macrosForGrams(food, 100);
    const p = pricePer20gProtein(food);
    const density = m.kcal > 0 ? Math.round((m.protein / m.kcal) * 1000) / 10 : 0;
    return { m, p, density };
  };
  const sa = stats(a);
  const sb = stats(b);

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "compareTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "compareDesc")}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Picker label={t(locale, "pickA")} value={a} onPick={setA} />
        <Picker label={t(locale, "pickB")} value={b} onPick={setB} />
      </div>
      {sa && sb && a && b && (
        <section className="surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase text-ink-soft">
                <th className="px-4 py-3">{t(locale, "per100")}</th>
                <th className="px-4 py-3">{foodName(a, locale)}</th>
                <th className="px-4 py-3">{foodName(b, locale)}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["kcal", sa.m.kcal, sb.m.kcal, "low"],
                  [t(locale, "protein"), sa.m.protein, sb.m.protein, "high"],
                  [t(locale, "carbs"), sa.m.carbs, sb.m.carbs, "low"],
                  [t(locale, "fat"), sa.m.fat, sb.m.fat, "low"],
                ] as const
              ).map(([label, va, vb, prefer]) => {
                const aWins = prefer === "high" ? va > vb : va < vb;
                const bWins = prefer === "high" ? vb > va : vb < va;
                return (
                  <tr key={String(label)} className="border-b border-[var(--line)]">
                    <td className="px-4 py-3 font-semibold">{label}</td>
                    <td className={`px-4 py-3 ${aWins ? "font-bold text-brand" : ""}`}>{va}</td>
                    <td className={`px-4 py-3 ${bWins ? "font-bold text-brand" : ""}`}>{vb}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="px-4 py-3 font-semibold">{t(locale, "priceProteinShort")}</td>
                <td className={`px-4 py-3 ${sa.p != null && (sb.p == null || sa.p < sb.p) ? "font-bold text-brand" : ""}`}>
                  {sa.p ?? "—"}
                </td>
                <td className={`px-4 py-3 ${sb.p != null && (sa.p == null || sb.p < sa.p) ? "font-bold text-brand" : ""}`}>
                  {sb.p ?? "—"}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="px-4 py-3 text-sm text-ink-soft">
            {t(locale, "winner")}:{" "}
            <span className="font-semibold text-brand">
              {sa.density >= sb.density ? foodName(a, locale) : foodName(b, locale)}
            </span>{" "}
            · {t(locale, "betterProtein")}
          </p>
        </section>
      )}
    </div>
  );
}
