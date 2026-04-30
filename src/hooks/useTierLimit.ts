import { useUserStore } from "@src/store/userStore";
import { checkLimit } from "@src/services/subscriptionService";
import type { TierFeature } from "@src/types/tier";

export const useTierLimit = (feature: TierFeature) => {
  const tier = useUserStore((s) => s.user?.tier ?? "free");
  const receiptsThisMonth = useUserStore((s) => s.receiptsThisMonth);
  return checkLimit(tier, receiptsThisMonth, feature);
};
