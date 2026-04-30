import Constants from "expo-constants";

export interface FirebaseEnv {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

interface AppEnv {
  readonly geminiApiKey: string | null;
  readonly firebase: FirebaseEnv | null;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

const readFirebase = (): FirebaseEnv | null => {
  const raw = extra["firebase"];
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const apiKey = str(obj["apiKey"]);
  const authDomain = str(obj["authDomain"]);
  const projectId = str(obj["projectId"]);
  const storageBucket = str(obj["storageBucket"]);
  const messagingSenderId = str(obj["messagingSenderId"]);
  const appId = str(obj["appId"]);
  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
};

export const env: AppEnv = {
  geminiApiKey: str(extra["geminiApiKey"]),
  firebase: readFirebase(),
};

export const isFirebaseConfigured = (): boolean => env.firebase !== null;
