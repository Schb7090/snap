import { useEffect } from "react";
import { subscribeReceipts } from "@src/services/firebaseService";
import { useReceiptStore } from "@src/store/receiptStore";
import { useUserStore } from "@src/store/userStore";
import { isFirebaseConfigured } from "@src/config/env";

export const useReceipts = (): void => {
  const userId = useUserStore((s) => s.user?.id ?? null);
  const setReceipts = useReceiptStore((s) => s.setReceipts);
  const setLoading = useReceiptStore((s) => s.setLoading);
  const setError = useReceiptStore((s) => s.setError);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) return;
    setLoading(true);
    const unsub = subscribeReceipts(
      userId,
      (receipts) => {
        setReceipts(receipts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [userId, setReceipts, setLoading, setError]);
};
