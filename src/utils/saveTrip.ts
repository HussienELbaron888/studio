
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export type TripValues = {
  title_ar?: string; title_en?: string;
  destination_ar?: string; destination_en?: string;
  schedule_ar?: string; schedule_en?: string;
  price?: number;
};

export async function saveTrip(values: TripValues, file?: File | null) {
  const db = getFirestore();
  const storage = getStorage();

  const tripRef = doc(collection(db, "trips"));
  const tripId = tripRef.id;

  let imagePath: string | null = null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    imagePath = `trips/${tripId}/cover_${Date.now()}.${ext}`;
    const storageRef = ref(storage, imagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    await uploadBytes(storageRef, file, metadata);
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    destination: { ar: values.destination_ar || "", en: values.destination_en || "" },
    schedule: { ar: values.schedule_ar || "", en: values.schedule_en || "" },
    price: values.price ?? 0,
    image_path: imagePath,
    created_at: serverTimestamp(),
  };

  await setDoc(tripRef, docBody);

  return { id: tripId, imagePath };
}
