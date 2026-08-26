"use client";

import { DiaryBoard } from "@/components/DiaryBoard";
import { MacroRing } from "@/components/MacroRing";
import { SideStats } from "@/components/SideStats";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export default function DiaryPage() {
  const locale = useFarfurieStore((s) => s.locale);

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "navDiary")}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {locale === "ro"
            ? "Astăzi · porții românești · buget inteligent"
            : "Today · Romanian portions · smart budget"}
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <MacroRing />
          <DiaryBoard />
        </div>
        <SideStats />
      </div>
    </div>
  );
}
