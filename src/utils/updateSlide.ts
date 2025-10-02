
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { SlideValues } from "./saveSlide";


export async function updateSlide(
  slideId: string,
  values: SlideValues,
  file?: File | null,
  existingImagePath?: string | null
) {
  const slideRef = doc(db, "slides", slideId);

  let imagePath: string | null = existingImagePath || null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const newImagePath = `slides/${slideId}/image_${Date.now()}.${ext}`;
    const storageRef = ref(storage, newImagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    await uploadBytes(storageRef, file, metadata);
    imagePath = newImagePath;

    if (existingImagePath && existingImagePath !== newImagePath) {
      try {
        const oldImageRef = ref(storage, existingImagePath);
        await deleteObject(oldImageRef);
      } catch (error: any) {
        console.error("Failed to delete old image:", error);
      }
    }
  }

  const docBody = {
    title: { ar: values.title_ar, en: values.title_en },
    description: { ar: values.description_ar, en: values.description_en },
    buttonText: { ar: values.buttonText_ar, en: values.buttonText_en },
    buttonHref: values.buttonHref,
    order: values.order,
    published: values.published,
    image_path: imagePath,
  };

  await updateDoc(slideRef, docBody);

  return { id: slideId, imagePath };
}
