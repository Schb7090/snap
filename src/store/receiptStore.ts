import { create } from "zustand";
import type { Receipt } from "@src/types/receipt";

interface ReceiptState {
  receipts: readonly Receipt[];
  loading: boolean;
  error: string | null;
  setReceipts: (receipts: readonly Receipt[]) => void;
  upsert: (receipt: Receipt) => void;
  remove: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReceiptStore = create<ReceiptState>((set) => ({
  receipts: [],
  loading: false,
  error: null,
  setReceipts: (receipts) => set({ receipts }),
  upsert: (receipt) =>
    set((state) => {
      const others = state.receipts.filter((r) => r.id !== receipt.id);
      return {
        receipts: [receipt, ...others].sort(
          (a, b) => b.createdAt - a.createdAt,
        ),
      };
    }),
  remove: (id) =>
    set((state) => ({
      receipts: state.receipts.filter((r) => r.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
