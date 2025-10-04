
"use client";

import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Asynchronously resolves a storage path to a downloadable URL.
 * It now uses getDownloadURL, which is the recommended Firebase approach.
 * This function is safe to call from client components.
 * 
 * @param path The relative path to the file in Firebase Storage (e.g., "activities/ID/cover.jpg").
 * @returns A promise that resolves to the downloadable URL, or null if the path is invalid or an error occurs.
 */
export async function resolveStorageURL(path: string | null | undefined): Promise<string | null> {
  // Ensure we're running on the client side, as Firebase Storage SDK for web requires it.
  if (typeof window === "undefined") {
    console.warn("resolveStorageURL was called on the server. It should only be used in client components.");
    return null;
  }
  
  if (!path) {
    return null;
  }

  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error: any) {
    // Log errors for debugging, but don't crash the app.
    // Common errors: 'storage/object-not-found'
    if (error.code !== 'storage/object-not-found') {
        console.debug(`Failed to resolve storage URL for path: "${path}"`, error);
    }
    return null;
  }
}
