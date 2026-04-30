import { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import { Button } from "@src/components/ui/Button";
import { UpgradePrompt } from "@src/components/subscription/UpgradePrompt";
import { useReceiptStore } from "@src/store/receiptStore";
import { useReceipts } from "@src/hooks/useReceipts";
import { useTierLimit } from "@src/hooks/useTierLimit";
import {
  writeAndShareCsv,
  writeAndShareXlsx,
} from "@src/services/exportService";

export default function ExportScreen() {
  useReceipts();
  const receipts = useReceiptStore((s) => s.receipts);
  const csvLimit = useTierLimit("export_csv");
  const xlsxLimit = useTierLimit("export_excel");
  const [busy, setBusy] = useState<"csv" | "xlsx" | null>(null);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (receipts.length === 0) {
      Alert.alert("Nincs adat", "Még nincs exportálható nyugtád.");
      return;
    }
    setBusy(format);
    try {
      if (format === "csv") {
        await writeAndShareCsv(receipts);
      } else {
        await writeAndShareXlsx(receipts);
      }
    } catch (e) {
      Alert.alert(
        "Exportálás sikertelen",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Exportálás</Text>
          <Text className="mt-1 text-base text-gray-500">
            {receipts.length} nyugta exportálható.
          </Text>
        </View>

        <Card className="mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Ionicons name="document-text" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    CSV exportálás
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Kompatibilis Excellel és könyvelő szoftverekkel
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {csvLimit.allowed ? (
            <View className="mt-4">
              <Button
                onPress={() => handleExport("csv")}
                loading={busy === "csv"}
                disabled={receipts.length === 0}
              >
                CSV letöltése
              </Button>
            </View>
          ) : (
            <View className="mt-4">
              <UpgradePrompt
                reason="feature_locked"
                requiredTier={
                  csvLimit.reason === "feature_not_in_tier"
                    ? csvLimit.requiredTier
                    : "starter"
                }
              />
            </View>
          )}
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Ionicons name="grid" size={20} color="#047857" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Excel (.xlsx) exportálás
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Külön összesítő munkafüzettel
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {xlsxLimit.allowed ? (
            <View className="mt-4">
              <Button
                onPress={() => handleExport("xlsx")}
                loading={busy === "xlsx"}
                disabled={receipts.length === 0}
              >
                Excel letöltése
              </Button>
            </View>
          ) : (
            <View className="mt-4">
              <UpgradePrompt
                reason="feature_locked"
                requiredTier={
                  xlsxLimit.reason === "feature_not_in_tier"
                    ? xlsxLimit.requiredTier
                    : "pro"
                }
              />
            </View>
          )}
        </Card>

        <Pressable
          onPress={() => router.back()}
          className="mt-4 items-center py-3"
        >
          <Text className="text-sm text-brand-600 underline">Vissza</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
