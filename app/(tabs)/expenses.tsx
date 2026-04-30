import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import { Button } from "@src/components/ui/Button";
import { ReceiptCard } from "@src/components/receipt/ReceiptCard";
import { useReceiptStore } from "@src/store/receiptStore";
import { useReceipts } from "@src/hooks/useReceipts";

export default function Expenses() {
  useReceipts();
  const receipts = useReceiptStore((s) => s.receipts);

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">Kiadások</Text>
          <Text className="text-sm text-gray-500">
            {receipts.length} nyugta összesen
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push("/export")}
            className="h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white active:bg-gray-50"
          >
            <Ionicons name="share-outline" size={20} color="#374151" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/receipt/new")}
            className="h-11 w-11 items-center justify-center rounded-full bg-brand-600 active:bg-brand-700"
          >
            <Ionicons name="add" size={26} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {receipts.length === 0 ? (
          <Card>
            <Text className="mb-4 text-center text-sm text-gray-500">
              Még nincs adatod. Olvass be egy nyugtát vagy add hozzá kézzel.
            </Text>
            <Button
              variant="secondary"
              onPress={() => router.push("/receipt/new")}
            >
              Kézi hozzáadás
            </Button>
          </Card>
        ) : (
          <View className="gap-2">
            {receipts.map((r) => (
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
