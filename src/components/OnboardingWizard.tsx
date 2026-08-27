"use client";

import { useMemo, useState } from "react";
import {
  calcBmr,
  calcTdee,
  type ActivityLevel,
  type GoalType,
  type ProfileInput,
  type Sex,
} from "@/lib/goals";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function OnboardingWizard() {
  const locale = useFarfurieStore((s) => s.locale);
  const setLocale = useFarfurieStore((s) => s.setLocale);
  const profile = useFarfurieStore((s) => s.profile);
  const setProfile = useFarfurieStore((s) => s.setProfile);
  const completeOnboarding = useFarfurieStore((s) => s.completeOnboarding);
  const onboardingDone = useFarfurieStore((s) => s.onboardingDone);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileInput>(profile);

  const preview = useMemo(() => {
    const tdee = calcTdee(draft);
    const kcal =
      draft.goal === "lose"
        ? Math.max(1200, tdee - 400)
        : draft.goal === "gain"
          ? tdee + 300
          : tdee;
    return { bmr: calcBmr(draft), tdee, kcal };
  }, [draft]);

  if (onboardingDone) return null;

  const patch = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/40 p-0 md:place-items-center md:p-6">
      <div className="surface max-h-[92vh] w-full max-w-lg overflow-auto rounded-t-3xl p-5 md:rounded-3xl">
        <p className="display text-2xl text-brand">{t(locale, "onboardWelcome")}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {step === 0
            ? t(locale, "onboardStep1")
            : step === 1
              ? t(locale, "onboardStep2")
              : t(locale, "onboardStep3")}
        </p>

        {step === 0 && (
          <div className="mt-5 space-y-4">
            <div className="flex gap-2">
              {(["ro", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    locale === l ? "bg-brand text-white" : "bg-white border border-[var(--line)]"
                  }`}
                  onClick={() => setLocale(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["lose", "maintain", "gain"] as GoalType[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    draft.goal === g
                      ? "bg-brand text-white"
                      : "bg-white border border-[var(--line)]"
                  }`}
                  onClick={() => patch("goal", g)}
                >
                  {t(locale, g)}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{t(locale, "installHint")}</p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold text-ink-soft">{t(locale, "sex")}</span>
              <select
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2"
                value={draft.sex}
                onChange={(e) => patch("sex", e.target.value as Sex)}
              >
                <option value="female">{t(locale, "female")}</option>
                <option value="male">{t(locale, "male")}</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold text-ink-soft">{t(locale, "activity")}</span>
              <select
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2"
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
            </label>
            {(
              [
                ["age", "age"],
                ["heightCm", "height"],
                ["weightKg", "weight"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="text-sm">
                <span className="font-semibold text-ink-soft">{t(locale, label)}</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2"
                  value={draft[field]}
                  onChange={(e) => patch(field, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 rounded-2xl bg-brand/5 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {t(locale, "goal")}
            </p>
            <p className="display text-4xl text-brand">{preview.kcal}</p>
            <p className="text-sm text-ink-soft">
              BMR {preview.bmr} · TDEE {preview.tdee}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              {t(locale, "onboardBack")}
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setProfile(draft);
                setStep((s) => s + 1);
              }}
            >
              {t(locale, "onboardNext")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setProfile(draft);
                completeOnboarding();
              }}
            >
              {t(locale, "onboardFinish")}
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              setProfile(draft);
              completeOnboarding();
            }}
          >
            {t(locale, "onboardSkip")}
          </button>
        </div>
      </div>
    </div>
  );
}
