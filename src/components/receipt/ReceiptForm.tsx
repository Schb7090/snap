import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View, Alert, Pressable } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@src/components/ui/Button";
import { Card } from "@src/components/ui/Card";
import { VatRatePicker } from "@src/components/forms/VatRatePicker";
import { CategoryPicker } from "@src/components/forms/CategoryPicker";
import { huf, type VatRate } from "@src/types/money";
import { fromGross, type VatBreakdown } from "@src/utils/vat";
import { formatHuf } from "@src/utils/currency";
import { parseHuDate } from "@src/utils/dateFormat";
import type { ReceiptItem } from "@src/types/receipt";

export interface ReceiptFormValues {
  readonly merchant: string;
  readonly date: string;
  readonly breakdown: VatBreakdown;
  readonly category: string | null;
  readonly notes: string | null;
  readonly items: readonly ReceiptItem[];
}

export interface ReceiptFormInitial {
  readonly merchant?: string;
  readonly date?: string;
  readonly grossAmount?: number;
  readonly vatRate?: VatRate;
  readonly category?: string | null;
  readonly notes?: string | null;
  readonly items?: readonly ReceiptItem[];
}

interface ItemDraft {
  readonly id: string;
  name: string;
  grossText: string;
  vatRate: VatRate;
}

interface ReceiptFormProps {
  readonly initial?: ReceiptFormInitial;
  readonly hint?: ReactNode;
  readonly saveLabel?: string;
  readonly cancelLabel?: string;
  readonly busy?: boolean;
  readonly onSave: (values: ReceiptFormValues) => void | Promise<void>;
  readonly onCancel: () => void;
}

