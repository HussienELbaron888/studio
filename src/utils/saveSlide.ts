
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type SlideValues = {
  title_ar: string; title_en: string;
  description_ar: string; description_en: string;
  buttonText_ar: string; buttonText_en: string;
  buttonHref: string;
  order: number;
  published: boolean;
};

export async function saveSlide(values: SlideValues, file: File) {
  const slideRef = doc(collection(db, "slides"));
  const slideId = slideRef.id;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const imagePath = `slides/${slideId}/image_${Date.now()}.${ext}`;
  const storageRef = ref(storage, imagePath);
  const metadata = { contentType: file.type || "application/octet-stream" };

  await uploadBytes(storageRef, file, metadata);

  const docBody = {
    title: { ar: values.title_ar, en: values.title_en },
    description: { ar: values.description_ar, en: values.description_en },
    buttonText: { ar: values.buttonText_ar, en: values.buttonText_en },
    buttonHref: values.buttonHref,
    order: values.order,
    published: values.published,
    image_path: imagePath,
    createdAt: serverTimestamp(),
  };

  await setDoc(slideRef, docBody);

  return { id: slideId, imagePath };
}
