"use client";

import { Timer } from "lucide-react";
import { PremiumGate } from "@/components/PremiumGate";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function WeightCard() {
  const locale = useFarfurieStore((s) => s.locale);
  const profile = useFarfurieStore((s) => s.profile);
  const weightLogs = useFarfurieStore((s) => s.weightLogs);
  const addWeightLog = useFarfurieStore((s) => s.addWeightLog);
  const last = weightLogs.at(-1);

  return (
    <section className="surface p-5">
      <h2 className="display text-2xl">{t(locale, "weightLog")}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {last
          ? `${last.kg} kg · ${last.dateKey}`
          : `${profile.weightKg} kg (${t(locale, "demoProfile")})`}
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addWeightLog(Number(fd.get("kg")));
        }}
      >
        <input
          name="kg"
          type="number"
          step="0.1"
          min={35}
          max={250}
          defaultValue={last?.kg ?? profile.weightKg}
          className="w-28 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="btn btn-primary text-sm">
          {t(locale, "logWeight")}
        </button>
      </form>
    </section>
  );
}

export function PremiumProgressExtras() {
  const locale = useFarfurieStore((s) => s.locale);
  const addBodyFatLog = useFarfurieStore((s) => s.addBodyFatLog);
  const bodyFatLogs = useFarfurieStore((s) => s.bodyFatLogs);
  const addProgressPhoto = useFarfurieStore((s) => s.addProgressPhoto);
  const photos = useFarfurieStore((s) => s.progressPhotos);

  return (
    <div className="space-y-4">
      <PremiumGate feature="bodyFat">
        <section className="surface p-5">
          <h2 className="display text-2xl">{t(locale, "bodyFat")}</h2>
          <p className="text-sm text-ink-soft">{bodyFatLogs.at(-1)?.percent ?? "—"}%</p>
          <button
            type="button"
            className="btn btn-ghost mt-3 text-sm"
            onClick={() => addBodyFatLog(24.5)}
          >
            {t(locale, "add")} 24.5%
          </button>
        </section>
      </PremiumGate>
      <PremiumGate feature="progressPhotos">
        <section className="surface p-5">
          <h2 className="display text-2xl">{t(locale, "progressPhotos")}</h2>
          <input
            type="file"
            accept="image/*"
            className="mt-3 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") addProgressPhoto(reader.result);
              };
              reader.readAsDataURL(file);
            }}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.dataUrl} alt="" className="h-28 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      </PremiumGate>
      <PremiumGate feature="healthSync">
        <section className="surface p-5">
          <div className="flex items-center gap-2 text-brand">
            <Timer size={16} />
            <h2 className="display text-xl">{t(locale, "healthSync")}</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {locale === "ro"
              ? "HealthKit / Health Connect se leagă în aplicația nativă. Aici e doar poarta Premium."
              : "HealthKit / Health Connect attach in the native app. This is the Premium gate."}
          </p>
        </section>
      </PremiumGate>
    </div>
  );
}
