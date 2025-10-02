
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type EventValues = {
  title_ar?: string; title_en?: string;
  description_ar?: string; description_en?: string;
  location_ar?: string; location_en?: string;
  price?: number;
};

export async function saveEvent(values: EventValues, file?: File | null) {
  const eventRef = doc(collection(db, "events"));
  const eventId = eventRef.id;

  let imagePath: string | null = null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    imagePath = `events/${eventId}/cover_${Date.now()}.${ext}`;
    const storageRef = ref(storage, imagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    await uploadBytes(storageRef, file, metadata);
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    description: { ar: values.description_ar || "", en: values.description_en || "" },
    location: { ar: values.location_ar || "", en: values.location_en || "" },
    price: values.price ?? 0,
    image_path: imagePath,
    created_at: serverTimestamp(),
  };

  await setDoc(eventRef, docBody);

  return { id: eventId, imagePath };
}
