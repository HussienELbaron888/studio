// src/utils/storage-url.ts
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const TOKEN  = process.env.NEXT_PUBLIC_FB_DL_TOKEN || "";

export function resolveStorageURL(path: string | null | undefined): string {
  if (!path) return "";
  // path مثال: "trips/ID/cover_....jpg" بدون سلاش في البداية
  const objectPath = encodeURIComponent(path.replace(/^\/+/, ""));
  // لو عندك توكن واحد مُضاف للملفات كلها:
  const tokenParam = TOKEN ? `&token=${TOKEN}` : "";
  // رابط مباشر للملف (alt=media = محتوى الصورة)
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${objectPath}?alt=media${tokenParam}`;
}
