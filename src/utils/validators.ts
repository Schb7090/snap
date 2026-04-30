import { z } from "zod";
import { VAT_RATES } from "@src/types/money";

const integerHuf = z.number().int().nonnegative();

export const vatRateSchema = z.union([
  z.literal(0.05),
  z.literal(0.18),
  z.literal(0.27),
]);

export const ocrItemSchema = z.object({
  name: z.string().min(1),
  grossAmount: integerHuf,
  netAmount: integerHuf,
  vatRate: vatRateSchema,
});

export const ocrResultSchema = z
  .object({
    merchant: z.string().min(1),
    merchantTaxId: z.string().nullable(),
    date: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/, "expected YYYY.MM.DD"),
    grossAmount: integerHuf,
    netAmount: integerHuf,
    vatRate: vatRateSchema,
    vatAmount: integerHuf,
    items: z.array(ocrItemSchema),
  })
  .refine((d) => d.grossAmount >= d.netAmount, {
    message: "gross must be >= net",
  })
  .refine(
    (d) => Math.abs(d.grossAmount - d.netAmount - d.vatAmount) <= 1,
    { message: "gross - net must equal vat (±1 HUF rounding)" },
  );

export type OcrResult = z.infer<typeof ocrResultSchema>;

export const isKnownVatRate = (rate: number): boolean => {
  return (VAT_RATES as readonly number[]).includes(rate);
};
