
// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** لو عندك URL قديم مخزّن ببكت appspot، بنصلّحه مؤقتًا */
export function fixOldBucketUrl(url?: string | null) {
  if (!url) return null;
  // This function might no longer be necessary if all URLs are resolved via getDownloadURL,
  // but it's kept for legacy data.
  return url.replace(
    "gs://studio-3721710978-c50cb.appspot.com",
    "https://firebasestorage.googleapis.com/v0/b/studio-3721710978-c50cb.appspot.com/o"
  );
}

/** يرجّع URL صالح للعرض من مسار Storage مثل "activities/.../cover.jpg" */
export async function resolveStorageURL(imagePath?: string | null) {
  if (!imagePath) return null;

  // If it's a full gs:// path, extract the path part.
  const path = imagePath.startsWith('gs://') ? imagePath.split('/').slice(3).join('/') : imagePath;

  try {
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found at path: ${path}`);
      return null;
    }
    console.error(`Error getting download URL for ${path}:`, error.message);
    return null;
  }
}
