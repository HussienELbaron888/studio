import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export function withTimeout<T>(p: Promise<T>, ms: number, label = "operation"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

export type ActivityValues = {
  title_ar?: string; title_en?: string;
  description_ar?: string; description_en?: string;
  schedule_ar?: string; schedule_en?: string;
  time?: string; sessions?: number; price?: number; type?: string;
};

export async function uploadImageAndSaveActivity(values: ActivityValues, file?: File | null) {
  const db = getFirestore();
  const storage = getStorage();

  const activityRef = doc(collection(db, "activities"));
  const activityId = activityRef.id;

  let imagePath: string | null = null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    imagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
    const storageRef = ref(storage, imagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    console.time("upload");
    await withTimeout(uploadBytes(storageRef, file, metadata), 15000, "uploadBytes");
    console.timeEnd("upload");
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    description: { ar: values.description_ar || "", en: values.description_en || "" },
    schedule: { ar: values.schedule_ar || "", en: values.schedule_en || "" },
    time: values.time || "",
    sessions: values.sessions ?? 0,
    price: values.price ?? 0,
    type: values.type || "general",
    image: {
      id: `img-${Date.now()}`,
      description: values.description_en || "",
      imageUrl: "",         
      imageHint: "activity-cover"
    },
    image_path: imagePath,
    created_at: serverTimestamp(),
  };

  console.time("doc");
  await withTimeout(setDoc(activityRef, docBody), 15000, "setDoc");
  console.timeEnd("doc");

  return { id: activityId, imagePath };
}
