// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** يرجّع URL صالح للعرض من مسار Storage مثل "activities/.../cover.jpg" */
export async function resolveStorageURL(imagePath?: string | null) {
  if (!imagePath) return null;
  try {
    return await getDownloadURL(ref(storage, imagePath));
  } catch (error: any) {
    // Firebase throws an error if the file doesn't exist. 
    // We can safely ignore this and return null.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found at path: ${imagePath}`);
      return null;
    }
    // For other errors, we might want to log them.
    console.error("Error getting download URL:", error);
    return null;
  }
}

/** لو عندك URL قديم مخزّن ببكت appspot، بنصلّحه مؤقتًا */
export function fixOldBucketUrl(url?: string | null) {
  if (!url) return null;
  return url.replace(
    "/b/studio-3721710978-c50cb.appspot.com/",
    "/b/studio-3721710978-c50cb.firebasestorage.app/"
  );
}
