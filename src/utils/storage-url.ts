// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Takes a path within the bucket (NOT a URL)
 * e.g., "trips/9XRXyyMA.../cover_1759332598102.jpg"
 * and returns a displayable URL with ?alt=media&token=...
 */
export async function resolveStorageURL(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  
  // Handle both full gs:// paths and direct paths by extracting the path after the bucket name
  const storagePath = path.startsWith('gs://')
    ? path.substring(path.indexOf('/', 5) + 1)
    : path;

  if (!storagePath) {
    return null;
  }
  
  try {
    const r = ref(storage, storagePath);
    const url = await getDownloadURL(r);
    return url;
  } catch (e: any) {
    // Reduce console noise for expected errors (e.g., file not found)
    if (typeof window !== 'undefined') {
      console.debug('resolveStorageURL failed:', path, e?.code || e?.message);
    }
    return null;
  }
}
