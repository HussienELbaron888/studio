import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";

export type ActivityValues = {
  title_ar?: string; title_en?: string;
  description_ar?: string; description_en?: string;
  schedule_ar?: string; schedule_en?: string;
  time?: string; sessions?: number; price?: number; type?: string;
};

export async function updateImageAndSaveActivity(
  activityId: string,
  values: ActivityValues,
  file?: File | null,
  existingImagePath?: string | null
) {
  const storage = getStorage();
  const activityRef = doc(db, "activities", activityId);

  let imagePath: string | null = existingImagePath || null;

  if (file) {
    // If there's a new file, upload it
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const newImagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
    const storageRef = ref(storage, newImagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    await uploadBytes(storageRef, file, metadata);
    imagePath = newImagePath;

    // If a new image is uploaded and an old one exists, delete the old one
    if (existingImagePath && existingImagePath !== newImagePath) {
      try {
        const oldImageRef = ref(storage, existingImagePath);
        await deleteObject(oldImageRef);
      } catch (error: any) {
        // Log error if deletion fails but don't block the update
        console.error("Failed to delete old image:", error);
      }
    }
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    description: { ar: values.description_ar || "", en: values.description_en || "" },
    schedule: { ar: values.schedule_ar || "", en: values.schedule_en || "" },
    time: values.time || "",
    sessions: values.sessions ?? 0,
    price: values.price ?? 0,
    type: values.type || "general",
    image_path: imagePath,
  };

  await updateDoc(activityRef, docBody);

  return { id: activityId, imagePath };
}
