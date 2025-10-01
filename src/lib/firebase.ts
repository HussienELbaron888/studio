// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-3721710978-c50cb",
  "appId": "1:375653892065:web:5dda7e35c0b22b86c59ca0",
  "storageBucket": "studio-3721710978-c50cb.appspot.com",
  "apiKey": "AIzaSyAF7BK3glD5I3QLB15k750mytV3N0LuAE4",
  "authDomain": "studio-3721710978-c50cb.firebaseapp.com",
  "messagingSenderId": "375653892065"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
