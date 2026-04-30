export type Huf = number & { readonly __brand: "Huf" };

export const huf = (n: number): Huf => {
  if (!Number.isInteger(n)) {
    throw new Error(`HUF amounts must be integers, got ${n}`);
  }
  return n as Huf;
};

export const VAT_RATES = [0.05, 0.18, 0.27] as const;
export type VatRate = (typeof VAT_RATES)[number];
