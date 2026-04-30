import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@src/components/ui/Button";
import { TIER_DETAILS } from "@src/constants/tierDetails";
import { formatHuf } from "@src/utils/currency";
import { huf } from "@src/types/money";
import type { Tier } from "@src/types/tier";

export type UpgradeReason = "quota_exceeded" | "feature_locked" | "low_quota";

interface UpgradePromptProps {
  readonly reason: UpgradeReason;
  readonly requiredTier: Tier;
  readonly used?: number;
  readonly limit?: number;
  readonly remaining?: number;
}

const TITLE_HU: Record<UpgradeReason, string> = {
  quota_exceeded: "Havi limit elérve",
  feature_locked: "Magasabb csomag szükséges",
  low_quota: "Fogyóban a havi keret",
};

export function UpgradePrompt({
  reason,
  requiredTier,
  used,
  limit,
  remaining,
}: UpgradePromptProps) {
  const detail = TIER_DETAILS[requiredTier];
  const priceLabel =
    detail.priceHufPerMonth === 0
      ? "Ingyenes"
      : `${formatHuf(huf(detail.priceHufPerMonth))} / hó`;

  const subtitle = (() => {
    if (reason === "quota_exceeded" && used !== undefined && limit !== undefined) {
      return `${used}/${limit} nyugta felhasználva ebben a hónapban.`;
    }
    if (reason === "low_quota" && remaining !== undefined) {
      return `Csak ${remaining} nyugta van hátra ebben a hónapban.`;
    }
    return `Ez a funkció a ${detail.nameHu} csomagtól érhető el.`;
  })();

  return (
    <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <View className="mb-2 flex-row items-center">
        <Ionicons name="lock-closed" size={18} color="#b45309" />
        <Text className="ml-2 text-base font-semibold text-amber-900">
          {TITLE_HU[reason]}
        </Text>
      </View>
      <Text className="mb-3 text-sm text-amber-800">{subtitle}</Text>
      <Text className="mb-3 text-sm text-amber-900">
        Frissíts a <Text className="font-semibold">{detail.nameHu}</Text>{" "}
        csomagra — {priceLabel}.
      </Text>
      <Button onPress={() => router.push("/upgrade")}>Csomagok megnézése</Button>
    </View>
  );
}
