"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const SEED = [
  { id: "protein-30", nameRo: "30 zile proteină", nameEn: "30-day protein", members: 128 },
  { id: "water-club", nameRo: "Clubul apei", nameEn: "Water club", members: 64 },
];

export function TeamsBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const [joined, setJoined] = useState<string[]>(["water-club"]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-3xl">{t(locale, "teams")}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {locale === "ro"
            ? "Comunitate locală pe dispozitiv — provocări demo, fără server de chat."
            : "On-device community demo — no live chat server."}
        </p>
      </header>
      {SEED.map((team) => {
        const on = joined.includes(team.id);
        return (
          <article key={team.id} className="surface flex items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">{locale === "ro" ? team.nameRo : team.nameEn}</p>
              <p className="text-xs text-ink-soft">{team.members} {t(locale, "members")}</p>
            </div>
            <button
              type="button"
              className={on ? "btn btn-ghost text-sm" : "btn btn-primary text-sm"}
              onClick={() =>
                setJoined((prev) =>
                  on ? prev.filter((id) => id !== team.id) : [...prev, team.id],
                )
              }
            >
              {on ? t(locale, "leave") : t(locale, "join")}
            </button>
          </article>
        );
      })}
    </div>
  );
}
