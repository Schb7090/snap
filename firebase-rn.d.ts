import type { Persistence } from "firebase/auth";

export {};

declare module "firebase/auth" {
  export interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<unknown>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<unknown>;
  }

  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
