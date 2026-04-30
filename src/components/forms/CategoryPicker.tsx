import { ScrollView, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_CATEGORIES } from "@src/constants/categories";

interface CategoryPickerProps {
  readonly value: string | null;
  readonly onChange: (categoryId: string | null) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
    >
      {DEFAULT_CATEGORIES.map((cat) => {
        const selected = value === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(selected ? null : cat.id)}
            className={`items-center rounded-2xl border px-3 py-3 ${selected ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}
            style={{ minWidth: 84 }}
          >
            <View
              className="mb-1 h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${cat.color}20` }}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={cat.color}
              />
            </View>
            <Text
              className={`text-xs ${selected ? "font-semibold text-brand-700" : "text-gray-700"}`}
              numberOfLines={1}
            >
              {cat.labelHu}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
