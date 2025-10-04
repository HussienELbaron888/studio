// src/utils/storage-url.ts
const BUCKET = "studio-3721710978-c50cb.appspot.com";
const TOKEN  = "9c1e3e5b-2c7b-4b7a-9a6e-0123456789ab";

export function resolveStorageURL(path: string | null | undefined): string {
  if (!path) return "";
  // path مثال: "trips/ID/cover_....jpg" بدون سلاش في البداية
  const objectPath = encodeURIComponent(path.replace(/^\/+/, ""));
  // لو عندك توكن واحد مُضاف للملفات كلها:
  const tokenParam = TOKEN ? `&token=${TOKEN}` : "";
  // رابط مباشر للملف (alt=media = محتوى الصورة)
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${objectPath}?alt=media${tokenParam}`;
}
