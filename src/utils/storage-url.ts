// src/utils/storage-url.ts
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * ياخد مسار داخل البكت (مش URL)
 * مثال: "trips/9XRXyyMA.../cover_1759332598102.jpg"
 * ويرجع رابط قابل للعرض ?alt=media&token=...
 */
export async function resolveStorageURL(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  
  // Handle both full gs:// paths and direct paths
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
    // لتقليل الإزعاج في الكونسول
    if (typeof window !== 'undefined') {
      console.debug('resolveStorageURL failed:', path, e?.code || e?.message);
    }
    return null;
  }
}
