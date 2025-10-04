import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAF7BK3glD5I3QLB15k750mytV3N0LuAE4",
  authDomain: "studio-3721710978-c50cb.firebaseapp.com",
  projectId: "studio-3721710978-c50cb",
  storageBucket: "studio-3721710978-c50cb.appspot.com",
  messagingSenderId: "375653892065",
  appId: "1:375653892065:web:5dda7e35c0b22b86c59ca0",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');

// 👈 أجبر الـ SDK على نفس البكت في كل مكان
export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

    