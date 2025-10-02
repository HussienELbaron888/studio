
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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


export async function saveAlbum(values: AlbumValues, files: File[]) {
  const albumRef = doc(collection(db, "albums"));
  const albumId = albumRef.id;

  let imageUrls: string[] = [];

  if (files.length > 0) {
    imageUrls = await uploadAlbumImages(files, albumId);
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    date: values.date || "",
    imageUrls: imageUrls,
    created_at: serverTimestamp(),
  };

  await setDoc(albumRef, docBody);

  return { id: albumId, imageUrls };
}
