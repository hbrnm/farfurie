import { describe, expect, it } from "vitest";
import { lookupBarcode, parseFoodText } from "@/server/catalog";

describe("catalog", () => {
  it("parses Romanian text with grams", () => {
    const parsed = parseFoodText("150g iaurt napolact la micul dejun", "ro", "lunch");
    expect(parsed).not.toBeNull();
    expect(parsed?.food.id).toBe("iaurt-napolact");
    expect(parsed?.grams).toBe(150);
    expect(parsed?.meal).toBe("breakfast");
  });

  it("looks up a verified barcode", () => {
    const food = lookupBarcode("5949046300123");
    expect(food?.id).toBe("iaurt-napolact");
  });

  it("returns null for unknown barcode", () => {
    expect(lookupBarcode("000")).toBeNull();
  });
});
