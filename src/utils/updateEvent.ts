
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type EventValues = {
  title_ar?: string; title_en?: string;
  description_ar?: string; description_en?: string;
  location_ar?: string; location_en?: string;
  price?: number;
};

export async function updateEvent(
  eventId: string,
  values: EventValues,
  file?: File | null,
  existingImagePath?: string | null
) {
  const eventRef = doc(db, "events", eventId);

  let imagePath: string | null = existingImagePath || null;

  if (file) {
    // If there's a new file, upload it
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const newImagePath = `events/${eventId}/cover_${Date.now()}.${ext}`;
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
    location: { ar: values.location_ar || "", en: values.location_en || "" },
    price: values.price ?? 0,
    image_path: imagePath,
  };

  await updateDoc(eventRef, docBody);

  return { id: eventId, imagePath };
}
