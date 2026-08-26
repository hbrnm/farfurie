"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Camera,
  Cloud,
  Gauge,
  ScanBarcode,
  ShoppingBasket,
  Soup,
  Sparkles,
  Scale,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const items = [
  { href: "/app/scan", key: "navScan" as const, desc: "moreScan" as const, icon: ScanBarcode },
  { href: "/app/program", key: "navProgram" as const, desc: "programDesc" as const, icon: Gauge },
  { href: "/app/plate", key: "navPlate" as const, desc: "platePhotoDesc" as const, icon: Camera },
  { href: "/app/account", key: "navAccount" as const, desc: "accountDesc" as const, icon: Cloud },
  { href: "/app/coach", key: "navCoach" as const, desc: "moreCoach" as const, icon: Sparkles },
  { href: "/app/builder", key: "navBuilder" as const, desc: "builderDesc" as const, icon: UtensilsCrossed },
  { href: "/app/compare", key: "navCompare" as const, desc: "compareDesc" as const, icon: Scale },
  { href: "/app/insights", key: "navInsights" as const, desc: "openInsights" as const, icon: BarChart3 },
  { href: "/app/market", key: "navMarket" as const, desc: "openMarket" as const, icon: ShoppingBasket },
  { href: "/app/pot", key: "navPot" as const, desc: "openPot" as const, icon: Soup },
  { href: "/app/profile", key: "navProfile" as const, desc: "profileDesc" as const, icon: UserRound },
  { href: "/app/recipes", key: "navRecipes" as const, desc: "recipesDesc" as const, icon: BookOpen },
];

export default function MorePage() {
  const locale = useFarfurieStore((s) => s.locale);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "moreTitle")}</h1>
        <p className="mt-2 text-ink-soft">
          {locale === "ro"
            ? "Scan, coach, constructor, progres — tot ce bate Yazio și MFP pe România."
            : "Scan, coach, builder, progress — everything that beats Yazio and MFP in Romania."}
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ href, key, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface flex items-start gap-3 p-5 transition hover:-translate-y-0.5"
          >
            <span className="rounded-2xl bg-brand/10 p-2.5 text-brand">
              <Icon size={20} />
            </span>
            <span>
              <p className="display text-xl">{t(locale, key)}</p>
              <p className="mt-1 text-sm text-ink-soft">{t(locale, desc)}</p>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
