"use client";

import { useMemo, useState } from "react";
import { foods, foodName, macrosForGrams } from "@/lib/foods";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";
import { PremiumGate } from "@/components/PremiumGate";

export function FoodCompareBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const [a, setA] = useState(foods[0].id);
  const [b, setB] = useState(foods[1].id);

  return (
    <PremiumGate feature="foodCompare">
      <CompareInner locale={locale} a={a} b={b} setA={setA} setB={setB} />
    </PremiumGate>
  );
}

function CompareInner({
  locale,
  a,
  b,
  setA,
  setB,
}: {
  locale: "ro" | "en";
  a: string;
  b: string;
  setA: (id: string) => void;
  setB: (id: string) => void;
}) {
  const left = foods.find((f) => f.id === a) ?? foods[0];
  const right = foods.find((f) => f.id === b) ?? foods[1];
  const la = macrosForGrams(left, 100);
  const lb = macrosForGrams(right, 100);

  const rows = useMemo(
    () => [
      ["kcal", la.kcal, lb.kcal],
      ["P", la.protein, lb.protein],
      ["C", la.carbs, lb.carbs],
      ["F", la.fat, lb.fat],
    ],
    [la, lb],
  );

  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">{t(locale, "compare")}</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {foodName(f, locale)}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          value={b}
          onChange={(e) => setB(e.target.value)}
        >
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {foodName(f, locale)}
            </option>
          ))}
        </select>
      </div>
      <section className="surface divide-y divide-[var(--line)]">
        {rows.map(([k, va, vb]) => (
          <div key={String(k)} className="grid grid-cols-3 px-4 py-3 text-sm">
            <span className="font-semibold">{k}</span>
            <span>{va}</span>
            <span className="text-brand font-bold">{vb}</span>
          </div>
        ))}
      </section>
      <p className="text-xs text-ink-soft">/ 100g</p>
    </div>
  );
}
