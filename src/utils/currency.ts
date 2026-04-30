import type { Huf } from "@src/types/money";

const formatter = new Intl.NumberFormat("hu-HU", {
  style: "decimal",
  maximumFractionDigits: 0,
  useGrouping: true,
});

export const formatHuf = (amount: Huf): string => {
  return `${formatter.format(amount).replace(/ /g, " ")} Ft`;
};

export const formatHufCompact = (amount: Huf): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")}M Ft`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 1000)}e Ft`;
  }
  return formatHuf(amount);
};
