"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

type Member = {
  id: string;
  name: string;
  share: number;
  goalKcal: number;
};

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
  const [presetId, setPresetId] = useState(potPresets[0].id);
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: locale === "ro" ? "Tu" : "You", share: 35, goalKcal: 2100 },
    { id: "2", name: "Alex", share: 40, goalKcal: 2600 },
    { id: "3", name: "Maya", share: 25, goalKcal: 1800 },
  ]);

  const pot = potPresets.find((p) => p.id === presetId) ?? potPresets[0];
  const totalShare = members.reduce((a, m) => a + m.share, 0);

  const splits = useMemo(
    () =>
      members.map((m) => {
        const ratio = m.share / Math.max(totalShare, 1);
        return {
          ...m,
          macros: {
            kcal: Math.round(pot.kcal * ratio),
            protein: Math.round(pot.protein * ratio * 10) / 10,
            carbs: Math.round(pot.carbs * ratio * 10) / 10,
            fat: Math.round(pot.fat * ratio * 10) / 10,
          },
        };
      }),
    [members, pot, totalShare],
  );

  const you = splits[0];

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "potTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "potDesc")}</p>
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
        <h2 className="display mb-4 text-2xl">{t(locale, "members")}</h2>
        <div className="space-y-4">
          {members.map((m, idx) => (
            <div key={m.id} className="rounded-2xl bg-white/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <input
                  value={m.name}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((x) =>
                        x.id === m.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
                <span className="text-sm font-bold text-brand">{m.share}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={m.share}
                onChange={(e) =>
                  setMembers((prev) =>
                    prev.map((x) =>
                      x.id === m.id ? { ...x, share: Number(e.target.value) } : x,
                    ),
                  )
                }
                className="w-full accent-[var(--brand)]"
              />
              <p className="mt-2 text-xs text-ink-soft">
                {splits[idx].macros.kcal} kcal · P {splits[idx].macros.protein}g
              </p>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
