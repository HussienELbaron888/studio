
// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** يرجّع URL صالح للعرض من مسار Storage مثل "activities/.../cover.jpg" */
export async function resolveStorageURL(imagePath?: string | null): Promise<string | null> {
  if (!imagePath) return null;

  // Handles both 'gs://<bucket>/<path>' and direct '<path>'
  const path = imagePath.startsWith('gs://') 
    ? imagePath.split('/').slice(3).join('/') 
    : imagePath;

  if (!path) return null;

  try {
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error: any) {
    // Gracefully handle cases where the image doesn't exist in Storage.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found at path: ${path}`);
      return null;
    }
    // For other errors, log them but don't crash the app.
    console.error(`Error getting download URL for ${path}:`, error);
    return null;
  }
}
