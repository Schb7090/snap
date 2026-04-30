import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatHuf } from "@src/utils/currency";
import { findCategory } from "@src/constants/categories";
import type { Receipt } from "@src/types/receipt";

interface ReceiptCardProps {
  readonly receipt: Receipt;
  readonly onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const category = receipt.category ? findCategory(receipt.category) : undefined;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl bg-white p-4 border border-gray-100 active:bg-gray-50"
    >
      <View
        className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category?.color ?? "#6b7280"}20` }}
      >
        <Ionicons
          name={(category?.icon ?? "receipt") as keyof typeof Ionicons.glyphMap}
          size={22}
          color={category?.color ?? "#6b7280"}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {receipt.merchant}
        </Text>
        <Text className="text-sm text-gray-500">
          {receipt.date} · {category?.labelHu ?? "Nincs kategória"}
        </Text>
      </View>
      <Text className="text-base font-semibold text-gray-900">
        {formatHuf(receipt.grossAmount)}
      </Text>
    </Pressable>
  );
}
