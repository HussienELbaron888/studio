
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/context/language-context';
import { activities, Activity } from '@/lib/placeholder-data';
import { ActivityCard } from '@/components/activities/activity-card';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MySubscriptionsPage() {
  const { content } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscribedActivities, setSubscribedActivities] = useState<Activity[]>([]);
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
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const subscribedIds = querySnapshot.docs.map(doc => doc.data().activityId);
      const userActivities = activities.filter(activity => subscribedIds.includes(activity.id));
      setSubscribedActivities(userActivities);
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

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.mySubscriptionsTitle}
      </h1>
      {subscribedActivities.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subscribedActivities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
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
