import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { env } from "@src/config/env";

interface FirebaseHandles {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;
  readonly storage: FirebaseStorage;
}

let cached: FirebaseHandles | null = null;

const init = (): FirebaseHandles | null => {
  if (cached) return cached;
  if (!env.firebase) return null;

  const app = getApps()[0] ?? initializeApp(env.firebase);

  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });

  const storage = getStorage(app);

  cached = { app, auth, db, storage };
  return cached;
};

export const getFirebase = (): FirebaseHandles | null => init();

export const requireFirebase = (): FirebaseHandles => {
  const handles = init();
  if (!handles) {
    throw new Error("firebase_not_configured");
  }
  return handles;
};
