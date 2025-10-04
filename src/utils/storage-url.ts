
"use client";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const TOKEN = process.env.NEXT_PUBLIC_FB_DL_TOKEN || "";

/**
 * يبني رابط تحميل مباشر للصورة من Storage باستخدام توكن ثابت.
 * @param path - المسار داخل البكت (e.g., "trips/ID/cover_123.jpg")
 * @returns رابط URL قابل للعرض مباشرة.
 */
export function resolveStorageURL(path: string | null | undefined): string | null {
  if (!path) return null;

  // نتأكد من أن المسار لا يبدأ بسلاش
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const objectPath = encodeURIComponent(cleanPath);

  if (!BUCKET) {
    console.error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in .env");
    return null;
  }

  // لو التوكن موجود، نضيفه للرابط
  const tokenParam = TOKEN ? `&token=${TOKEN}` : "";

  // نرجع الرابط المباشر للملف
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${objectPath}?alt=media${tokenParam}`;
}

/** لو عندك URL قديم مخزّن ببكت appspot، بنصلّحه مؤقتًا */
export function fixOldBucketUrl(url?: string | null) {
  if (!url) return null;
  return url.replace(
    "/b/studio-3721710978-c50cb.appspot.com/",
    "/b/studio-3721710978-c50cb.firebasestorage.app/"
  );
}
