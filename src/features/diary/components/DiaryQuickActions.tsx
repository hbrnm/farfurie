"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Droplets, FileText, Search, Share2, Sparkles, PlusCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { dayShareText } from "@/lib/share";
import { triggerHaptic } from "@/lib/haptics";
import { type DiaryEntry, useFarfurieStore } from "@/lib/store";
import { useBurnedToday, useEffectiveGoals, useTotals } from "@/lib/selectors";

type Props = {
  entries: DiaryEntry[];
};

export function DiaryQuickActions({ entries }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const addWater = useFarfurieStore((s) => s.addWater);
  const dayNotes = useFarfurieStore((s) => s.dayNotes);
  const setDayNote = useFarfurieStore((s) => s.setDayNote);
  const waterByDate = useFarfurieStore((s) => s.waterByDate);

  const goals = useEffectiveGoals();
  const totals = useTotals();
  const burned = useBurnedToday();
  const waterMl = waterByDate[selectedDate] ?? 0;

  const [shareFeedback, setShareFeedback] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const currentNote = dayNotes[selectedDate] ?? "";

  const handleAddWater = () => {
    triggerHaptic("light");
    addWater();
  };

  const handleShare = async () => {
    triggerHaptic("light");
    const text = dayShareText({
      locale,
      date: selectedDate,
      entries,
      totals,
      goalKcal: goals.kcal,
      burned,
      waterMl,
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: "Farfurie", text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Cards Grid (Inspired by Mockup 2) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Scaner AI */}
        <Link href="/app/plate">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="surface flex flex-col justify-between p-3.5 transition-colors hover:border-emerald-500/40"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                <Camera size={20} />
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Gemini 2.5
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-gray-900">Scaner AI</p>
              <p className="text-[11px] text-ink-soft">Foto farfurie</p>
            </div>
          </motion.div>
        </Link>

        {/* Căutare Market */}
        <Link href="/app/market">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="surface flex flex-col justify-between p-3.5 transition-colors hover:border-amber-500/40"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                <Search size={20} />
              </div>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Bază RO
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-gray-900">Căutare Aliment</p>
              <p className="text-[11px] text-ink-soft">Supermarketuri</p>
            </div>
          </motion.div>
        </Link>

        {/* Adaugă Apă */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleAddWater}
          className="surface flex flex-col justify-between p-3.5 text-left transition-colors hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <Droplets size={20} />
            </div>
            <span className="text-xs font-bold text-blue-600">+250ml</span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-900">Hidratare</p>
            <p className="text-[11px] text-ink-soft">{waterMl} ml total</p>
          </div>
        </motion.button>

        {/* Notă & Share */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleShare}
          className="surface flex flex-col justify-between p-3.5 text-left transition-colors hover:border-purple-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <Share2 size={20} />
            </div>
            <span className="text-xs font-bold text-purple-600">Export</span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-900">Trimite Sumar</p>
            <p className="text-[11px] text-ink-soft">Text / WhatsApp</p>
          </div>
        </motion.button>
      </div>

      {/* Toolbar secundar pentru Notă de zi */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-brand"
          onClick={() => setNoteOpen(!noteOpen)}
        >
          <FileText size={14} />
          {t(locale, "dayNote")}
        </button>
      </div>

      {shareFeedback && (
        <p className="text-xs font-semibold text-brand">{t(locale, "copiedShare")}</p>
      )}

      {noteOpen && (
        <div className="surface p-4 animate-rise">
          <textarea
            value={currentNote}
            onChange={(e) => setDayNote(selectedDate, e.target.value)}
            placeholder={t(locale, "dayNotePh")}
            className="w-full rounded-2xl border border-[var(--line)] bg-white/70 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
