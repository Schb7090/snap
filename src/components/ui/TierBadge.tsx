import { View, Text } from "react-native";
import { TIER_LABELS_HU } from "@src/constants/tiers";
import type { Tier } from "@src/types/tier";

const TIER_STYLE: Record<Tier, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  business: "bg-amber-100 text-amber-700",
};

export function TierBadge({ tier }: { readonly tier: Tier }) {
  const [bg, text] = TIER_STYLE[tier].split(" ");
  return (
    <View className={`self-start rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>
        {TIER_LABELS_HU[tier]}
      </Text>
    </View>
  );
}
