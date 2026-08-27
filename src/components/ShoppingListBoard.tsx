"use client";

import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function ShoppingListBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const shopping = useFarfurieStore((s) => s.shopping);
  const toggleShoppingItem = useFarfurieStore((s) => s.toggleShoppingItem);
  const clearCheckedShopping = useFarfurieStore((s) => s.clearCheckedShopping);
  const clearShopping = useFarfurieStore((s) => s.clearShopping);

  const remaining = shopping.filter((i) => !i.checked).length;

  return (
    <div className="space-y-6">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl md:text-4xl">{t(locale, "listTitle")}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "listDesc")}</p>
        </div>
        <p className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          {remaining}/{shopping.length}
        </p>
      </header>

      {shopping.length === 0 ? (
        <section className="surface p-8 text-center text-ink-soft">
          {t(locale, "listEmpty")}
        </section>
      ) : (
        <section className="surface divide-y divide-[var(--line)] overflow-hidden">
          {shopping.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleShoppingItem(item.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/60"
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-md border ${
                  item.checked
                    ? "border-brand bg-brand text-white"
                    : "border-[var(--line)] bg-white"
                }`}
              >
                {item.checked ? "✓" : ""}
              </span>
              <span
                className={`text-sm ${
                  item.checked ? "text-ink-soft line-through" : "font-semibold"
                }`}
              >
                {locale === "ro" ? item.nameRo : item.nameEn}
              </span>
            </button>
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost text-sm" onClick={clearCheckedShopping}>
          {t(locale, "clearChecked")}
        </button>
        <button type="button" className="btn btn-ghost text-sm" onClick={clearShopping}>
          {t(locale, "clearAll")}
        </button>
        <button type="button" className="btn btn-primary text-sm no-print" onClick={() => window.print()}>
          {t(locale, "printList")}
        </button>
      </div>
    </div>
  );
}
