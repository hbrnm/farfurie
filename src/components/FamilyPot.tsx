"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { splitPotByGoals, type PotMember } from "@/lib/pot";
import { useFarfurieStore } from "@/lib/store";

const potPresets = [
  {
    id: "ciorba",
    nameRo: "Ciorbă de legume (oala întreagă)",
    nameEn: "Vegetable soup (full pot)",
    kcal: 720,
    protein: 24,
    carbs: 112,
    fat: 20,
  },
  {
    id: "sarmale",
    nameRo: "Sarmale light (tavă)",
    nameEn: "Light cabbage rolls (tray)",
    kcal: 1740,
    protein: 132,
    carbs: 108,
    fat: 84,
  },
  {
    id: "tocanita",
    nameRo: "Tocăniță de cartofi cu pui",
    nameEn: "Potato stew with chicken",
    kcal: 1600,
    protein: 95,
    carbs: 150,
    fat: 55,
  },
];

export function FamilyPot() {
  const locale = useFarfurieStore((s) => s.locale);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const goals = useFarfurieStore((s) => s.goals);
  const members = useFarfurieStore((s) => s.potMembers);
  const setPotMembers = useFarfurieStore((s) => s.setPotMembers);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const [presetId, setPresetId] = useState(potPresets[0].id);

  const yourGoal = holidayMode ? Math.round(goals.kcal * 1.15) : goals.kcal;
  const pot = potPresets.find((p) => p.id === presetId) ?? potPresets[0];

  const resolved = members.map((m) => ({
    ...m,
    goalKcal: m.you ? yourGoal : m.goalKcal,
  }));

  const splits = useMemo(() => splitPotByGoals(pot, resolved), [pot, resolved]);
  const you = splits.find((s) => s.you) ?? splits[0];

  const patch = (id: string, next: Partial<PotMember>) =>
    setPotMembers(members.map((m) => (m.id === id ? { ...m, ...next } : m)));

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "potTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "potDesc")}</p>
        <p className="mt-1 text-sm font-semibold text-brand">{t(locale, "splitByGoals")}</p>
      </header>

      <section className="surface p-5">
        <p className="mb-3 text-sm font-semibold text-ink-soft">{t(locale, "total")}</p>
        <div className="flex flex-wrap gap-2">
          {potPresets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresetId(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                presetId === p.id
                  ? "bg-brand text-white"
                  : "bg-white/80 text-ink-soft border border-[var(--line)]"
              }`}
            >
              {locale === "ro" ? p.nameRo : p.nameEn}
            </button>
          ))}
        </div>
        <p className="mt-4 text-lg font-bold text-brand">
          {pot.kcal} kcal · P {pot.protein}g · C {pot.carbs}g · F {pot.fat}g
        </p>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="display text-2xl">{t(locale, "members")}</h2>
          <button
            type="button"
            className="btn btn-ghost !px-3 !py-2 text-sm"
            onClick={() =>
              setPotMembers([
                ...members,
                {
                  id: `${Date.now()}`,
                  nameRo: locale === "ro" ? "Membru" : "Member",
                  nameEn: "Member",
                  goalKcal: 2000,
                },
              ])
            }
          >
            {t(locale, "addMember")}
          </button>
        </div>
        <div className="space-y-4">
          {splits.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <input
                  value={locale === "ro" ? m.nameRo : m.nameEn}
                  onChange={(e) => {
                    const value = e.target.value;
                    patch(m.id, locale === "ro" ? { nameRo: value } : { nameEn: value });
                  }}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
                <span className="shrink-0 text-sm font-bold text-brand">{m.pct}%</span>
                {!m.you && (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-ink-soft"
                    onClick={() => setPotMembers(members.filter((x) => x.id !== m.id))}
                  >
                    {t(locale, "removeMember")}
                  </button>
                )}
              </div>
              <label className="text-xs text-ink-soft">
                {t(locale, "goal")} (kcal)
                <input
                  type="number"
                  min={800}
                  max={5000}
                  disabled={Boolean(m.you)}
                  value={m.you ? yourGoal : m.goalKcal}
                  onChange={(e) => patch(m.id, { goalKcal: Number(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-ink disabled:opacity-70"
                />
              </label>
              <p className="mt-2 text-xs text-ink-soft">
                {m.macros.kcal} kcal · P {m.macros.protein}g
              </p>
            </div>
          ))}
        </div>
      </section>

      {you && (
        <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-soft">{t(locale, "yourShare")}</p>
            <p className="display text-3xl text-brand">{you.macros.kcal} kcal</p>
            <p className="text-sm text-ink-soft">
              P {you.macros.protein}g · C {you.macros.carbs}g · F {you.macros.fat}g
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              addEntry({
                meal: "dinner",
                nameRo: `${pot.nameRo} — porția ta`,
                nameEn: `${pot.nameEn} — your share`,
                macros: you.macros,
              })
            }
          >
            {t(locale, "addToDiary")}
          </button>
        </section>
      )}
    </div>
  );
}
