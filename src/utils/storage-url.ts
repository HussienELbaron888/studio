// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** يرجّع رابط التحميل من مسار مثل "activities/.../file.jpg" */
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
