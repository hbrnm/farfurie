import { describe, expect, it } from "vitest";
import { premiumOrPaywall, tierFromRequest } from "./premium";

function requestWith(header?: string) {
  return new Request("http://localhost/api/food/ai-estimate", {
    method: "POST",
    headers: header ? { "x-farfurie-tier": header } : undefined,
  });
}

describe("premium gate (R1)", () => {
  it("ignores a spoofed x-farfurie-tier header", () => {
    expect(tierFromRequest(requestWith("premium"))).toBe("free");
    expect(tierFromRequest(requestWith("free"))).toBe("free");
    expect(tierFromRequest(requestWith())).toBe("free");
  });

  it("blocks mock Premium APIs even when the client claims premium", async () => {
    const blocked = premiumOrPaywall(requestWith("premium"), "photoLog");
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(402);
  });

  it("allows R1-free features without a header", () => {
    expect(premiumOrPaywall(requestWith(), "textLog")).toBeNull();
    expect(premiumOrPaywall(requestWith(), "fastingTimer")).toBeNull();
  });
});
