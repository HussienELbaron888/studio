
"use client"

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface AppUser extends User {
  role: 'admin' | 'user' | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        // Use onSnapshot to listen for real-time role changes
        const unsubscribeSnapshot = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setUser({
              ...firebaseUser,
              role: userDoc.data().role || 'user',
            });
          } else {
            // User exists in Auth but not in Firestore, treat as regular user
            setUser({ ...firebaseUser, role: 'user' });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role with onSnapshot:", error);
          // Fallback to user role on error, but still set loading to false
          setUser({ ...firebaseUser, role: 'user' });
          setLoading(false);
        });
        
        // Return the snapshot listener's unsubscribe function
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}
