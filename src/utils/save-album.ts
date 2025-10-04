
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type AlbumValues = {
  title_ar?: string; title_en?: string;
  date?: string;
};

async function uploadAlbumImages(files: File[], albumId: string) {
    const uploadPromises = files.map((file, i) => {
        const fileRef = ref(storage, `albums/${albumId}/image_${Date.now()}_${i}`);
        // Return the full path after upload is complete
        return uploadBytes(fileRef, file).then(snapshot => snapshot.ref.fullPath);
    });
    return Promise.all(uploadPromises);
}


export async function saveAlbum(values: AlbumValues, files: File[]) {
  const albumRef = doc(collection(db, "albums"));
  const albumId = albumRef.id;

  let imagePaths: string[] = [];

  if (files.length > 0) {
    imagePaths = await uploadAlbumImages(files, albumId);
  }

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    date: values.date || "",
    imageUrls: imagePaths, // Storing paths instead of download URLs
    created_at: serverTimestamp(),
  };

  await setDoc(albumRef, docBody);

  return { id: albumId, imagePaths };
}
