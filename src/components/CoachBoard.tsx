"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { coachReply } from "@/lib/coach";
import { t } from "@/lib/i18n";
import { triggerHaptic } from "@/lib/haptics";
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

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

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
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleAskAI = async (promptText: string) => {
    if (!promptText.trim() || loading) return;
    triggerHaptic("light");
    const userMsg: Message = { id: String(Date.now()), sender: "user", text: promptText };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            remainingKcal: remaining.kcal,
            remainingProtein: remaining.protein,
            eatenKcal: eaten.kcal,
            goalKcal: goals.kcal,
            holidayMode: holiday,
          },
        }),
      });

      const data = (await res.json()) as { reply?: string };
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: data.reply || (locale === "ro" ? "Am întâmpinat o eroare." : "An error occurred."),
      };
      setChatHistory((prev) => [...prev, aiMsg]);
      triggerHaptic("success");
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: locale === "ro" ? "Nu am putut conecta AI-ul." : "Could not connect to AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "coachTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "coachDesc")}</p>
      </header>

      {/* Heuristic Instant Tip */}
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

      {/* AI Chat Area */}
      {chatHistory.length > 0 && (
        <section className="surface space-y-3 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
            <Bot size={16} />
            Conversație Gemini AI
          </p>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "user"
                      ? "bg-[var(--brand)] text-white"
                      : "border border-[var(--line)] bg-white/80 text-ink"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Ask Form */}
      <form
        className="surface space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setAsked(question);
          void handleAskAI(question);
        }}
      >
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <motion.button
              whileTap={{ scale: 0.94 }}
              key={p}
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-brand/10 hover:text-brand"
              onClick={() => {
                setQuestion(p);
                setAsked(p);
                void handleAskAI(p);
              }}
            >
              {p}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t(locale, "coachPh")}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="btn btn-primary !px-5"
          >
            {loading ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
