
// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** يرجّع URL صالح للعرض من مسار Storage مثل "activities/.../cover.jpg" */
export async function resolveStorageURL(imagePath?: string | null) {
  if (!imagePath) return null;
  try {
    // Always use getDownloadURL to get a publicly accessible URL
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
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
  // This function might no longer be necessary if all URLs are resolved via getDownloadURL,
  // but it's kept for legacy data.
  return url.replace(
    "/b/studio-3721710978-c50cb.appspot.com/",
    "/b/studio-3721710978-c50cb.firebasestorage.app/"
  );
}
