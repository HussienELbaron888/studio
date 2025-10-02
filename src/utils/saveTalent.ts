
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type TalentValues = {
  name_ar?: string; name_en?: string;
  stage_ar?: string; stage_en?: string;
  details_ar?: string; details_en?: string;
};

export async function saveTalent(values: TalentValues, file?: File | null) {
  const talentRef = doc(collection(db, "talents"));
  const talentId = talentRef.id;

  let imagePath: string | null = null;

  if (file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    imagePath = `talents/${talentId}/profile_${Date.now()}.${ext}`;
    const storageRef = ref(storage, imagePath);
    const metadata = { contentType: file.type || "application/octet-stream" };

    await uploadBytes(storageRef, file, metadata);
  }

  const docBody = {
    name: { ar: values.name_ar || "", en: values.name_en || "" },
    stage: { ar: values.stage_ar || "", en: values.stage_en || "" },
    details: { ar: values.details_ar || "", en: values.details_en || "" },
    image_path: imagePath,
    created_at: serverTimestamp(),
  };

  await setDoc(talentRef, docBody);

  return { id: talentId, imagePath };
}
