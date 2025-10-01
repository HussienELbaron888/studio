
"use client"

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface AppUser extends User {
  role: 'admin' | 'user' | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({
              ...firebaseUser,
              role: userDoc.data().role || 'user',
            });
          } else {
            // User exists in Auth but not in Firestore, treat as regular user
            setUser({ ...firebaseUser, role: 'user' });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser({ ...firebaseUser, role: 'user' }); // Fallback to user role on error
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}
