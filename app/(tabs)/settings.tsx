import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import { Button } from "@src/components/ui/Button";
import { TierBadge } from "@src/components/ui/TierBadge";
import { useUserStore } from "@src/store/userStore";
import { TIER_LABELS_HU } from "@src/constants/tiers";
import { TIER_DETAILS } from "@src/constants/tierDetails";
import { formatHuf } from "@src/utils/currency";
import { huf } from "@src/types/money";
import { signOut as firebaseSignOut } from "@src/services/authService";
import { isFirebaseConfigured } from "@src/config/env";
import type { Tier } from "@src/types/tier";

const TIERS: readonly Tier[] = ["free", "starter", "pro", "business"];

export default function Settings() {
  const user = useUserStore((s) => s.user);
  const setTier = useUserStore((s) => s.setTier);
  const localSignOut = useUserStore((s) => s.signOut);

  const tier = user?.tier ?? "free";
  const detail = TIER_DETAILS[tier];

  const handleSignOut = async () => {
    if (isFirebaseConfigured()) {
      try {
        await firebaseSignOut();
      } catch {
        /* fall through to local clear */
      }
    }
    localSignOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">
          Beállítások
        </Text>

        <Card className="mb-4">
          <Text className="text-sm text-gray-500">Fiók</Text>
          <Text className="mt-1 text-base font-semibold text-gray-900">
            {user?.email ?? "—"}
          </Text>
          <View className="mt-3">
            <TierBadge tier={tier} />
          </View>
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs uppercase text-gray-400">
                Aktív csomag
              </Text>
              <Text className="mt-1 text-lg font-bold text-gray-900">
                {detail.nameHu}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {detail.priceHufPerMonth === 0
                  ? "Ingyenes"
                  : `${formatHuf(huf(detail.priceHufPerMonth))} / hó`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
          <View className="mt-4">
            <Button onPress={() => router.push("/upgrade")}>
              {tier === "business" ? "Csomagok megnézése" : "Csomag váltása"}
            </Button>
          </View>
        </Card>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="construct" size={16} color="#9ca3af" />
            <Text className="ml-2 text-xs uppercase text-gray-500">
              Fejlesztői mód — csomag váltó
            </Text>
          </View>
          <Card className="p-0">
            {TIERS.map((t, idx) => (
              <Pressable
                key={t}
                onPress={() => setTier(t)}
                className={`flex-row items-center justify-between px-4 py-4 active:bg-gray-50 ${
                  idx > 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <Text className="text-base text-gray-900">
                  {TIER_LABELS_HU[t]}
                </Text>
                {tier === t && (
                  <Ionicons name="checkmark" size={22} color="#2563eb" />
                )}
              </Pressable>
            ))}
          </Card>
          <Text className="mt-2 text-xs text-gray-400">
            Csak teszteléshez — élesben szerveroldali fizetés szükséges.
          </Text>
        </View>

        <Card className="mb-4">
          <Pressable
            onPress={() => router.push("/export")}
            className="flex-row items-center justify-between active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Ionicons name="share-outline" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-900">
                  Exportálás
                </Text>
                <Text className="text-sm text-gray-500">
                  CSV vagy Excel formátumban
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Card>

        <View className="mt-2">
          <Button variant="danger" onPress={handleSignOut}>
            Kijelentkezés
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
