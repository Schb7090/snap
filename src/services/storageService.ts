import * as FileSystem from "expo-file-system/legacy";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { requireFirebase } from "./firebase";

export interface UploadResult {
  readonly storagePath: string;
  readonly downloadUrl: string;
}

const blobFromUri = async (uri: string): Promise<Blob> => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const response = await fetch(`data:image/jpeg;base64,${base64}`);
  return response.blob();
};

export const uploadReceiptImage = async (
  uid: string,
  localUri: string,
): Promise<UploadResult> => {
  const { storage } = requireFirebase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storagePath = `users/${uid}/receipts/${filename}`;
  const storageRef = ref(storage, storagePath);

  const blob = await blobFromUri(localUri);
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
  const downloadUrl = await getDownloadURL(storageRef);
  return { storagePath, downloadUrl };
};

export const deleteReceiptImage = async (storagePath: string): Promise<void> => {
  const { storage } = requireFirebase();
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (e) {
    if (
      typeof e === "object" &&
      e &&
      "code" in e &&
      String((e as { code: unknown }).code) === "storage/object-not-found"
    ) {
      return;
    }
    throw e;
  }
};
