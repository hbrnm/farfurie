"use client";

import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function MacroRing() {
  const locale = useFarfurieStore((s) => s.locale);
  const goals = useFarfurieStore((s) => s.effectiveGoals());
  const totals = useFarfurieStore((s) => s.totals());
  const remaining = useFarfurieStore((s) => s.remaining());
  const holidayMode = useFarfurieStore((s) => s.holidayMode);

  const pct = Math.min(100, Math.round((totals.kcal / goals.kcal) * 100));
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const macros = [
    { key: "protein" as const, value: totals.protein, goal: goals.protein, color: "#1b5e45" },
    { key: "carbs" as const, value: totals.carbs, goal: goals.carbs, color: "#e8a838" },
    { key: "fat" as const, value: totals.fat, goal: goals.fat, color: "#c45c3e" },
  ];

  return (
    <section className="surface animate-rise overflow-hidden p-5 md:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative mx-auto grid h-40 w-40 place-items-center md:mx-0">
          <svg className="-rotate-90" width="160" height="160" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(20,32,26,0.08)"
              strokeWidth="12"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1b5e45" />
                <stop offset="100%" stopColor="#e8a838" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {t(locale, "remaining")}
              </p>
              <p className="display text-3xl text-brand">
                {Math.max(0, remaining.kcal)}
              </p>
              <p className="text-xs text-ink-soft">{t(locale, "calories")}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-ink-soft">
                {t(locale, "eaten")} · {totals.kcal} / {goals.kcal} kcal
              </p>
              {holidayMode && (
                <p className="mt-1 text-xs font-semibold text-[var(--danger)]">
                  {t(locale, "holidaysOn")}
                </p>
              )}
            </div>
            <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand">
              {pct}%
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {macros.map((m) => {
              const width = Math.min(100, Math.round((m.value / m.goal) * 100));
              return (
                <div key={m.key}>
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>{t(locale, m.key)}</span>
                    <span className="text-ink-soft">
                      {m.value}/{m.goal}g
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${width}%`, background: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
