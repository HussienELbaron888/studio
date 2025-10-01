import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type TripValues = {
  title_ar?: string; title_en?: string;
  destination_ar?: string; destination_en?: string;
  schedule_ar?: string; schedule_en?: string;
  price?: number;
};

export async function updateTrip(
  tripId: string,
  values: TripValues,
  file?: File | null,
  existingImagePath?: string | null
) {
  const tripRef = doc(db, "trips", tripId);

  let imagePath: string | null = existingImagePath || null;

  if (file) {
    // If there's a new file, upload it
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const newImagePath = `trips/${tripId}/cover_${Date.now()}.${ext}`;
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
    destination: { ar: values.destination_ar || "", en: values.destination_en || "" },
    schedule: { ar: values.schedule_ar || "", en: values.schedule_en || "" },
    price: values.price ?? 0,
    image_path: imagePath,
  };

  await updateDoc(tripRef, docBody);

  return { id: tripId, imagePath };
}
