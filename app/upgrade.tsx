import { ScrollView, Text, View, Alert } from "react-native";
import { router } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { TierCard } from "@src/components/subscription/TierCard";
import {
  TIER_DETAILS,
  TIER_ORDER_DESC,
  isUpgrade,
} from "@src/constants/tierDetails";
import { useUserStore } from "@src/store/userStore";
import type { Tier } from "@src/types/tier";

export default function UpgradeScreen() {
  const currentTier = useUserStore((s) => s.user?.tier ?? "free");

  const handleSelect = (tier: Tier) => {
    if (tier === currentTier) return;

    if (isUpgrade(currentTier, tier)) {
      Alert.alert(
        "Fizetés hamarosan",
        "Az online fizetés még nem aktív. Hamarosan elérhető lesz Apple Pay, Google Pay és bankkártyával.",
        [{ text: "Rendben" }],
      );
      return;
    }

    Alert.alert(
      "Csomag váltás",
      `Biztosan visszaváltasz a ${TIER_DETAILS[tier].nameHu} csomagra?`,
      [
        { text: "Mégse", style: "cancel" },
        {
          text: "Visszaváltás",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Csomag váltás hamarosan",
              "A csomag módosítás szerveroldali feldolgozást igényel — hamarosan elérhető.",
            );
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Csomagok</Text>
          <Text className="mt-1 text-base text-gray-500">
            Válaszd ki, ami a legjobban illik hozzád. Bármikor válthatsz.
          </Text>
        </View>

        <View className="gap-3">
          {TIER_ORDER_DESC.map((tier) => (
            <TierCard
              key={tier}
              detail={TIER_DETAILS[tier]}
              currentTier={tier === currentTier}
              onSelect={() => handleSelect(tier)}
            />
          ))}
        </View>

        <Text className="mt-6 text-center text-xs text-gray-400">
          Az árak ÁFA-t tartalmaznak. Bármikor lemondható.
        </Text>
        <View className="mt-3 items-center">
          <Text
            className="text-sm text-brand-600 underline"
            onPress={() => router.back()}
          >
            Vissza
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
