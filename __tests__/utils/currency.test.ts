import { huf } from "@src/types/money";
import { formatHuf, formatHufCompact } from "@src/utils/currency";

describe("formatHuf", () => {
  it("formats 0", () => {
    expect(formatHuf(huf(0))).toMatch(/^0\s+Ft$/);
  });

  it("formats whole thousands with separator", () => {
    expect(formatHuf(huf(12500))).toMatch(/^12\s+500\s+Ft$/);
  });

  it("formats millions", () => {
    expect(formatHuf(huf(1234567))).toMatch(/^1\s+234\s+567\s+Ft$/);
  });

  it("ends with Ft suffix", () => {
    expect(formatHuf(huf(99))).toMatch(/Ft$/);
  });
});

describe("formatHufCompact", () => {
  it("returns plain format for amounts < 10 000", () => {
    expect(formatHufCompact(huf(9999))).toMatch(/Ft$/);
  });

  it("returns Xe for 10 000 - 999 999", () => {
    expect(formatHufCompact(huf(25000))).toBe("25e Ft");
    expect(formatHufCompact(huf(999000))).toBe("999e Ft");
  });

  it("returns X,YM for >= 1 000 000", () => {
    expect(formatHufCompact(huf(1500000))).toBe("1,5M Ft");
    expect(formatHufCompact(huf(2300000))).toBe("2,3M Ft");
  });
});
