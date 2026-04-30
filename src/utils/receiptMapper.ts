import { huf, type VatRate } from "@src/types/money";
import type { ReceiptDraft, ReceiptItem, ReceiptSource } from "@src/types/receipt";
import type { OcrResult } from "@src/utils/validators";

export const ocrToReceiptDraft = (
  ocr: OcrResult,
  source: ReceiptSource,
  imageRef: string | null,
): ReceiptDraft => {
  const items: readonly ReceiptItem[] = ocr.items.map((it) => ({
    name: it.name,
    grossAmount: huf(it.grossAmount),
    netAmount: huf(it.netAmount),
    vatRate: it.vatRate as VatRate,
  }));

  return {
    imageRef,
    merchant: ocr.merchant,
    date: ocr.date,
    grossAmount: huf(ocr.grossAmount),
    netAmount: huf(ocr.netAmount),
    vatRate: ocr.vatRate as VatRate,
    vatAmount: huf(ocr.vatAmount),
    items,
    source,
  };
};
