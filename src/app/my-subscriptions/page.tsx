
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/context/language-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Subscription {
  id: string;
  itemTitle: string;
  itemType: 'activity' | 'trip';
  subscribedAt: Timestamp;
}

export default function MySubscriptionsPage() {
  const { content, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
    
    const unsubscribe = onSnapshot(q, (subscriptionsSnapshot) => {
      const subsData = subscriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscription));
      
      setSubscriptions(subsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscriptions:", error);
      if (error.code === 'permission-denied') {
        // Silently ignore permission errors on this page
        setLoading(false);
        return;
      }
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
  
  const activities = subscriptions.filter(item => item.itemType === 'activity');
  const trips = subscriptions.filter(item => item.itemType === 'trip');

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.mySubscriptionsTitle}
      </h1>
      
      {subscriptions.length > 0 ? (
        <div className="space-y-12">
            {activities.length > 0 && (
                <div>
                    <h2 className="font-headline text-2xl font-bold md:text-3xl mb-6">{content.navActivities}</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activities.map((activity) => (
                           <Card key={activity.id}>
                               <CardHeader>
                                   <CardTitle>{activity.itemTitle}</CardTitle>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-sm text-muted-foreground">
                                     {content.subscribedButton}
                                   </p>
                               </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>
            )}
            
            {activities.length > 0 && trips.length > 0 && <Separator className="my-12"/>}

            {trips.length > 0 && (
                 <div>
                    <h2 className="font-headline text-2xl font-bold md:text-3xl mb-6">{content.navTrips}</h2>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.map((trip) => (
                           <Card key={trip.id}>
                               <CardHeader>
                                   <CardTitle>{trip.itemTitle}</CardTitle>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-sm text-muted-foreground">
                                     {content.subscribedButton}
                                   </p>
                               </CardContent>
                           </Card>
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
