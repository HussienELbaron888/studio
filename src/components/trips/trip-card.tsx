
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import type { Trip } from '@/lib/types';
import { CalendarDays, MapPin, DollarSign, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL } from '@/utils/storage-url';
import { TripSubscriptionForm } from './trip-subscription-form';


type TripCardProps = {
  trip: Trip;
  imageSizes: string;
};

export function TripCard({ trip, imageSizes }: TripCardProps) {
  const { language, content } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setIsSubscribed(false);
      return;
    };

    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where("itemId", "==", trip.id), // Use itemId to check across types
      where("userId", "==", uid),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setIsSubscribed(!querySnapshot.empty);
    }, (error) => {
       if (error.code !== "permission-denied") {
        console.error("Subscription check failed:", error);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, trip.id]);

  const resolvedUrl = resolveStorageURL(trip.image_path);
  const title = trip.title[language as keyof typeof trip.title];
  const destination = trip.destination[language as keyof typeof trip.destination];
  const schedule = trip.schedule[language as keyof typeof trip.schedule];
  const price = trip.price;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          {resolvedUrl ? (
            <Image
              src={resolvedUrl}
              alt={title}
              fill
              className="object-cover"
              sizes={imageSizes}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://picsum.photos/seed/2/600/400"; }}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-headline text-lg font-semibold flex-grow min-h-[3rem]">
            {title}
          </h3>

          <div className="my-3 space-y-2 text-sm text-muted-foreground">
            {destination && (
              <div className="flex items-center">
                <MapPin className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{destination}</span>
              </div>
            )}
            {schedule && (
              <div className="flex items-center">
                <CalendarDays className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{schedule}</span>
              </div>
            )}
             {price > 0 && (
              <div className="flex items-center font-semibold text-accent-foreground">
                <DollarSign className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{language === 'ar' ? `${price} ريال` : `${price} SAR`}</span>
              </div>
            )}
          </div>
            {user && (
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-auto" disabled={isSubscribed}>
                  {isSubscribed ? content.subscribedButton : content.subscribeButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" aria-describedby="trip-sub-desc">
                <DialogHeader>
                  <DialogTitle>{trip.title[language as keyof typeof trip.title]}</DialogTitle>
                  <DialogDescription id="trip-sub-desc" className="sr-only">
                    نموذج الاشتراك في الرحلة
                  </DialogDescription>
                </DialogHeader>
                <TripSubscriptionForm 
                  setDialogOpen={setDialogOpen} 
                  tripTitle={trip.title.en} 
                  tripId={trip.id}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
