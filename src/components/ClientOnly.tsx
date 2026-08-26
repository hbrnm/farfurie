"use client";

import { useEffect, useState } from "react";

/** Avoid SSR/client mismatch with zustand persist. */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="mx-auto max-w-shell px-4 py-16 text-center text-ink-soft">
        Farfurie…
      </div>
    );
  }
  return children;
}
