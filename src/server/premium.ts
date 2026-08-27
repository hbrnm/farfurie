import type { FeatureId } from "@/lib/entitlements";
import { canUse } from "@/lib/entitlements";
import type { SubscriptionTier } from "@/domain/models";

/**
 * R1: there is no billing and no user session.
 * `x-farfurie-tier` is a leftover client hint — not authorization.
 * Treat every request as free until a verified server-side plan exists.
 */
export function tierFromRequest(request: Request): SubscriptionTier {
  void request;
  return "free";
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
