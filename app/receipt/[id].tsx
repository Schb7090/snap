import { useState } from "react";
import { ScrollView, Text, View, Alert, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import { Button } from "@src/components/ui/Button";
import {
  ReceiptForm,
  type ReceiptFormValues,
} from "@src/components/receipt/ReceiptForm";
import { useReceiptStore } from "@src/store/receiptStore";
import { useUserStore } from "@src/store/userStore";
import { formatHuf } from "@src/utils/currency";
import { findCategory } from "@src/constants/categories";
import {
  deleteReceipt,
  updateReceipt,
} from "@src/services/firebaseService";
import { isFirebaseConfigured } from "@src/config/env";
import type { VatRate } from "@src/types/money";

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useUserStore((s) => s.user?.id ?? null);
  const receipt = useReceiptStore((s) => s.receipts.find((r) => r.id === id));
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!receipt) {
    return (
      <Screen className="px-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500">Nyugta nem található.</Text>
          <View className="mt-4">
            <Button variant="secondary" onPress={() => router.back()}>
              Vissza
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const category = receipt.category ? findCategory(receipt.category) : undefined;
  const vatPercent = Math.round(receipt.vatRate * 100);

  const handleSave = async (values: ReceiptFormValues) => {
    if (!isFirebaseConfigured() || !userId) {
      Alert.alert(
        "Firebase nincs konfigurálva",
        "A módosítás csak Firebase mellett menthető.",
      );
      return;
    }
    setBusy(true);
    try {
      await updateReceipt(userId, receipt.id, {
        merchant: values.merchant,
        date: values.date,
        grossAmount: values.breakdown.gross,
        netAmount: values.breakdown.net,
        vatRate: values.breakdown.rate,
        vatAmount: values.breakdown.vat,
        category: values.category,
        notes: values.notes,
        items: values.items.map((it) => ({
          name: it.name,
          grossAmount: it.grossAmount,
          netAmount: it.netAmount,
          vatRate: it.vatRate,
        })),
      });
      setEditing(false);
    } catch (e) {
      Alert.alert(
        "Mentés sikertelen",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Nyugta törlése",
      `Biztosan törlöd a "${receipt.merchant}" nyugtát? Ez nem visszavonható.`,
      [
        { text: "Mégse", style: "cancel" },
        {
          text: "Törlés",
          style: "destructive",
          onPress: async () => {
            if (!isFirebaseConfigured() || !userId) {
              Alert.alert(
                "Firebase nincs konfigurálva",
                "A törlés csak Firebase mellett működik.",
              );
              return;
            }
            try {
              await deleteReceipt(userId, receipt.id);
              router.back();
            } catch (e) {
              Alert.alert(
                "Törlés sikertelen",
                e instanceof Error ? e.message : String(e),
              );
            }
          },
        },
      ],
    );
  };

  if (editing) {
    return (
      <Screen>
        <ReceiptForm
          initial={{
            merchant: receipt.merchant,
            date: receipt.date,
            grossAmount: receipt.grossAmount,
            vatRate: receipt.vatRate as VatRate,
            category: receipt.category,
            notes: receipt.notes,
            items: receipt.items,
          }}
          saveLabel="Mentés"
          cancelLabel="Mégse"
          busy={busy}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Card className="mb-4">
          <Text className="text-xs uppercase text-gray-400">Kereskedő</Text>
          <Text className="mt-1 text-xl font-bold text-gray-900">
            {receipt.merchant}
          </Text>
          {receipt.merchantTaxId && (
            <Text className="mt-1 text-sm text-gray-500">
              Adószám: {receipt.merchantTaxId}
            </Text>
          )}
          <Text className="mt-2 text-sm text-gray-500">{receipt.date}</Text>
        </Card>

        <Card className="mb-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Bruttó (fizetve)</Text>
            <Text className="text-base font-semibold text-gray-900">
              {formatHuf(receipt.grossAmount)}
            </Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-sm text-gray-500">Nettó</Text>
            <Text className="text-base text-gray-900">
              {formatHuf(receipt.netAmount)}
            </Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-sm text-gray-500">ÁFA ({vatPercent}%)</Text>
            <Text className="text-base text-gray-900">
              {formatHuf(receipt.vatAmount)}
            </Text>
          </View>
        </Card>

        {category && (
          <Card className="mb-4">
            <Text className="text-xs uppercase text-gray-400">Kategória</Text>
            <View className="mt-1 flex-row items-center">
              <View
                className="mr-2 h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={category.color}
                />
              </View>
              <Text className="text-base text-gray-900">{category.labelHu}</Text>
            </View>
          </Card>
        )}

        {receipt.notes && (
          <Card className="mb-4">
            <Text className="text-xs uppercase text-gray-400">Megjegyzés</Text>
            <Text className="mt-1 text-base text-gray-900">{receipt.notes}</Text>
          </Card>
        )}

        {receipt.items.length > 0 && (
          <Card className="mb-4">
            <Text className="mb-2 text-xs uppercase text-gray-400">Tételek</Text>
            {receipt.items.map((item, idx) => (
              <View
                key={`${item.name}-${idx}`}
                className="flex-row justify-between py-2"
              >
                <Text className="flex-1 text-sm text-gray-900" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-900">
                  {formatHuf(item.grossAmount)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        <View className="mt-2 flex-row gap-3">
          <View className="flex-1">
            <Button onPress={() => setEditing(true)}>
              <View className="flex-row items-center">
                <Ionicons
                  name="create-outline"
                  size={18}
                  color="white"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-base font-semibold text-white">
                  Szerkesztés
                </Text>
              </View>
            </Button>
          </View>
          <View>
            <Pressable
              onPress={handleDelete}
              className="h-[52px] w-[52px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 active:bg-red-100"
            >
              <Ionicons name="trash-outline" size={22} color="#dc2626" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
