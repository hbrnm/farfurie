"use client";

import { Crown } from "lucide-react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";
import type { FeatureId } from "@/lib/entitlements";

export function Paywall({
  feature,
  onClose,
}: {
  feature?: FeatureId;
  onClose?: () => void;
}) {
  const locale = useFarfurieStore((s) => s.locale);
  const setSubscriptionTier = useFarfurieStore((s) => s.setSubscriptionTier);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-black/40 p-0 md:place-items-center md:p-6">
      <div className="surface max-h-[92vh] w-full max-w-md overflow-auto rounded-t-3xl p-6 md:rounded-3xl">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
          <Crown size={16} />
          Farfurie Premium
        </p>
        <h2 className="display mt-2 text-3xl">{t(locale, "paywallTitle")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t(locale, "paywallBody")}</p>
        {feature && (
          <p className="mt-3 rounded-2xl bg-brand/5 px-3 py-2 text-xs font-semibold text-brand">
            {feature}
          </p>
        )}
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          <li>· {t(locale, "paywallPhoto")}</li>
          <li>· {t(locale, "paywallPlan")}</li>
          <li>· {t(locale, "paywallFasting")}</li>
          <li>· {t(locale, "paywallProgress")}</li>
        </ul>
        <button
          type="button"
          className="btn btn-primary mt-6 w-full"
          onClick={() => {
            setSubscriptionTier("premium");
            onClose?.();
          }}
        >
          {t(locale, "upgrade")}
        </button>
        {onClose && (
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={onClose}>
            {t(locale, "notNow")}
          </button>
        )}
      </div>
    </div>
  );
}
