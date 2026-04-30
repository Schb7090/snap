import type { Tier } from "@src/types/tier";

export interface TierDetail {
  readonly id: Tier;
  readonly nameHu: string;
  readonly priceHufPerMonth: number;
  readonly taglineHu: string;
  readonly benefitsHu: readonly string[];
  readonly highlight: boolean;
}

export const TIER_DETAILS: Readonly<Record<Tier, TierDetail>> = {
  free: {
    id: "free",
    nameHu: "Ingyenes",
    priceHufPerMonth: 0,
    taglineHu: "Próbáld ki kötelezettség nélkül",
    benefitsHu: [
      "10 nyugta beolvasás havonta",
      "Alapvető kategóriák",
      "Bruttó / nettó / ÁFA kimutatás",
    ],
    highlight: false,
  },
  starter: {
    id: "starter",
    nameHu: "Kezdő",
    priceHufPerMonth: 990,
    taglineHu: "Kis cégek és önállók részére",
    benefitsHu: [
      "50 nyugta beolvasás havonta",
      "CSV exportálás",
      "Korlátlan kategóriák",
      "Email támogatás",
    ],
    highlight: false,
  },
  pro: {
    id: "pro",
    nameHu: "Profi",
    priceHufPerMonth: 2990,
    taglineHu: "Aktív felhasználóknak — a legnépszerűbb",
    benefitsHu: [
      "Korlátlan nyugta beolvasás",
      "Excel exportálás",
      "AI kategorizálás",
      "Diagramok és kimutatások",
      "Prioritásos email támogatás",
    ],
    highlight: true,
  },
  business: {
    id: "business",
    nameHu: "Vállalati",
    priceHufPerMonth: 9990,
    taglineHu: "Csapatok és könyvelők részére",
    benefitsHu: [
      "Mindent a Profi csomagból",
      "Több felhasználó egy fiókon",
      "API hozzáférés",
      "Egyedi kategóriák és címkék",
      "Dedikált támogatás",
    ],
    highlight: false,
  },
};

export const TIER_ORDER_DESC: readonly Tier[] = [
  "business",
  "pro",
  "starter",
  "free",
];

export const TIER_ORDER_ASC: readonly Tier[] = [
  "free",
  "starter",
  "pro",
  "business",
];

export const tierRank = (tier: Tier): number =>
  TIER_ORDER_ASC.indexOf(tier);

export const isUpgrade = (from: Tier, to: Tier): boolean =>
  tierRank(to) > tierRank(from);
