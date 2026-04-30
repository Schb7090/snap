import { TIER_CONFIGS } from "@src/constants/tiers";
import type { LimitCheck, Tier, TierFeature } from "@src/types/tier";

const TIER_ORDER: readonly Tier[] = ["free", "starter", "pro", "business"];

const minTierFor = (feature: TierFeature): Tier => {
  for (const tier of TIER_ORDER) {
    if (TIER_CONFIGS[tier].features.has(feature)) return tier;
  }
  return "business";
};

export const checkScanQuota = (
  tier: Tier,
  receiptsThisMonth: number,
): LimitCheck => {
  const config = TIER_CONFIGS[tier];
  if (config.receiptsPerMonth === "unlimited") {
    return { allowed: true };
  }
  if (receiptsThisMonth < config.receiptsPerMonth) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "quota_exceeded",
    used: receiptsThisMonth,
    limit: config.receiptsPerMonth,
  };
};

export const checkFeature = (tier: Tier, feature: TierFeature): LimitCheck => {
  if (TIER_CONFIGS[tier].features.has(feature)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "feature_not_in_tier",
    requiredTier: minTierFor(feature),
  };
};

export const checkLimit = (
  tier: Tier,
  receiptsThisMonth: number,
  feature: TierFeature,
): LimitCheck => {
  if (feature === "scan_receipt") {
    const featureCheck = checkFeature(tier, feature);
    if (!featureCheck.allowed) return featureCheck;
    return checkScanQuota(tier, receiptsThisMonth);
  }
  return checkFeature(tier, feature);
};

export const remainingScans = (
  tier: Tier,
  receiptsThisMonth: number,
): number | "unlimited" => {
  const config = TIER_CONFIGS[tier];
  if (config.receiptsPerMonth === "unlimited") return "unlimited";
  return Math.max(0, config.receiptsPerMonth - receiptsThisMonth);
};
