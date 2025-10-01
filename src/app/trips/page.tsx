
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Trip } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { TripCard } from '@/components/trips/trip-card';
import { Skeleton } from '@/components/ui/skeleton';

function TripGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[224px] w-full rounded-lg" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TripsPage() {
  const { content } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsQuery = query(collection(db, 'trips'), orderBy('created_at', 'desc'));
        const snapshot = await getDocs(tripsQuery);
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Trip));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navTrips}
      </h1>
      {loading ? (
        <TripGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trips.map((trip) => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
