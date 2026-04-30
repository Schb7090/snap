import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Tier } from "@src/types/tier";
import type { UserProfile } from "@src/types/user";

interface UserState {
  user: UserProfile | null;
  receiptsThisMonth: number;
  setUser: (user: UserProfile | null) => void;
  setTier: (tier: Tier) => void;
  incrementMonthlyUsage: () => void;
  resetMonthlyUsage: () => void;
  signOut: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      receiptsThisMonth: 0,
      setUser: (user) => set({ user }),
      setTier: (tier) =>
        set((state) =>
          state.user ? { user: { ...state.user, tier } } : state,
        ),
      incrementMonthlyUsage: () =>
        set((state) => ({ receiptsThisMonth: state.receiptsThisMonth + 1 })),
      resetMonthlyUsage: () => set({ receiptsThisMonth: 0 }),
      signOut: () => set({ user: null, receiptsThisMonth: 0 }),
    }),
    {
      name: "snap-track:user",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
