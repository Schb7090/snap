import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@src/components/ui/Button";
import { formatHuf } from "@src/utils/currency";
import { huf } from "@src/types/money";
import type { TierDetail } from "@src/constants/tierDetails";

interface TierCardProps {
  readonly detail: TierDetail;
  readonly currentTier: boolean;
  readonly onSelect: () => void;
  readonly disabled?: boolean;
}

export function TierCard({
  detail,
  currentTier,
  onSelect,
  disabled = false,
}: TierCardProps) {
  const priceLabel =
    detail.priceHufPerMonth === 0
      ? "Ingyenes"
      : `${formatHuf(huf(detail.priceHufPerMonth))} / hó`;

  return (
    <View
      className={`rounded-2xl border p-5 ${
        detail.highlight
          ? "border-brand-600 bg-brand-50"
          : "border-gray-200 bg-white"
      } ${currentTier ? "border-2" : ""}`}
    >
      {detail.highlight && !currentTier && (
        <View className="mb-2 self-start rounded-full bg-brand-600 px-3 py-1">
          <Text className="text-xs font-semibold text-white">Ajánlott</Text>
        </View>
      )}
      {currentTier && (
        <View className="mb-2 self-start rounded-full bg-gray-900 px-3 py-1">
          <Text className="text-xs font-semibold text-white">
            Aktív csomag
          </Text>
        </View>
      )}

      <Text className="text-2xl font-bold text-gray-900">{detail.nameHu}</Text>
      <Text className="mt-1 text-sm text-gray-500">{detail.taglineHu}</Text>
      <Text className="mt-3 text-3xl font-bold text-gray-900">
        {priceLabel}
      </Text>

      <View className="mt-4">
        {detail.benefitsHu.map((benefit) => (
          <View key={benefit} className="mb-2 flex-row items-start">
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={detail.highlight ? "#2563eb" : "#22c55e"}
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <Text className="flex-1 text-sm text-gray-700">{benefit}</Text>
          </View>
        ))}
      </View>

      {!currentTier && (
        <View className="mt-5">
          <Button
            variant={detail.highlight ? "primary" : "secondary"}
            onPress={onSelect}
            disabled={disabled}
          >
            {detail.priceHufPerMonth === 0
              ? "Visszaváltás Ingyenesre"
              : "Csomag választása"}
          </Button>
        </View>
      )}
    </View>
  );
}
