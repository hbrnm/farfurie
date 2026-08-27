import { describe, expect, it } from "vitest";
import { canUse, FEATURES, type FeatureId } from "@/lib/entitlements";

describe("entitlements", () => {
  it("allows free features on free tier", () => {
    expect(canUse("free", "textLog")).toBe(true);
    expect(canUse("free", "barcode")).toBe(true);
    expect(canUse("free", "weightTracking")).toBe(true);
  });

  it("allows R1 local features on free tier", () => {
    expect(canUse("free", "fastingTimer")).toBe(true);
    expect(canUse("free", "autoShopping")).toBe(true);
    expect(canUse("free", "historyExport")).toBe(true);
    expect(canUse("free", "customMacros")).toBe(true);
  });

  it("blocks mock Premium features on free tier", () => {
    expect(canUse("free", "photoLog")).toBe(false);
    expect(canUse("free", "voiceLog")).toBe(false);
    expect(canUse("free", "autoMealPlan")).toBe(false);
    expect(canUse("free", "bodyFat")).toBe(false);
    expect(canUse("free", "healthSync")).toBe(false);
  });

  it("allows all catalogued features on premium", () => {
    (Object.keys(FEATURES) as FeatureId[]).forEach((id) => {
      expect(canUse("premium", id)).toBe(true);
    });
  });
});
