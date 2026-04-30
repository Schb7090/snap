import type { Tier, TierConfig, TierFeature } from "@src/types/tier";

export const TIER_CONFIGS: Readonly<Record<Tier, TierConfig>> = {
  free: {
    id: "free",
    receiptsPerMonth: 10,
    features: new Set<TierFeature>(["scan_receipt"]),
  },
  starter: {
    id: "starter",
    receiptsPerMonth: 50,
    features: new Set<TierFeature>(["scan_receipt", "export_csv"]),
  },
  pro: {
    id: "pro",
    receiptsPerMonth: "unlimited",
    features: new Set<TierFeature>([
      "scan_receipt",
      "export_csv",
      "export_excel",
      "ai_categories",
      "charts",
    ]),
  },
  business: {
    id: "business",
    receiptsPerMonth: "unlimited",
    features: new Set<TierFeature>([
      "scan_receipt",
      "export_csv",
      "export_excel",
      "ai_categories",
      "charts",
      "multi_user",
      "api_access",
    ]),
  },
};

export const TIER_LABELS_HU: Readonly<Record<Tier, string>> = {
  free: "Ingyenes",
  starter: "Kezdő",
  pro: "Profi",
  business: "Vállalati",
};
