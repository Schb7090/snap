import { useEffect, useState } from "react";
import { onAuthChange } from "@src/services/authService";
import {
  ensureUserProfile,
  countReceiptsThisMonth,
} from "@src/services/firebaseService";
import { useUserStore } from "@src/store/userStore";
import { isFirebaseConfigured } from "@src/config/env";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export const useAuth = (): { status: AuthStatus } => {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const setUser = useUserStore((s) => s.setUser);
  const localUser = useUserStore((s) => s.user);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus(localUser ? "authenticated" : "unauthenticated");
      return;
    }

    let cancelled = false;
    const unsub = onAuthChange(async (firebaseUser) => {
      if (cancelled) return;
      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      try {
        const profile = await ensureUserProfile(
          firebaseUser.uid,
          firebaseUser.email ?? "",
          firebaseUser.displayName,
        );
        const monthly = await countReceiptsThisMonth(firebaseUser.uid);
        if (cancelled) return;
        setUser(profile);
        useUserStore.setState({ receiptsThisMonth: monthly });
        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [localUser, setUser]);

  return { status };
};
