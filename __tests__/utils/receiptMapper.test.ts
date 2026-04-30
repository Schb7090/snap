import { ocrToReceiptDraft } from "@src/utils/receiptMapper";
import type { OcrResult } from "@src/utils/validators";

const baseOcr: OcrResult = {
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

describe("ocrToReceiptDraft", () => {
  it("preserves all fields", () => {
    const draft = ocrToReceiptDraft(baseOcr, "camera", "users/u/abc.jpg");
    expect(draft.merchant).toBe("SPAR");
    expect(draft.date).toBe("2026.04.30");
    expect(draft.grossAmount).toBe(12700);
    expect(draft.netAmount).toBe(10000);
    expect(draft.vatRate).toBe(0.27);
    expect(draft.vatAmount).toBe(2700);
    expect(draft.source).toBe("camera");
    expect(draft.imageRef).toBe("users/u/abc.jpg");
  });

  it("maps each item with branded HUF amounts", () => {
    const draft = ocrToReceiptDraft(baseOcr, "upload", null);
    expect(draft.items).toHaveLength(1);
    const item = draft.items[0];
    expect(item).toBeDefined();
    expect(item?.name).toBe("Tej");
    expect(item?.grossAmount).toBe(350);
    expect(item?.netAmount).toBe(333);
    expect(item?.vatRate).toBe(0.05);
  });

  it("supports null imageRef", () => {
    const draft = ocrToReceiptDraft(baseOcr, "upload", null);
    expect(draft.imageRef).toBeNull();
  });

  it("rejects non-integer amounts at brand boundary", () => {
    const bad = { ...baseOcr, grossAmount: 12700.5 };
    expect(() => ocrToReceiptDraft(bad, "camera", null)).toThrow(/integers/);
  });
});
