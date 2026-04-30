import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import { Button } from "@src/components/ui/Button";
import { TierBadge } from "@src/components/ui/TierBadge";
import { UpgradePrompt } from "@src/components/subscription/UpgradePrompt";
import { ReceiptCard } from "@src/components/receipt/ReceiptCard";
import { useUserStore } from "@src/store/userStore";
import { useReceiptStore } from "@src/store/receiptStore";
import { useReceipts } from "@src/hooks/useReceipts";
import { remainingScans } from "@src/services/subscriptionService";
import { formatHuf } from "@src/utils/currency";
import { huf } from "@src/types/money";

export default function Dashboard() {
  useReceipts();
  const user = useUserStore((s) => s.user);
  const receiptsThisMonth = useUserStore((s) => s.receiptsThisMonth);
  const receipts = useReceiptStore((s) => s.receipts);

  const tier = user?.tier ?? "free";
  const remaining = remainingScans(tier, receiptsThisMonth);
  const totalThisMonth = receipts.reduce((sum, r) => sum + r.grossAmount, 0);

  const lowQuotaCount =
    remaining !== "unlimited" && remaining > 0 && remaining <= 2
      ? remaining
      : null;
  const nextTier = tier === "free" ? "starter" : "pro";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Üdv,</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.displayName ?? "Vendég"}
            </Text>
          </View>
          <TierBadge tier={tier} />
        </View>

        <Card className="mb-4">
          <Text className="text-sm text-gray-500">Ebben a hónapban</Text>
          <Text className="mt-1 text-3xl font-bold text-gray-900">
            {formatHuf(huf(totalThisMonth))}
          </Text>
          <Text className="mt-2 text-xs text-gray-400">
            {receiptsThisMonth} nyugta beolvasva
            {remaining !== "unlimited" && ` · ${remaining} maradt`}
          </Text>
        </Card>

        <Button className="mb-6" onPress={() => router.push("/(tabs)/scan")}>
          Új nyugta beolvasása
        </Button>

        {lowQuotaCount !== null && (
          <View className="mb-6">
            <UpgradePrompt
              reason="low_quota"
              requiredTier={nextTier}
              remaining={lowQuotaCount}
            />
          </View>
        )}

        <Text className="mb-3 text-base font-semibold text-gray-900">
          Legutóbbi nyugták
        </Text>

        {receipts.length === 0 ? (
          <Card>
            <Text className="text-center text-sm text-gray-500">
              Még nincs beolvasott nyugtád. Kezdd el a Beolvasás fülön!
            </Text>
          </Card>
        ) : (
          <View className="gap-2">
            {receipts.slice(0, 5).map((r) => (
              <ReceiptCard
                key={r.id}
                receipt={r}
                onPress={() => router.push(`/receipt/${r.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
