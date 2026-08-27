import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("POST /api/food/ai-estimate", () => {
  it("returns 402 even when the client spoofs premium", async () => {
    const req = new NextRequest("http://localhost/api/food/ai-estimate", {
      method: "POST",
      headers: { "x-farfurie-tier": "premium" },
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe("premium_required");
  });
});
