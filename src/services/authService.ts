import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { requireFirebase } from "./firebase";

export type AuthErrorCode =
  | "invalid_email"
  | "user_not_found"
  | "wrong_password"
  | "email_in_use"
  | "weak_password"
  | "network_error"
  | "not_configured"
  | "unknown";

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode, message?: string) {
    super(message ?? code);
  }
}

const mapErrorCode = (raw: unknown): AuthErrorCode => {
  const code =
    typeof raw === "object" && raw && "code" in raw
      ? String((raw as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/invalid-email":
      return "invalid_email";
    case "auth/user-not-found":
      return "user_not_found";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "wrong_password";
    case "auth/email-already-in-use":
      return "email_in_use";
    case "auth/weak-password":
      return "weak_password";
    case "auth/network-request-failed":
      return "network_error";
    default:
      return "unknown";
  }
};

const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if ((e as Error).message === "firebase_not_configured") {
      throw new AuthError("not_configured");
    }
    throw new AuthError(mapErrorCode(e));
  }
};

export const signIn = (email: string, password: string) =>
  wrap(async () => {
    const { auth } = requireFirebase();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  });

export const signUp = (
  email: string,
  password: string,
  displayName?: string,
) =>
  wrap(async () => {
    const { auth } = requireFirebase();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  });

export const signOut = () =>
  wrap(async () => {
    const { auth } = requireFirebase();
    await firebaseSignOut(auth);
  });

export const resetPassword = (email: string) =>
  wrap(async () => {
    const { auth } = requireFirebase();
    await sendPasswordResetEmail(auth, email);
  });

export const onAuthChange = (
  callback: (user: FirebaseUser | null) => void,
): (() => void) => {
  const { auth } = requireFirebase();
  return onAuthStateChanged(auth, callback);
};
