
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type AlbumValues = {
  title_ar?: string; title_en?: string;
  date?: string;
};

async function uploadAlbumImages(files: File[], albumId: string) {
    const max = Math.min(files.length, 10);
    const uploadPromises = [];

    for (let i = 0; i < max; i++) {
        const file = files[i];
        const fileRef = ref(storage, `albums/${albumId}/image_${Date.now()}_${i}`);
        uploadPromises.push(uploadBytes(fileRef, file).then(snapshot => getDownloadURL(snapshot.ref)));
    }
    return Promise.all(uploadPromises);
}


export async function updateAlbum(
  albumId: string,
  values: AlbumValues,
  existingImageUrls: string[],
  newFiles: File[]
) {
  const albumRef = doc(db, "albums", albumId);

  // Upload new files
  const newImageUrls = newFiles.length > 0 ? await uploadAlbumImages(newFiles, albumId) : [];
  
  const finalImageUrls = [...existingImageUrls, ...newImageUrls];

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    date: values.date || "",
    imageUrls: finalImageUrls,
  };

  await updateDoc(albumRef, docBody);

  return { id: albumId, imageUrls: finalImageUrls };
}