const isInteger = (s: string): boolean => /^\d+$/.test(s);
const newItemId = () =>
  `it-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const itemFromReceipt = (it: ReceiptItem): ItemDraft => ({
  id: newItemId(),
  name: it.name,
  grossText: String(it.grossAmount),
  vatRate: it.vatRate,
});

export function ReceiptForm({
  initial,
  hint,
  saveLabel = "Mentés",
  cancelLabel = "Mégse",
  busy = false,
  onSave,
  onCancel,
}: ReceiptFormProps) {
  const [merchant, setMerchant] = useState(initial?.merchant ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [grossText, setGrossText] = useState(
    initial?.grossAmount !== undefined ? String(initial.grossAmount) : "",
  );
  const [vatRate, setVatRate] = useState<VatRate>(initial?.vatRate ?? 0.27);
  const [category, setCategory] = useState<string | null>(
    initial?.category ?? null,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<readonly ItemDraft[]>(
    initial?.items?.map(itemFromReceipt) ?? [],
  );

  const breakdown = useMemo(() => {
    if (!isInteger(grossText) || grossText.length === 0) return null;
    return fromGross(huf(parseInt(grossText, 10)), vatRate);
  }, [grossText, vatRate]);

  const itemsSum = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (isInteger(it.grossText) ? parseInt(it.grossText, 10) : 0),
        0,
      ),
    [items],
  );

  const updateItem = (id: string, patch: Partial<ItemDraft>) => {
    setItems((curr) =>
      curr.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  };

  const addItem = () => {
    setItems((curr) => [
      ...curr,
      { id: newItemId(), name: "", grossText: "", vatRate: vatRate },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((curr) => curr.filter((it) => it.id !== id));
  };

  const validate = (): string | null => {
    if (merchant.trim().length === 0) return "Add meg a kereskedő nevét.";
    if (!parseHuDate(date)) return "A dátum formátuma: ÉÉÉÉ.HH.NN";
    if (!isInteger(grossText) || grossText.length === 0) {
      return "Az összeg csak egész szám lehet (HUF).";
    }
    if (parseInt(grossText, 10) <= 0) return "Az összeg legyen nagyobb mint 0.";
    for (const it of items) {
      if (it.name.trim().length === 0) {
        return "Minden tételnek legyen neve, vagy töröld az üres sort.";
      }
      if (!isInteger(it.grossText) || it.grossText.length === 0) {
        return "Minden tétel ára egész szám HUF legyen.";
      }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Hiányzó adat", err);
      return;
    }
    if (!breakdown) return;

    const finalItems: readonly ReceiptItem[] = items.map((it) => {
      const gross = parseInt(it.grossText, 10);
      const b = fromGross(huf(gross), it.vatRate);
      return {
        name: it.name.trim(),
        grossAmount: b.gross,
        netAmount: b.net,
        vatRate: it.vatRate,
      };
    });

    await onSave({
      merchant: merchant.trim(),
      date,
      breakdown,
      category,
      notes: notes.trim() || null,
      items: finalItems,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {hint && <View className="mb-4">{hint}</View>}

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-gray-700">Kereskedő</Text>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          placeholder="Pl. SPAR, Tesco"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-gray-700">
          Dátum (ÉÉÉÉ.HH.NN)
        </Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
          placeholder="2026.04.30"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-gray-700">
          Bruttó összeg (Ft)
        </Text>
        <TextInput
          value={grossText}
          onChangeText={(t) => setGrossText(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="12500"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium text-gray-700">ÁFA kulcs</Text>
        <VatRatePicker value={vatRate} onChange={setVatRate} />
      </View>

      {breakdown && (
        <Card className="mb-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Bruttó</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatHuf(breakdown.gross)}
            </Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-sm text-gray-500">Nettó</Text>
            <Text className="text-sm text-gray-900">
              {formatHuf(breakdown.net)}
            </Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-sm text-gray-500">
              ÁFA ({Math.round(vatRate * 100)}%)
            </Text>
            <Text className="text-sm text-gray-900">
              {formatHuf(breakdown.vat)}
            </Text>
          </View>
        </Card>
      )}

      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">
            Tételek (opcionális)
          </Text>
          {items.length > 0 && breakdown && itemsSum !== breakdown.gross && (
            <Text className="text-xs text-amber-700">
              Összeg eltér ({formatHuf(huf(itemsSum))})
            </Text>
          )}
        </View>
        {items.map((it, idx) => (
          <View
            key={it.id}
            className="mb-2 rounded-2xl border border-gray-200 bg-white p-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs uppercase text-gray-400">
                {idx + 1}. tétel
              </Text>
              <Pressable
                onPress={() => removeItem(it.id)}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-100"
              >
                <Ionicons name="close" size={18} color="#9ca3af" />
              </Pressable>
            </View>
            <TextInput
              value={it.name}
              onChangeText={(v) => updateItem(it.id, { name: v })}
              placeholder="Tétel neve"
              className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-base"
            />
            <View className="mt-2 flex-row gap-2">
              <TextInput
                value={it.grossText}
                onChangeText={(v) =>
                  updateItem(it.id, { grossText: v.replace(/[^0-9]/g, "") })
                }
                keyboardType="number-pad"
                placeholder="Ár (Ft)"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-base"
              />
              <View style={{ minWidth: 160 }}>
                <VatRatePicker
                  value={it.vatRate}
                  onChange={(r) => updateItem(it.id, { vatRate: r })}
                />
              </View>
            </View>
          </View>
        ))}
        <Pressable
          onPress={addItem}
          className="mt-1 flex-row items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-3 active:bg-gray-50"
        >
          <Ionicons name="add" size={18} color="#2563eb" />
          <Text className="ml-1 text-sm font-medium text-brand-600">
            Új tétel
          </Text>
        </Pressable>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium text-gray-700">
          Kategória (opcionális)
        </Text>
        <CategoryPicker value={category} onChange={setCategory} />
      </View>

      <View className="mb-6">
        <Text className="mb-1 text-sm font-medium text-gray-700">
          Megjegyzés (opcionális)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Pl. ügyféllel ebéd"
          multiline
          className="min-h-[80px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base"
        />
      </View>

      <Button onPress={handleSave} loading={busy}>
        {saveLabel}
      </Button>
      <View className="mt-3">
        <Button variant="secondary" onPress={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
      </View>
    </ScrollView>
  );
}
