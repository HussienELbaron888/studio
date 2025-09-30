
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'user', firebaseUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setUser({
              ...firebaseUser,
              role: userDoc.data().user || 'user',
            });
          } else {
            // This might happen briefly when a user is created
            // and the document hasn't been written yet.
            // We set a default role.
            setUser({ ...firebaseUser, role: 'user' });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setUser({ ...firebaseUser, role: 'user' }); // Fallback to user role on error
          setLoading(false);
        });

        // Return the snapshot listener's unsubscribe function
        // to clean up when the user logs out.
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
