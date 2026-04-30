import { huf, type VatRate } from "@src/types/money";
import { fromGross, fromNet, reconcile, detectRate } from "@src/utils/vat";

describe("vat.fromGross", () => {
  it.each<[number, VatRate, number, number]>([
    [12700, 0.27, 10000, 2700],
    [1180, 0.18, 1000, 180],
    [1050, 0.05, 1000, 50],
    [1, 0.27, 1, 0],
    [127000, 0.27, 100000, 27000],
  ])(
    "gross=%i rate=%f → net=%i vat=%i",
    (gross, rate, expectedNet, expectedVat) => {
      const result = fromGross(huf(gross), rate);
      expect(result.net).toBe(expectedNet);
      expect(result.vat).toBe(expectedVat);
      expect(result.gross).toBe(gross);
    },
  );

  it("preserves gross - net == vat (±1 HUF)", () => {
    const cases: ReadonlyArray<[number, VatRate]> = [
      [13, 0.05],
      [777, 0.18],
      [9999, 0.27],
      [123456, 0.27],
    ];
    for (const [gross, rate] of cases) {
      const r = fromGross(huf(gross), rate);
      expect(Math.abs(r.gross - r.net - r.vat)).toBeLessThanOrEqual(1);
    }
  });
});

describe("vat.fromNet", () => {
  it.each<[number, VatRate, number, number]>([
    [10000, 0.27, 12700, 2700],
    [1000, 0.18, 1180, 180],
    [1000, 0.05, 1050, 50],
  ])(
    "net=%i rate=%f → gross=%i vat=%i",
    (net, rate, expectedGross, expectedVat) => {
      const r = fromNet(huf(net), rate);
      expect(r.gross).toBe(expectedGross);
      expect(r.vat).toBe(expectedVat);
      expect(r.net).toBe(net);
    },
  );
});

describe("vat round-trip stability", () => {
  it("fromNet → fromGross returns the original net (within rounding)", () => {
    const rates: ReadonlyArray<VatRate> = [0.05, 0.18, 0.27];
    for (const rate of rates) {
      for (const net of [100, 1234, 99999]) {
        const a = fromNet(huf(net), rate);
        const b = fromGross(a.gross, rate);
        expect(Math.abs(b.net - net)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("vat.reconcile", () => {
  it("returns gross - net as vat", () => {
    const r = reconcile(huf(12700), huf(10000), 0.27);
    expect(r.vat).toBe(2700);
  });
});

describe("vat.detectRate", () => {
  it.each<[number, number, VatRate | null]>([
    [12700, 10000, 0.27],
    [1180, 1000, 0.18],
    [1050, 1000, 0.05],
    [12700, 12700, null],
    [10000, 12000, null],
    [99999, 1, null],
  ])("gross=%i net=%i → %s", (gross, net, expected) => {
    expect(detectRate(huf(gross), huf(net))).toBe(expected);
  });
});

describe("huf brand", () => {
  it("rejects non-integer values", () => {
    expect(() => huf(1.5)).toThrow(/integers/);
  });
  it("accepts 0 and integers", () => {
    expect(huf(0)).toBe(0);
    expect(huf(12345)).toBe(12345);
  });
});
