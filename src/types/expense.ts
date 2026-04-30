export interface Expense {
  readonly id: string;
  readonly receiptId: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly month: string;
  readonly createdAt: number;
}
