import { useState } from "react";
import { Text, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { Card } from "@src/components/ui/Card";
import {
  ReceiptForm,
  type ReceiptFormValues,
} from "@src/components/receipt/ReceiptForm";
import { formatHuDate } from "@src/utils/dateFormat";
import { createReceipt } from "@src/services/firebaseService";
import { useUserStore } from "@src/store/userStore";
import { isFirebaseConfigured } from "@src/config/env";
import type { ReceiptDraft } from "@src/types/receipt";

export default function NewReceipt() {
  const params = useLocalSearchParams<{ from?: string }>();
  const userId = useUserStore((s) => s.user?.id ?? null);
  const incrementMonthlyUsage = useUserStore((s) => s.incrementMonthlyUsage);
  const [busy, setBusy] = useState(false);

  const handleSave = async (values: ReceiptFormValues) => {
    if (!isFirebaseConfigured() || !userId) {
      Alert.alert(
        "Firebase nincs konfigurálva",
        "Adatok nem menthetők — add meg a Firebase kulcsokat a .env.local-ban.",
      );
      return;
    }
    setBusy(true);
    try {
      const draft: ReceiptDraft = {
        imageRef: null,
        merchant: values.merchant,
        date: values.date,
        grossAmount: values.breakdown.gross,
        netAmount: values.breakdown.net,
        vatRate: values.breakdown.rate,
        vatAmount: values.breakdown.vat,
        items: values.items,
        source: "upload",
      };
      const receipt = await createReceipt(
        userId,
        draft,
        values.category,
        values.notes,
      );
      incrementMonthlyUsage();
      router.replace(`/receipt/${receipt.id}`);
    } catch (e) {
      Alert.alert(
        "Mentés sikertelen",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setBusy(false);
    }
  };

  const hint =
    params.from === "ocr_failure" ? (
      <Card className="border-amber-200 bg-amber-50">
        <Text className="text-sm text-amber-900">
          Az automatikus felismerés nem sikerült. Töltsd ki kézzel.
        </Text>
      </Card>
    ) : undefined;

  return (
    <Screen>
      <ReceiptForm
        initial={{ date: formatHuDate(new Date()) }}
        hint={hint}
        busy={busy}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}
