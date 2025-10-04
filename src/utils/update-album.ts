
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type AlbumValues = {
  title_ar?: string; title_en?: string;
  date?: string;
};

async function uploadAlbumImages(files: File[], albumId: string) {
    const uploadPromises = files.map((file, i) => {
        const fileRef = ref(storage, `albums/${albumId}/image_${Date.now()}_${i}`);
        return uploadBytes(fileRef, file).then(() => fileRef.fullPath);
    });
    return Promise.all(uploadPromises);
}

export async function updateAlbum(
  albumId: string,
  values: AlbumValues,
  keptImagePaths: string[],
  newFiles: File[],
  originalImagePaths: string[]
) {
  const albumRef = doc(db, "albums", albumId);

  // Determine which images to delete
  const imagesToDelete = originalImagePaths.filter(path => !keptImagePaths.includes(path));
  
  // Delete images from storage
  const deletePromises = imagesToDelete.map(path => {
    const imageRef = ref(storage, path);
    return deleteObject(imageRef).catch(error => {
      // Don't fail the whole operation if one delete fails (e.g., file not found)
      console.warn(`Could not delete old image ${path}:`, error);
    });
  });
  await Promise.all(deletePromises);

  // Upload new files and get their paths
  const newImagePaths = newFiles.length > 0 ? await uploadAlbumImages(newFiles, albumId) : [];
  
  const finalImagePaths = [...keptImagePaths, ...newImagePaths];

  const docBody = {
    title: { ar: values.title_ar || "", en: values.title_en || "" },
    date: values.date || "",
    imageUrls: finalImagePaths, // Store paths, not download URLs
  };

  await updateDoc(albumRef, docBody);

  return { id: albumId, imagePaths: finalImagePaths };
}
