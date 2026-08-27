"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { coachReply } from "@/lib/coach";
import { t } from "@/lib/i18n";
import {
  useCurrentStreak,
  useEffectiveGoals,
  useRemaining,
  useTotals,
} from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

const PRESETS_RO = [
  "Am băut bere, ce mănânc?",
  "E Crăciun, cum țin farfuria?",
  "Îmi lipsește proteina",
];
const PRESETS_EN = [
  "I had a beer, what should I eat?",
  "It's Christmas — how do I hold the plate?",
  "I'm short on protein",
];

export function CoachBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const remaining = useRemaining();
  const eaten = useTotals();
  const goals = useEffectiveGoals();
  const holiday = useFarfurieStore((s) => s.holidayMode);
  const recovery = useFarfurieStore((s) => s.isRecovery());
  const streak = useCurrentStreak();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");

  const reply = useMemo(
    () =>
      coachReply({
        locale,
        remaining,
        eaten,
        goalKcal: goals.kcal,
        holiday,
        recovery,
        streak,
        question: asked,
      }),
    [locale, remaining, eaten, goals.kcal, holiday, recovery, streak, asked],
  );

  const presets = locale === "ro" ? PRESETS_RO : PRESETS_EN;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "coachTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "coachDesc")}</p>
      </header>

      <section className="surface p-5">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
          <Sparkles size={16} />
          {reply.title}
        </p>
        <p className="mt-3 text-sm leading-relaxed">{reply.body}</p>
        <ul className="mt-4 space-y-2">
          {reply.tips.map((tip) => (
            <li
              key={tip}
              className="rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-2 text-sm"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <form
        className="surface space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setAsked(question);
        }}
      >
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                setQuestion(p);
                setAsked(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t(locale, "coachPh")}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
        />
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          {t(locale, "askCoach")}
        </button>
      </form>
    </div>
  );
}
