
"use client"

import { useState, useEffect } from 'react';
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
      setLoading(true); // Start loading when auth state changes
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
          // Fallback to user role on error
          setUser({ ...firebaseUser, role: 'user' });
        } finally {
          setLoading(false); // Stop loading after fetching role
        }
      } else {
        setUser(null);
        setLoading(false); // Stop loading if no user
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}
