export type Tier = "free" | "starter" | "pro" | "business";

export type TierFeature =
  | "scan_receipt"
  | "export_csv"
  | "export_excel"
  | "ai_categories"
  | "charts"
  | "multi_user"
  | "api_access";

export interface TierConfig {
  readonly id: Tier;
  readonly receiptsPerMonth: number | "unlimited";
  readonly features: ReadonlySet<TierFeature>;
}

export type LimitCheck =
  | { allowed: true }
  | { allowed: false; reason: "quota_exceeded"; used: number; limit: number }
  | { allowed: false; reason: "feature_not_in_tier"; requiredTier: Tier };
