import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type ActivityValues = {
  title_ar?: string; title_en?: string;
  description_ar?: string; description_en?: string;
  schedule_ar?: string; schedule_en?: string;
  time?: string; sessions?: number; price?: number; type?: string;
};

export async function uploadImageAndSaveActivity(values: ActivityValues, file?: File | null) {
  const activityRef = doc(collection(db, "activities"));
  const activityId = activityRef.id;

  let imagePath: string | null = null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    imagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
    const storageRef = ref(storage, imagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    // Upload without a manual timeout
    await uploadBytes(storageRef, file, metadata);
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    description: { ar: values.description_ar || "", en: values.description_en || "" },
    schedule: { ar: values.schedule_ar || "", en: values.schedule_en || "" },
    time: values.time || "",
    sessions: values.sessions ?? 0,
    price: values.price ?? 0,
    type: values.type || "general",
    image: null, // Keep image object null/simple, image_path is what matters
    image_path: imagePath,
    created_at: serverTimestamp(),
  };

  // Save document without a manual timeout
  await setDoc(activityRef, docBody);

  return { id: activityId, imagePath };
}
