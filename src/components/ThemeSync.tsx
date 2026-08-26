"use client";

import { useEffect } from "react";
import { useFarfurieStore } from "@/lib/store";

export function ThemeSync() {
  const theme = useFarfurieStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}
