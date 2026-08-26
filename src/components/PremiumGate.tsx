"use client";

import { useState, type ReactNode } from "react";
import { canUse, type FeatureId } from "@/lib/entitlements";
import { useFarfurieStore } from "@/lib/store";
import { Paywall } from "@/components/Paywall";
import { Crown } from "lucide-react";
import { t } from "@/lib/i18n";

export function PremiumGate({
  feature,
  children,
  fallback,
}: {
  feature: FeatureId;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const tier = useFarfurieStore((s) => s.subscriptionTier);
  const locale = useFarfurieStore((s) => s.locale);
  const [open, setOpen] = useState(false);

  if (canUse(tier, feature)) return <>{children}</>;

  if (fallback) {
    return (
      <>
        <button type="button" className="contents" onClick={() => setOpen(true)}>
          {fallback}
        </button>
        {open && <Paywall feature={feature} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="surface flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand">
            <Crown size={16} />
            Premium
          </span>
          <span className="mt-1 block text-sm text-ink-soft">{t(locale, "unlockPremium")}</span>
        </span>
        <span className="btn btn-primary !px-3 !py-2 text-sm">{t(locale, "upgrade")}</span>
      </button>
      {open && <Paywall feature={feature} onClose={() => setOpen(false)} />}
    </>
  );
}
