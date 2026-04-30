import { ocrResultSchema } from "@src/utils/validators";

const validOcr = {
  merchant: "SPAR",
  merchantTaxId: "12345678-1-42",
  date: "2026.04.30",
  grossAmount: 12700,
  netAmount: 10000,
  vatRate: 0.27,
  vatAmount: 2700,
  items: [
    {
      name: "Tej",
      grossAmount: 350,
      netAmount: 333,
      vatRate: 0.05,
    },
  ],
};

describe("ocrResultSchema", () => {
  it("accepts a valid result", () => {
    expect(ocrResultSchema.safeParse(validOcr).success).toBe(true);
  });

  it("accepts a result with empty items", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, items: [] });
    expect(r.success).toBe(true);
  });

  it("accepts null merchantTaxId", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, merchantTaxId: null });
    expect(r.success).toBe(true);
  });

  it("rejects non-integer HUF amounts", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, grossAmount: 12700.5 });
    expect(r.success).toBe(false);
  });

  it("rejects negative amounts", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, grossAmount: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects unknown VAT rate", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, vatRate: 0.2 });
    expect(r.success).toBe(false);
  });

  it("rejects gross < net", () => {
    const r = ocrResultSchema.safeParse({
      ...validOcr,
      grossAmount: 9000,
      netAmount: 10000,
    });
    expect(r.success).toBe(false);
  });

  it("rejects gross - net mismatched with vat (>1 HUF)", () => {
    const r = ocrResultSchema.safeParse({
      ...validOcr,
      grossAmount: 12700,
      netAmount: 10000,
      vatAmount: 9999,
    });
    expect(r.success).toBe(false);
  });

  it("accepts ±1 HUF rounding tolerance", () => {
    const r = ocrResultSchema.safeParse({
      ...validOcr,
      grossAmount: 12700,
      netAmount: 10000,
      vatAmount: 2701,
    });
    expect(r.success).toBe(true);
  });

  it.each([
    "2026/04/30",
    "26.04.30",
    "2026-04-30",
    "30.04.2026",
  ])("rejects malformed date %s", (date) => {
    const r = ocrResultSchema.safeParse({ ...validOcr, date });
    expect(r.success).toBe(false);
  });

  it("rejects empty merchant", () => {
    const r = ocrResultSchema.safeParse({ ...validOcr, merchant: "" });
    expect(r.success).toBe(false);
  });
});
