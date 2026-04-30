import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { Screen } from "@src/components/ui/Screen";
import { Button } from "@src/components/ui/Button";
import { UpgradePrompt } from "@src/components/subscription/UpgradePrompt";
import { useTierLimit } from "@src/hooks/useTierLimit";
import { useUserStore } from "@src/store/userStore";
import type { Tier } from "@src/types/tier";
import { isFirebaseConfigured } from "@src/config/env";
import {
  uploadReceiptImage,
  deleteReceiptImage,
} from "@src/services/storageService";
import { createReceipt } from "@src/services/firebaseService";
import { runOcr, type OcrFailure } from "@src/services/ocrService";
import { ocrToReceiptDraft } from "@src/utils/receiptMapper";
import type { ReceiptSource } from "@src/types/receipt";

const compressForOcr = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
};

const FAILURE_MESSAGES_HU: Record<OcrFailure["reason"], string> = {
  low_confidence:
    "Nem sikerült kiolvasni a nyugtát. Próbáld újra jobb megvilágítással.",
  invalid_response:
    "A felismerő nem várt választ adott. Próbáld újra, vagy add meg manuálisan.",
  network: "Nincs internet kapcsolat. Próbáld újra később.",
  unauthorized: "Hiányzó vagy érvénytelen Gemini API kulcs.",
  timeout: "A felismerés túl sokáig tartott. Próbáld újra.",
  rate_limited: "Túl sok kérés. Várj egy percet és próbáld újra.",
};

const nextTierForQuota = (current: Tier): Tier => {
  if (current === "free") return "starter";
  return "pro";
};

export default function Scan() {
  const limit = useTierLimit("scan_receipt");
  const userId = useUserStore((s) => s.user?.id ?? null);
  const tier = useUserStore((s) => s.user?.tier ?? "free");
  const incrementMonthlyUsage = useUserStore((s) => s.incrementMonthlyUsage);
  const [busy, setBusy] = useState(false);

  const processImage = async (localUri: string, source: ReceiptSource) => {
    if (!limit.allowed) return;
    setBusy(true);
    try {
      const compressed = await compressForOcr(localUri);
      const base64 = await FileSystem.readAsStringAsync(compressed, {
        encoding: FileSystem.EncodingType.Base64,
      });

      let storagePath: string | null = null;
      if (isFirebaseConfigured() && userId) {
        const upload = await uploadReceiptImage(userId, compressed);
        storagePath = upload.storagePath;
      }

      const ocr = await runOcr({ imageBase64: base64, mimeType: "image/jpeg" });

      if (ocr.status === "ok") {
        if (isFirebaseConfigured() && userId) {
          const draft = ocrToReceiptDraft(ocr.result, source, storagePath);
          const receipt = await createReceipt(userId, draft);
          if (storagePath) {
            await deleteReceiptImage(storagePath).catch(() => undefined);
          }
          incrementMonthlyUsage();
          router.push(`/receipt/${receipt.id}`);
        } else {
          incrementMonthlyUsage();
          Alert.alert(
            "Sikeres beolvasás (próba)",
            `Bolt: ${ocr.result.merchant}\nÖsszeg: ${ocr.result.grossAmount} Ft\n\nFirebase nincs bekötve — a nyugta nincs elmentve.`,
          );
        }
      } else {
        const canFallback =
          ocr.reason === "low_confidence" ||
          ocr.reason === "invalid_response" ||
          ocr.reason === "timeout";
        Alert.alert(
          "Beolvasás sikertelen",
          FAILURE_MESSAGES_HU[ocr.reason] +
            (ocr.detail ? `\n\n${ocr.detail}` : ""),
          canFallback
            ? [
                { text: "Mégse", style: "cancel" },
                {
                  text: "Kézi kitöltés",
                  onPress: () =>
                    router.push("/receipt/new?from=ocr_failure"),
                },
              ]
            : undefined,
        );
      }
    } catch (e) {
      Alert.alert("Hiba", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleCapture = async () => {
    if (!limit.allowed) {
      if (limit.reason === "quota_exceeded") {
        Alert.alert(
          "Havi limit elérve",
          `Ebben a hónapban már ${limit.used}/${limit.limit} nyugtát beolvastál.`,
          [
            { text: "Mégse", style: "cancel" },
            {
              text: "Csomagok",
              onPress: () => router.push("/upgrade"),
            },
          ],
        );
      }
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Nincs engedély", "A kamera használatához engedély kell.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) await processImage(asset.uri, "camera");
  };

  const handleGalleryPick = async () => {
    if (!limit.allowed) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Nincs engedély", "A galéria használatához engedély kell.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) await processImage(asset.uri, "upload");
  };

  return (
    <Screen className="px-6">
      <View className="flex-1 justify-center">
        <View className="mb-8 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-brand-100">
            <Ionicons name="camera" size={44} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Nyugta beolvasása
          </Text>
          <Text className="mt-2 text-center text-base text-gray-500">
            Fotózd le a nyugtát, és minden adatot kiolvasunk belőle.
          </Text>
        </View>

        {!limit.allowed && limit.reason === "quota_exceeded" && (
          <View className="mb-4">
            <UpgradePrompt
              reason="quota_exceeded"
              requiredTier={nextTierForQuota(tier)}
              used={limit.used}
              limit={limit.limit}
            />
          </View>
        )}

        {!limit.allowed && limit.reason === "feature_not_in_tier" && (
          <View className="mb-4">
            <UpgradePrompt
              reason="feature_locked"
              requiredTier={limit.requiredTier}
            />
          </View>
        )}

        <Button onPress={handleCapture} loading={busy} disabled={!limit.allowed}>
          Fényképezés
        </Button>
        <View className="mt-3">
          <Button
            variant="secondary"
            onPress={handleGalleryPick}
            disabled={!limit.allowed || busy}
          >
            Kép a galériából
          </Button>
        </View>
      </View>
    </Screen>
  );
}
