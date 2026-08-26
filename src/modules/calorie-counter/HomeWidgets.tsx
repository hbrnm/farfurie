"use client";

import { t } from "@/lib/i18n";
import { useEffectiveGoals, useRemaining, useStreak, useTodayWater } from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

export function HomeWidgets() {
  const locale = useFarfurieStore((s) => s.locale);
  const remaining = useRemaining();
  const goals = useEffectiveGoals();
  const water = useTodayWater();
  const streak = useStreak();

  const cards = [
    { label: t(locale, "widgetKcal"), value: String(Math.max(0, remaining.kcal)) },
    { label: t(locale, "protein"), value: `${Math.round(remaining.protein)}g` },
    { label: t(locale, "water"), value: `${water}/${goals.waterMl}` },
    { label: t(locale, "streak"), value: String(streak) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <article key={c.label} className="surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{c.label}</p>
          <p className="display mt-1 text-2xl text-brand">{c.value}</p>
        </article>
      ))}
    </div>
  );
}
