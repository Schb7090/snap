import {
  formatHuDate,
  parseHuDate,
  monthKey,
  formatHuMonth,
} from "@src/utils/dateFormat";

describe("formatHuDate", () => {
  it("formats as YYYY.MM.DD", () => {
    const d = new Date(2026, 3, 30);
    expect(formatHuDate(d)).toBe("2026.04.30");
  });

  it("zero-pads single-digit month and day", () => {
    expect(formatHuDate(new Date(2026, 0, 5))).toBe("2026.01.05");
  });
});

describe("parseHuDate", () => {
  it("parses valid date", () => {
    const d = parseHuDate("2026.04.30");
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(3);
    expect(d?.getDate()).toBe(30);
  });

  it.each(["", "2026/04/30", "26.04.30", "2026.4.30", "garbage"])(
    "rejects malformed input %s",
    (input) => {
      expect(parseHuDate(input)).toBeNull();
    },
  );

  it("rejects impossible dates", () => {
    expect(parseHuDate("2026.13.01")).toBeNull();
    expect(parseHuDate("2026.02.30")).toBeNull();
  });
});

describe("monthKey", () => {
  it("returns YYYY-MM", () => {
    expect(monthKey(new Date(2026, 3, 30))).toBe("2026-04");
  });
});

describe("formatHuMonth", () => {
  it("returns YYYY.MM", () => {
    expect(formatHuMonth(new Date(2026, 3, 30))).toBe("2026.04");
  });
});
