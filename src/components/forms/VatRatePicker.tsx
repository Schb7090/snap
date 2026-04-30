import { View, Text, Pressable } from "react-native";
import type { VatRate } from "@src/types/money";

const RATES: readonly { value: VatRate; label: string }[] = [
  { value: 0.05, label: "5%" },
  { value: 0.18, label: "18%" },
  { value: 0.27, label: "27%" },
];

interface VatRatePickerProps {
  readonly value: VatRate;
  readonly onChange: (rate: VatRate) => void;
}

export function VatRatePicker({ value, onChange }: VatRatePickerProps) {
  return (
    <View className="flex-row rounded-2xl bg-gray-100 p-1">
      {RATES.map((r) => {
        const selected = value === r.value;
        return (
          <Pressable
            key={r.value}
            onPress={() => onChange(r.value)}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${selected ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`text-base ${selected ? "font-semibold text-gray-900" : "text-gray-500"}`}
            >
              {r.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
