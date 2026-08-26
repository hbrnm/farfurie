import type { FeatureId } from "@/lib/entitlements";
import { canUse } from "@/lib/entitlements";
import type { SubscriptionTier } from "@/domain/models";

export function tierFromRequest(request: Request): SubscriptionTier {
  const header = request.headers.get("x-farfurie-tier");
  return header === "premium" ? "premium" : "free";
}

export function premiumOrPaywall(request: Request, feature: FeatureId) {
  const tier = tierFromRequest(request);
  if (canUse(tier, feature)) return null;
  return Response.json(
    {
      error: "premium_required",
      feature,
      message: "This feature requires Farfurie Premium.",
    },
    { status: 402 },
  );
}
