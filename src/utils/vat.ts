import { huf, type Huf, type VatRate } from "@src/types/money";

export interface VatBreakdown {
  readonly gross: Huf;
  readonly net: Huf;
  readonly vat: Huf;
  readonly rate: VatRate;
}

export const fromGross = (gross: Huf, rate: VatRate): VatBreakdown => {
  const vat = huf(Math.round((gross * rate) / (1 + rate)));
  const net = huf(gross - vat);
  return { gross, net, vat, rate };
};

export const fromNet = (net: Huf, rate: VatRate): VatBreakdown => {
  const vat = huf(Math.round(net * rate));
  const gross = huf(net + vat);
  return { gross, net, vat, rate };
};

export const reconcile = (
  gross: Huf,
  net: Huf,
  rate: VatRate,
): VatBreakdown => {
  const vat = huf(gross - net);
  return { gross, net, vat, rate };
};

export const detectRate = (gross: Huf, net: Huf): VatRate | null => {
  if (gross <= net || net <= 0) return null;
  const ratio = (gross - net) / net;
  const candidates: VatRate[] = [0.05, 0.18, 0.27];
  for (const candidate of candidates) {
    if (Math.abs(ratio - candidate) < 0.01) return candidate;
  }
  return null;
};
