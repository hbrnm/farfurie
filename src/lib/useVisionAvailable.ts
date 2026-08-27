"use client";

import { useEffect, useState } from "react";

export function useVisionAvailable() {
  const [vision, setVision] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vision")
      .then((res) => res.json())
      .then((data: { vision?: boolean }) => {
        if (!cancelled) setVision(Boolean(data.vision));
      })
      .catch(() => {
        if (!cancelled) setVision(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return vision;
}
