// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Resolves a Firebase Storage path (e.g., "activities/.../cover.jpg") to a publicly accessible URL.
 * Handles potential errors like object-not-found gracefully.
 */
export async function resolveStorageURL(imagePath?: string | null): Promise<string | null> {
  if (!imagePath) {
    return null;
  }

  // Handle both full gs:// paths and direct paths
  const path = imagePath.startsWith('gs://')
    ? imagePath.substring(imagePath.indexOf('/', 5) + 1)
    : imagePath;

  if (!path) {
    return null;
  }

  try {
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found at path: ${path}`);
    } else {
      console.error(`Error getting download URL for ${path}:`, error);
    }
    return null;
  }
}

/** Legacy function to fix old bucket URL formats. May no longer be needed if resolveStorageURL is used consistently. */
export function fixOldBucketUrl(url?: string | null) {
  if (!url) return null;
  return url.replace(
    "gs://studio-3721710978-c50cb.appspot.com",
    "https://firebasestorage.googleapis.com/v0/b/studio-3721710978-c50cb.appspot.com/o"
  );
}
