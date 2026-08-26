"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Timer, X } from "lucide-react";
import { fastingProtocols, exercises } from "@/lib/activity";
import {
  calcBmr,
  calcTdee,
  type ActivityLevel,
  type GoalType,
  type ProfileInput,
  type Sex,
} from "@/lib/goals";
import { t } from "@/lib/i18n";
import { localISO } from "@/lib/dates";
import { useFarfurieStore } from "@/lib/store";

function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function ProfileBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const profile = useFarfurieStore((s) => s.profile);
  const goals = useFarfurieStore((s) => s.goals);
  const setProfile = useFarfurieStore((s) => s.setProfile);
  const applyProfileGoals = useFarfurieStore((s) => s.applyProfileGoals);
  const fastingProtocolId = useFarfurieStore((s) => s.fastingProtocolId);
  const setFastingProtocol = useFarfurieStore((s) => s.setFastingProtocol);
  const startFasting = useFarfurieStore((s) => s.startFasting);
  const stopFasting = useFarfurieStore((s) => s.stopFasting);
  const fastingStatus = useFarfurieStore((s) => s.fastingStatus);
  const logExercise = useFarfurieStore((s) => s.logExercise);
  const removeExercise = useFarfurieStore((s) => s.removeExercise);
  const exerciseLogs = useFarfurieStore((s) => s.exerciseLogs);
  const burnedTodayKcal = useFarfurieStore((s) => s.burnedOn(localISO()));
  const favoriteRecipeIds = useFarfurieStore((s) => s.favoriteRecipeIds);

  const [draft, setDraft] = useState<ProfileInput>(profile);
  const [exId, setExId] = useState(exercises[0].id);
  const [mins, setMins] = useState(30);
  const [, tick] = useState(0);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const preview = useMemo(() => {
    const kcal = (() => {
      const tdee = calcTdee(draft);
      if (draft.goal === "lose") return Math.max(1200, tdee - 400);
      if (draft.goal === "gain") return tdee + 300;
      return tdee;
    })();
    return {
      bmr: calcBmr(draft),
      tdee: calcTdee(draft),
      kcal,
    };
  }, [draft]);

  const status = fastingStatus();

  const patch = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "profileTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "profileDesc")}</p>
      </header>

      <section className="surface grid gap-5 p-5 md:grid-cols-2">
        <Field label={t(locale, "sex")}>
          <div className="flex gap-2">
            {(["female", "male"] as Sex[]).map((s) => (
              <Chip
                key={s}
                active={draft.sex === s}
                onClick={() => patch("sex", s)}
                label={t(locale, s)}
              />
            ))}
          </div>
        </Field>
        <Field label={t(locale, "goalType")}>
          <div className="flex flex-wrap gap-2">
            {(["lose", "maintain", "gain"] as GoalType[]).map((g) => (
              <Chip
                key={g}
                active={draft.goal === g}
                onClick={() => patch("goal", g)}
                label={t(locale, g)}
              />
            ))}
          </div>
        </Field>
        <NumberField
          label={t(locale, "age")}
          value={draft.age}
          onChange={(v) => patch("age", v)}
        />
        <NumberField
          label={t(locale, "height")}
          value={draft.heightCm}
          onChange={(v) => patch("heightCm", v)}
        />
        <NumberField
          label={t(locale, "weight")}
          value={draft.weightKg}
          onChange={(v) => patch("weightKg", v)}
        />
        <Field label={t(locale, "activity")}>
          <select
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            value={draft.activity}
            onChange={(e) => patch("activity", e.target.value as ActivityLevel)}
          >
            {(
              ["sedentary", "light", "moderate", "active", "athlete"] as ActivityLevel[]
            ).map((a) => (
              <option key={a} value={a}>
                {t(locale, a)}
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-2xl bg-brand/5 p-4 md:col-span-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label={t(locale, "bmr")} value={`${preview.bmr}`} />
            <Stat label={t(locale, "tdee")} value={`${preview.tdee}`} />
            <Stat label={t(locale, "goal")} value={`${preview.kcal}`} />
          </div>
          <button
            type="button"
            className="btn btn-primary mt-4 w-full"
            onClick={() => {
              setProfile(draft);
              applyProfileGoals();
            }}
          >
            {t(locale, "saveGoals")}
          </button>
          <p className="mt-2 text-center text-xs text-ink-soft">
            {t(locale, "goal")}: {goals.kcal} kcal · P {goals.protein}g · C{" "}
            {goals.carbs}g · F {goals.fat}g
          </p>
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-3 flex items-center gap-2 text-brand">
          <Timer size={18} />
          <h2 className="display text-2xl">{t(locale, "fasting")}</h2>
        </div>
        <p className="mb-4 text-sm text-ink-soft">{t(locale, "fastingDesc")}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {fastingProtocols.map((p) => (
            <Chip
              key={p.id}
              active={fastingProtocolId === p.id}
              onClick={() => setFastingProtocol(p.id)}
              label={p.label}
            />
          ))}
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-sm font-semibold text-ink-soft">
            {status.phase === "idle"
              ? status.protocol.label
              : status.phase === "fasting"
                ? t(locale, "fastingNow")
                : t(locale, "eatingNow")}
          </p>
          <p className="display mt-1 text-3xl text-brand">
            {status.active ? formatMins(status.remainingMin) : formatMins(status.protocol.fastHours * 60)}
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
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="display text-2xl">{t(locale, "exercise")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t(locale, "exerciseDesc")}</p>
        <p className="mt-3 text-sm font-semibold text-brand">
          {t(locale, "burned")}: {burnedTodayKcal} kcal
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            value={exId}
            onChange={(e) => setExId(e.target.value)}
          >
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {locale === "ro" ? e.nameRo : e.nameEn}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={5}
            max={300}
            value={mins}
            onChange={(e) => setMins(Number(e.target.value))}
            className="w-28 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            aria-label={t(locale, "minutes")}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => logExercise(exId, mins)}
          >
            {t(locale, "logExercise")}
          </button>
        </div>
        {exerciseLogs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {exerciseLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm"
              >
                <span>
                  {locale === "ro" ? log.nameRo : log.nameEn} · {log.minutes}{" "}
                  {t(locale, "minutes")} · {log.kcal} kcal
                </span>
                <button
                  type="button"
                  className="rounded-full p-1 text-ink-soft"
                  onClick={() => removeExercise(log.id)}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/app/pot" className="surface block p-5 transition hover:-translate-y-0.5">
          <p className="display text-xl">{t(locale, "navPot")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "openPot")}</p>
        </Link>
        <Link
          href="/app/insights"
          className="surface block p-5 transition hover:-translate-y-0.5"
        >
          <p className="display text-xl">{t(locale, "navInsights")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "openInsights")}</p>
        </Link>
        <Link
          href="/app/market"
          className="surface block p-5 transition hover:-translate-y-0.5 sm:col-span-2"
        >
          <p className="display text-xl">{t(locale, "navMarket")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "openMarket")}</p>
        </Link>
      </section>

      <p className="text-center text-xs text-ink-soft">
        {t(locale, "favorites")}: {favoriteRecipeIds.length}{" "}
        {locale === "ro" ? "rețete" : "recipes"}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-semibold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
      />
    </Field>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand text-white"
          : "border border-[var(--line)] bg-white/80 text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="display text-2xl text-brand">{value}</p>
    </div>
  );
}
