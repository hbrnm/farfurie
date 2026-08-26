"use client";

import { useEffect } from "react";
import { useFarfurieStore } from "@/lib/store";

export function HtmlLang() {
  const locale = useFarfurieStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
