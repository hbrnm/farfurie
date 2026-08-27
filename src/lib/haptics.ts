"use client";

export type HapticType = "light" | "medium" | "heavy" | "success";

/**
 * Triggers a discrete haptic vibration feedback on supported mobile devices & PWAs.
 * Fails gracefully on desktop browsers.
 */
export function triggerHaptic(type: HapticType = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(25);
        break;
      case "heavy":
        navigator.vibrate(40);
        break;
      case "success":
        navigator.vibrate([10, 30, 20]);
        break;
    }
  } catch {
    // Ignore browser permission restrictions
  }
}
