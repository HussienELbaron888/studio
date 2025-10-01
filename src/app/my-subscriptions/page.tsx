
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/context/language-context';
import type { Activity, Trip } from '@/lib/types';
import { ActivityCard } from '@/components/activities/activity-card';
import { TripCard } from '@/components/trips/trip-card';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type SubscribedItem = (Activity & { itemType: 'activity' }) | (Trip & { itemType: 'trip' });

export default function MySubscriptionsPage() {
  const { content } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscribedItems, setSubscribedItems] = useState<SubscribedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');
    const q = query(subscriptionsRef);
    
    const unsubscribe = onSnapshot(q, async (subscriptionsSnapshot) => {
      const itemPromises = subscriptionsSnapshot.docs.map(async (subDoc) => {
        const subData = subDoc.data();
        const itemType = subData.itemType; // 'activity' or 'trip'
        const itemId = subData.activityId || subData.tripId;

        if (!itemId || !itemType) return null;
        
        const collectionName = itemType === 'activity' ? 'activities' : 'trips';
        const itemRef = doc(db, collectionName, itemId);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          return { id: itemSnap.id, ...itemSnap.data(), itemType } as SubscribedItem;
        }
        return null;
      });

      const userItems = (await Promise.all(itemPromises)).filter(Boolean) as SubscribedItem[];
      
      setSubscribedItems(userItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscriptions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const activities = subscribedItems.filter(item => item.itemType === 'activity') as (Activity & { itemType: 'activity' })[];
  const trips = subscribedItems.filter(item => item.itemType === 'trip') as (Trip & { itemType: 'trip' })[];

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.mySubscriptionsTitle}
      </h1>
      
      {subscribedItems.length > 0 ? (
        <div className="space-y-12">
            {activities.length > 0 && (
                <div>
                    <h2 className="font-headline text-2xl font-bold md:text-3xl mb-6">{content.navActivities}</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activities.map((activity) => (
                            <ActivityCard 
                                key={activity.id} 
                                activity={activity} 
                                imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {activities.length > 0 && trips.length > 0 && <Separator className="my-12"/>}

            {trips.length > 0 && (
                 <div>
                    <h2 className="font-headline text-2xl font-bold md:text-3xl mb-6">{content.navTrips}</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {trips.map((trip) => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {content.noSubscriptions}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
