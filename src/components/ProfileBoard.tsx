"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { exercises } from "@/lib/activity";
import {
  calcBmr,
  calcCalorieGoal,
  calcTdee,
  type ActivityLevel,
  type GoalType,
  type ProfileInput,
  type Sex,
} from "@/lib/goals";
import { t } from "@/lib/i18n";
import { useBurnedToday, useTodayKey } from "@/lib/selectors";
import { onDate } from "@/lib/diary";
import { useFarfurieStore } from "@/lib/store";

export function ProfileBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const profile = useFarfurieStore((s) => s.profile);
  const goals = useFarfurieStore((s) => s.goals);
  const setProfile = useFarfurieStore((s) => s.setProfile);
  const applyProfileGoals = useFarfurieStore((s) => s.applyProfileGoals);
  const logExercise = useFarfurieStore((s) => s.logExercise);
  const removeExercise = useFarfurieStore((s) => s.removeExercise);
  const resetToday = useFarfurieStore((s) => s.resetToday);
  const resetAllLogs = useFarfurieStore((s) => s.resetAllLogs);
  const exportPayload = useFarfurieStore((s) => s.exportPayload);
  const exerciseLogs = useFarfurieStore((s) => s.exerciseLogs);
  const burnedToday = useBurnedToday();
  const today = useTodayKey();
  const todayLogs = onDate(exerciseLogs, today);
  const favoriteRecipeIds = useFarfurieStore((s) => s.favoriteRecipeIds);
  const tier = useFarfurieStore((s) => s.subscriptionTier);
  const setSubscriptionTier = useFarfurieStore((s) => s.setSubscriptionTier);
  const setCustomMacros = useFarfurieStore((s) => s.setCustomMacros);

  const [draft, setDraft] = useState<ProfileInput>(profile);
  const [exId, setExId] = useState(exercises[0].id);
  const [mins, setMins] = useState(30);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const preview = useMemo(() => {
    const kcal = calcCalorieGoal(draft);
    return {
      bmr: calcBmr(draft),
      tdee: calcTdee(draft),
      kcal,
    };
  }, [draft]);

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
          min={14}
          max={100}
          onChange={(v) => patch("age", v)}
        />
        <NumberField
          label={t(locale, "height")}
          value={draft.heightCm}
          min={120}
          max={230}
          onChange={(v) => patch("heightCm", v)}
        />
        <NumberField
          label={t(locale, "weight")}
          value={draft.weightKg}
          min={35}
          max={250}
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
        <h2 className="display text-2xl">{t(locale, "customTargets")}</h2>
        <button
          type="button"
          className="btn btn-ghost mt-3 w-full text-sm"
          onClick={() =>
            setCustomMacros({
              kcal: preview.kcal,
              protein: Math.round(profile.weightKg * 2),
              carbs: 180,
              fat: 55,
              waterMl: 2500,
            })
          }
        >
          {t(locale, "customTargets")}
        </button>
      </section>

      <section className="surface p-5">
        <h2 className="display text-2xl">{t(locale, "exercise")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t(locale, "exerciseDesc")}</p>
        <p className="mt-2 text-xs text-ink-soft">{t(locale, "exerciseNote")}</p>
        <p className="mt-3 text-sm font-semibold text-brand">
          {t(locale, "burned")}: {burnedToday} kcal
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
        {todayLogs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {todayLogs.map((log) => (
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
        <Link href="/app/progress" className="surface block p-5 transition hover:-translate-y-0.5">
          <p className="display text-xl">{t(locale, "navInsights")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "openInsights")}</p>
        </Link>
        <Link href="/app/recipes" className="surface block p-5 transition hover:-translate-y-0.5">
          <p className="display text-xl">{t(locale, "navRecipes")}</p>
        </Link>
        <Link href="/app/list" className="surface block p-5 transition hover:-translate-y-0.5">
          <p className="display text-xl">{t(locale, "navList")}</p>
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

      <section className="surface space-y-3 border-dashed p-5">
        <h2 className="display text-2xl">{t(locale, "devMode")}</h2>
        <p className="text-sm text-ink-soft">{t(locale, "devModeHint")}</p>
        <p className="text-sm font-semibold text-brand">
          {tier === "premium" ? t(locale, "premium") : t(locale, "free")}
        </p>
        {tier === "premium" ? (
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => setSubscriptionTier("free")}
          >
            {t(locale, "stopSimulate")}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => setSubscriptionTier("premium")}
          >
            {t(locale, "simulatePremium")}
          </button>
        )}
      </section>

      <section className="surface space-y-3 p-5">
        <p className="text-sm text-ink-soft">{t(locale, "disclaimer")}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              const blob = new Blob([JSON.stringify(exportPayload(), null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `farfurie-${today}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {t(locale, "exportData")}
          </button>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              const rows = useFarfurieStore.getState().entries.map(
                (e) =>
                  `${e.dateKey},${e.meal},${e.nameRo},${e.macros.kcal},${e.macros.protein},${e.macros.carbs},${e.macros.fat}`,
              );
              const csv = ["date,meal,name,kcal,protein,carbs,fat", ...rows].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `farfurie-${today}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {t(locale, "exportCsv")}
          </button>
          <button type="button" className="btn btn-ghost text-sm" onClick={resetToday}>
            {t(locale, "resetToday")}
          </button>
          <button type="button" className="btn btn-ghost text-sm" onClick={resetAllLogs}>
            {t(locale, "resetAll")}
          </button>
        </div>
      </section>
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
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
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
