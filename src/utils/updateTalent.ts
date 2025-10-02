
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type TalentValues = {
  name_ar?: string; name_en?: string;
  stage_ar?: string; stage_en?: string;
  details_ar?: string; details_en?: string;
};

export async function updateTalent(
  talentId: string,
  values: TalentValues,
  file?: File | null,
  existingImagePath?: string | null
) {
  const talentRef = doc(db, "talents", talentId);

  let imagePath: string | null = existingImagePath || null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const newImagePath = `talents/${talentId}/profile_${Date.now()}.${ext}`;
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
    name: { ar: values.name_ar || "", en: values.name_en || "" },
    stage: { ar: values.stage_ar || "", en: values.stage_en || "" },
    details: { ar: values.details_ar || "", en: values.details_en || "" },
    image_path: imagePath,
  };

  await updateDoc(talentRef, docBody);

  return { id: talentId, imagePath };
}
