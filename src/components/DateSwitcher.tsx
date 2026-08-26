"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { formatDiaryDate, localISO } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function DateSwitcher() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const shiftSelectedDate = useFarfurieStore((s) => s.shiftSelectedDate);
  const goToToday = useFarfurieStore((s) => s.goToToday);
  const copyPreviousDay = useFarfurieStore((s) => s.copyPreviousDay);
  const previousDayHasMeals = useFarfurieStore((s) => s.previousDayHasMeals());
  const isToday = selectedDate === localISO();
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-white/80 p-2 text-ink-soft hover:bg-white"
          onClick={() => {
            setCopied(false);
            shiftSelectedDate(-1);
          }}
          aria-label={t(locale, "prevDay")}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="display text-xl capitalize md:text-2xl">
            {formatDiaryDate(selectedDate, locale)}
          </p>
          {!isToday && (
            <button
              type="button"
              className="text-xs font-semibold text-brand"
              onClick={() => {
                setCopied(false);
                goToToday();
              }}
            >
              {t(locale, "today")}
            </button>
          )}
        </div>
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-white/80 p-2 text-ink-soft hover:bg-white disabled:opacity-30"
          onClick={() => {
            setCopied(false);
            shiftSelectedDate(1);
          }}
          disabled={isToday}
          aria-label={t(locale, "nextDay")}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <button
        type="button"
        className="btn btn-ghost !px-3 !py-2 text-sm"
        disabled={!previousDayHasMeals}
        title={!previousDayHasMeals ? t(locale, "noPrevDay") : t(locale, "copyPrevDay")}
        onClick={() => {
          const n = copyPreviousDay();
          if (n > 0) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        <Copy size={14} />
        {copied ? t(locale, "copiedMeals") : t(locale, "copyPrevDay")}
      </button>
    </div>
  );
}
