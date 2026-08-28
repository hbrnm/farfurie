"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Copy, Flame } from "lucide-react";
import { formatDiaryDate, localISO, parseISO, shiftISO, weekISODates } from "@/lib/dates";
import { triggerHaptic } from "@/lib/haptics";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const RO_DAY_NAMES = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const EN_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyCalendarStrip() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const setSelectedDate = useFarfurieStore((s) => s.setSelectedDate);
  const copyPreviousDay = useFarfurieStore((s) => s.copyPreviousDay);
  const TODAY = localISO();

  const datesInWeek = useMemo(() => weekISODates(selectedDate), [selectedDate]);

  const handlePrevWeek = () => {
    triggerHaptic("light");
    setSelectedDate(shiftISO(selectedDate, -7));
  };

  const handleNextWeek = () => {
    triggerHaptic("light");
    setSelectedDate(shiftISO(selectedDate, 7));
  };

  const handleSelectDay = (iso: string) => {
    triggerHaptic("light");
    setSelectedDate(iso);
  };

  const handleCopyPrevDay = () => {
    triggerHaptic("medium");
    copyPreviousDay();
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Current Month/Date Display & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/80 dark:bg-zinc-900 px-3 py-1 text-xs font-extrabold text-gray-900 dark:text-white shadow-sm">
            <Calendar size={13} className="text-emerald-500" />
            <span className="capitalize">{formatDiaryDate(selectedDate, locale)}</span>
          </div>

          {selectedDate !== TODAY && (
            <button
              type="button"
              onClick={() => handleSelectDay(TODAY)}
              className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-black text-emerald-600 dark:text-[#55dc88] uppercase tracking-wider hover:bg-emerald-500/25 transition-all"
            >
              {locale === "ro" ? "Azi" : "Today"}
            </button>
          )}
        </div>

        {/* Copy previous day action */}
        <button
          type="button"
          onClick={handleCopyPrevDay}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/70 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          title={t(locale, "copyPrevDay")}
        >
          <Copy size={13} className="text-emerald-500" />
          <span>{t(locale, "copyPrevDay")}</span>
        </button>
      </div>

      {/* Weekly Calendar Strip Row */}
      <div className="flex items-center justify-between gap-1 rounded-2xl border border-[var(--line)] bg-white/80 dark:bg-[#121214] p-1.5 shadow-sm">
        <button
          type="button"
          onClick={handlePrevWeek}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors shrink-0"
          aria-label="Săptămâna anterioară"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="grid flex-1 grid-cols-7 gap-1">
          {datesInWeek.map((iso) => {
            const dateObj = parseISO(iso);
            const dayNum = dateObj.getDate();
            const dayName = locale === "ro" ? RO_DAY_NAMES[dateObj.getDay()] : EN_DAY_NAMES[dateObj.getDay()];
            const isSelected = iso === selectedDate;
            const isToday = iso === TODAY;

            return (
              <motion.button
                key={iso}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => handleSelectDay(iso)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 transition-all ${
                  isSelected
                    ? "bg-emerald-600 dark:bg-[#f13a30] text-white font-bold shadow-md shadow-emerald-500/20 dark:shadow-rose-500/30"
                    : "bg-transparent text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-white/90" : "text-gray-400 dark:text-zinc-500"}`}>
                  {dayName}
                </span>
                <span className="display text-sm font-extrabold mt-0.5 leading-none">
                  {dayNum}
                </span>

                {/* Today Indicator Dot */}
                {isToday && (
                  <span
                    className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-emerald-500 dark:bg-[#55dc88]"
                    }`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextWeek}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors shrink-0"
          aria-label="Săptămâna următoare"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
