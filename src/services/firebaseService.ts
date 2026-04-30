import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { requireFirebase } from "./firebase";
import { huf } from "@src/types/money";
import { monthKey } from "@src/utils/dateFormat";
import type { Receipt, ReceiptDraft } from "@src/types/receipt";
import type { Expense } from "@src/types/expense";
import type { UserProfile } from "@src/types/user";
import type { Tier } from "@src/types/tier";

const userDoc = (uid: string) => doc(requireFirebase().db, "users", uid);
const receiptsCol = (uid: string) =>
  collection(requireFirebase().db, "users", uid, "receipts");
const expensesCol = (uid: string) =>
  collection(requireFirebase().db, "users", uid, "expenses");

const userConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (u) => ({
    email: u.email,
    displayName: u.displayName,
    tier: u.tier,
    createdAt: u.createdAt,
    deletedAt: u.deletedAt,
  }),
  fromFirestore: (snap: QueryDocumentSnapshot): UserProfile => {
    const d = snap.data();
    return {
      id: snap.id,
      email: String(d["email"] ?? ""),
      displayName: (d["displayName"] as string | null) ?? null,
      tier: (d["tier"] as Tier) ?? "free",
      createdAt: Number(d["createdAt"] ?? Date.now()),
      deletedAt: (d["deletedAt"] as number | null) ?? null,
    };
  },
};

const receiptConverter: FirestoreDataConverter<Receipt> = {
  toFirestore: (r) => ({
    imageRef: r.imageRef,
    merchant: r.merchant,
    merchantTaxId: r.merchantTaxId,
    date: r.date,
    grossAmount: r.grossAmount,
    netAmount: r.netAmount,
    vatRate: r.vatRate,
    vatAmount: r.vatAmount,
    items: r.items,
    category: r.category,
    notes: r.notes,
    createdAt: r.createdAt,
    source: r.source,
  }),
  fromFirestore: (snap: QueryDocumentSnapshot): Receipt => {
    const d = snap.data();
    return {
      id: snap.id,
      imageRef: (d["imageRef"] as string | null) ?? null,
      merchant: String(d["merchant"] ?? ""),
      merchantTaxId: (d["merchantTaxId"] as string | null) ?? null,
      date: String(d["date"] ?? ""),
      grossAmount: huf(Number(d["grossAmount"] ?? 0)),
      netAmount: huf(Number(d["netAmount"] ?? 0)),
      vatRate: Number(d["vatRate"] ?? 0.27) as Receipt["vatRate"],
      vatAmount: huf(Number(d["vatAmount"] ?? 0)),
      items: (d["items"] as Receipt["items"]) ?? [],
      category: (d["category"] as string | null) ?? null,
      notes: (d["notes"] as string | null) ?? null,
      createdAt: Number(d["createdAt"] ?? Date.now()),
      source: (d["source"] as Receipt["source"]) ?? "camera",
    };
  },
};

export const ensureUserProfile = async (
  uid: string,
  email: string,
  displayName: string | null,
): Promise<UserProfile> => {
  const ref = userDoc(uid).withConverter(userConverter);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = existing.data();
    if (data) return data;
  }
  const profile: UserProfile = {
    id: uid,
    email,
    displayName,
    tier: "free",
    createdAt: Date.now(),
    deletedAt: null,
  };
  await setDoc(ref, profile);
  return profile;
};

export const updateUserTier = async (uid: string, tier: Tier): Promise<void> => {
  await updateDoc(userDoc(uid), { tier });
};

export const fetchUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const snap = await getDoc(userDoc(uid).withConverter(userConverter));
  return snap.exists() ? (snap.data() ?? null) : null;
};

export interface SubscribeReceiptsOptions {
  readonly pageSize?: number;
}

export const subscribeReceipts = (
  uid: string,
  callback: (receipts: readonly Receipt[]) => void,
  onError: (err: Error) => void,
  options: SubscribeReceiptsOptions = {},
): (() => void) => {
  const q = query(
    receiptsCol(uid).withConverter(receiptConverter),
    orderBy("createdAt", "desc"),
    fsLimit(options.pageSize ?? 50),
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError(err as Error),
  );
};

export const createReceipt = async (
  uid: string,
  draft: ReceiptDraft,
  category: string | null = null,
  notes: string | null = null,
): Promise<Receipt> => {
  const ref = doc(receiptsCol(uid)).withConverter(receiptConverter);
  const now = Date.now();
  const receipt: Receipt = {
    id: ref.id,
    imageRef: draft.imageRef,
    merchant: draft.merchant,
    merchantTaxId: null,
    date: draft.date,
    grossAmount: draft.grossAmount,
    netAmount: draft.netAmount,
    vatRate: draft.vatRate,
    vatAmount: draft.vatAmount,
    items: draft.items,
    category,
    notes,
    createdAt: now,
    source: draft.source,
  };
  await setDoc(ref, receipt);

  if (category) {
    const expRef = doc(expensesCol(uid));
    const expense: Expense = {
      id: expRef.id,
      receiptId: receipt.id,
      category,
      tags: [],
      month: monthKey(now),
      createdAt: now,
    };
    await setDoc(expRef, {
      receiptId: expense.receiptId,
      category: expense.category,
      tags: expense.tags,
      month: expense.month,
      createdAt: expense.createdAt,
    });
  }

  return receipt;
};

export const updateReceiptCategory = async (
  uid: string,
  receiptId: string,
  category: string | null,
): Promise<void> => {
  await updateDoc(doc(receiptsCol(uid), receiptId), { category });
};

export interface ReceiptItemUpdate {
  readonly name: string;
  readonly grossAmount: number;
  readonly netAmount: number;
  readonly vatRate: number;
}

export interface ReceiptUpdate {
  readonly merchant?: string;
  readonly merchantTaxId?: string | null;
  readonly date?: string;
  readonly grossAmount?: number;
  readonly netAmount?: number;
  readonly vatRate?: number;
  readonly vatAmount?: number;
  readonly category?: string | null;
  readonly notes?: string | null;
  readonly items?: readonly ReceiptItemUpdate[];
}

export const updateReceipt = async (
  uid: string,
  receiptId: string,
  update: ReceiptUpdate,
): Promise<void> => {
  await updateDoc(doc(receiptsCol(uid), receiptId), { ...update });
};

export const deleteReceipt = async (
  uid: string,
  receiptId: string,
): Promise<void> => {
  await deleteDoc(doc(receiptsCol(uid), receiptId));
};

export const countReceiptsThisMonth = async (uid: string): Promise<number> => {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const startMs = start.getTime();
  const q = query(receiptsCol(uid), where("createdAt", ">=", startMs));
  const snap = await getDocs(q);
  return snap.size;
};

export const cascadeDeleteUser = async (uid: string): Promise<void> => {
  const { db } = requireFirebase();
  const subcollections = ["receipts", "expenses"] as const;

  for (const sub of subcollections) {
    const snap = await getDocs(collection(db, "users", uid, sub));
    while (snap.docs.length > 0) {
      const batch = writeBatch(db);
      const chunk = snap.docs.splice(0, 400);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  await updateDoc(userDoc(uid), {
    deletedAt: Date.now(),
    deletedAtTimestamp: serverTimestamp() as unknown as Timestamp,
  });
};
