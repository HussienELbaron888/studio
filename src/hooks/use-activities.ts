
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Activity } from '@/lib/placeholder-data';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activitiesCollection = collection(db, 'activities');
    const q = query(activitiesCollection, orderBy('title.en')); // Sort by English title for consistency

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Activity, 'id'>),
      }));
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activities:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { activities, loading };
}
