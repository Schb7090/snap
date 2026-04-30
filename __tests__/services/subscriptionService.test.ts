import {
  checkScanQuota,
  checkFeature,
  checkLimit,
  remainingScans,
} from "@src/services/subscriptionService";
import type { Tier, TierFeature } from "@src/types/tier";

describe("checkScanQuota", () => {
  it.each<[Tier, number, boolean]>([
    ["free", 0, true],
    ["free", 9, true],
    ["free", 10, false],
    ["free", 11, false],
    ["starter", 49, true],
    ["starter", 50, false],
    ["pro", 9999, true],
    ["business", 99999, true],
  ])("tier=%s used=%i → allowed=%s", (tier, used, allowed) => {
    expect(checkScanQuota(tier, used).allowed).toBe(allowed);
  });

  it("returns used + limit when denied", () => {
    const r = checkScanQuota("free", 10);
    expect(r.allowed).toBe(false);
    if (!r.allowed && r.reason === "quota_exceeded") {
      expect(r.used).toBe(10);
      expect(r.limit).toBe(10);
    }
  });
});

describe("checkFeature", () => {
  const matrix: ReadonlyArray<[Tier, TierFeature, boolean]> = [
    ["free", "scan_receipt", true],
    ["free", "export_csv", false],
    ["free", "export_excel", false],
    ["free", "ai_categories", false],
    ["free", "multi_user", false],
    ["starter", "export_csv", true],
    ["starter", "export_excel", false],
    ["starter", "ai_categories", false],
    ["pro", "export_csv", true],
    ["pro", "export_excel", true],
    ["pro", "ai_categories", true],
    ["pro", "charts", true],
    ["pro", "multi_user", false],
    ["pro", "api_access", false],
    ["business", "export_excel", true],
    ["business", "multi_user", true],
    ["business", "api_access", true],
  ];

  it.each(matrix)("tier=%s feature=%s → allowed=%s", (tier, feature, allowed) => {
    expect(checkFeature(tier, feature).allowed).toBe(allowed);
  });

  it("returns the minimum required tier when denied", () => {
    const r = checkFeature("free", "export_csv");
    if (!r.allowed && r.reason === "feature_not_in_tier") {
      expect(r.requiredTier).toBe("starter");
    } else {
      throw new Error("expected feature_not_in_tier");
    }
  });

  it("returns pro for export_excel from free", () => {
    const r = checkFeature("free", "export_excel");
    if (!r.allowed && r.reason === "feature_not_in_tier") {
      expect(r.requiredTier).toBe("pro");
    } else {
      throw new Error("expected feature_not_in_tier");
    }
  });

  it("returns business for multi_user from any lower tier", () => {
    for (const tier of ["free", "starter", "pro"] as const) {
      const r = checkFeature(tier, "multi_user");
      if (!r.allowed && r.reason === "feature_not_in_tier") {
        expect(r.requiredTier).toBe("business");
      } else {
        throw new Error("expected feature_not_in_tier");
      }
    }
  });
});

describe("checkLimit", () => {
  it("combines quota and feature checks for scan_receipt", () => {
    expect(checkLimit("free", 0, "scan_receipt").allowed).toBe(true);
    expect(checkLimit("free", 10, "scan_receipt").allowed).toBe(false);
    expect(checkLimit("pro", 99999, "scan_receipt").allowed).toBe(true);
  });

  it("does not apply quota to non-scan features", () => {
    expect(checkLimit("pro", 99999, "export_excel").allowed).toBe(true);
  });
});

describe("remainingScans", () => {
  it.each<[Tier, number, number | "unlimited"]>([
    ["free", 0, 10],
    ["free", 7, 3],
    ["free", 10, 0],
    ["free", 99, 0],
    ["starter", 25, 25],
    ["pro", 100, "unlimited"],
    ["business", 9999, "unlimited"],
  ])("tier=%s used=%i → %s", (tier, used, expected) => {
    expect(remainingScans(tier, used)).toBe(expected);
  });
});
