"use client";

import { Timer } from "lucide-react";
import { fastingProtocols } from "@/lib/activity";
import { t } from "@/lib/i18n";
import { useFastingStatus } from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";
import { PremiumGate } from "@/components/PremiumGate";

function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function FastingBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const fastingProtocolId = useFarfurieStore((s) => s.fastingProtocolId);
  const setFastingProtocol = useFarfurieStore((s) => s.setFastingProtocol);
  const startFasting = useFarfurieStore((s) => s.startFasting);
  const stopFasting = useFarfurieStore((s) => s.stopFasting);
  const reminders = useFarfurieStore((s) => s.reminders);
  const setReminders = useFarfurieStore((s) => s.setReminders);
  const status = useFastingStatus();

  return (
    <PremiumGate feature="fastingTimer">
      <div className="space-y-6">
        <header>
          <h1 className="display text-3xl md:text-4xl">{t(locale, "fasting")}</h1>
          <p className="mt-2 text-ink-soft">{t(locale, "fastingDesc")}</p>
        </header>
        <section className="surface p-5">
          <div className="mb-3 flex items-center gap-2 text-brand">
            <Timer size={18} />
            <h2 className="display text-2xl">{status.protocol.label}</h2>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {fastingProtocols.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFastingProtocol(p.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  fastingProtocolId === p.id
                    ? "bg-brand text-white"
                    : "border border-[var(--line)] bg-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="display text-4xl text-brand">
            {status.active
              ? formatMins(status.remainingMin)
              : formatMins(status.protocol.fastHours * 60)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {status.phase === "idle"
              ? status.protocol.label
              : status.phase === "fasting"
                ? t(locale, "fastingNow")
                : t(locale, "eatingNow")}
          </p>
          <div className="mt-4 flex gap-2">
            {!status.active ? (
              <button type="button" className="btn btn-primary" onClick={startFasting}>
                {t(locale, "startFast")}
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={stopFasting}>
                {t(locale, "stopFast")}
              </button>
            )}
          </div>
        </section>
        <section className="surface p-5">
          <h2 className="display text-xl">{t(locale, "reminders")}</h2>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reminders.meals}
              onChange={(e) => setReminders({ ...reminders, meals: e.target.checked })}
            />
            {t(locale, "fasting")}
          </label>
        </section>
      </div>
    </PremiumGate>
  );
}
