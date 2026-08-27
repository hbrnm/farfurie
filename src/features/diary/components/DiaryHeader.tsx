"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { localISO } from "@/lib/dates";
import { checkInDue } from "@/lib/metabolism";
import { useFarfurieStore } from "@/lib/store";
import { useEffectiveGoals, useMetabolism } from "@/lib/selectors";

export function DiaryHeader() {
  const locale = useFarfurieStore((s) => s.locale);
  const recovery = useFarfurieStore((s) => s.isRecovery());
  const startRecovery = useFarfurieStore((s) => s.startRecovery);
  const stopRecovery = useFarfurieStore((s) => s.stopRecovery);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const lastCheckInAt = useFarfurieStore((s) => s.lastCheckInAt);
  const applyWeeklyCheckIn = useFarfurieStore((s) => s.applyWeeklyCheckIn);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const trainingDays = useFarfurieStore((s) => s.trainingDays);
  const weekdayKeyFromISO = (iso: string) => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const d = new Date(`${iso}T12:00:00.000Z`);
    return days[d.getUTCDay()] as "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  };
  const goals = useEffectiveGoals();
  const report = useMetabolism();

  return (
    <div className="space-y-4">
      {recovery && (
        <section className="surface border-brand/40 p-4">
          <p className="font-semibold text-brand">{t(locale, "recovery")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "recoveryOn")}</p>
          <button
            type="button"
            className="btn btn-ghost mt-3 !px-3 !py-1.5 text-sm"
            onClick={stopRecovery}
          >
            {t(locale, "recoveryStop")}
          </button>
        </section>
      )}

      {holidayMode && !recovery && (
        <section className="surface border-accent/40 p-4">
          <p className="font-semibold">{t(locale, "holidays")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "featureRecoveryText")}</p>
          <button
            type="button"
            className="btn btn-primary mt-3 text-sm"
            onClick={startRecovery}
          >
            {t(locale, "recoveryStart")}
          </button>
        </section>
      )}

      {checkInDue(lastCheckInAt, localISO()) && (
        <section className="surface border-brand/40 p-4">
          <p className="font-semibold text-brand">{t(locale, "weeklyCheckIn")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "checkInBanner")}</p>
          <p className="mt-2 text-sm">
            {goals.kcal} → {report.suggestedKcal} kcal
            {report.expenditure != null
              ? ` · ${t(locale, "expenditure")} ${report.expenditure}`
              : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary text-sm"
              onClick={() => applyWeeklyCheckIn()}
            >
              {t(locale, "applyCheckIn")}
            </button>
            <Link href="/app/program" className="btn btn-ghost text-sm">
              {t(locale, "navProgram")}
            </Link>
          </div>
        </section>
      )}

      {trainingDays.includes(weekdayKeyFromISO(selectedDate)) && (
        <p className="text-xs font-semibold text-brand">{t(locale, "trainingToday")}</p>
      )}
    </div>
  );
}
