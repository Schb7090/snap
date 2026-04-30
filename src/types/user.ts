import type { Tier } from "./tier";

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly tier: Tier;
  readonly createdAt: number;
  readonly deletedAt: number | null;
}
