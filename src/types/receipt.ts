import type { Huf, VatRate } from "./money";

export type ReceiptSource = "camera" | "upload";

export interface ReceiptItem {
  readonly name: string;
  readonly grossAmount: Huf;
  readonly netAmount: Huf;
  readonly vatRate: VatRate;
}

export interface Receipt {
  readonly id: string;
  readonly imageRef: string | null;
  readonly merchant: string;
  readonly merchantTaxId: string | null;
  readonly date: string;
  readonly grossAmount: Huf;
  readonly netAmount: Huf;
  readonly vatRate: VatRate;
  readonly vatAmount: Huf;
  readonly items: readonly ReceiptItem[];
  readonly category: string | null;
  readonly notes: string | null;
  readonly createdAt: number;
  readonly source: ReceiptSource;
}

export interface ReceiptDraft {
  readonly imageRef: string | null;
  readonly merchant: string;
  readonly date: string;
  readonly grossAmount: Huf;
  readonly netAmount: Huf;
  readonly vatRate: VatRate;
  readonly vatAmount: Huf;
  readonly items: readonly ReceiptItem[];
  readonly source: ReceiptSource;
}
