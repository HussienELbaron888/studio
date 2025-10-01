
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import type { Trip } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays, MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL, fixOldBucketUrl } from '@/utils/storage-url';
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
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setIsImageLoading(true);
    
    const fetchUrl = async () => {
      try {
        let url: string | null = null;
        if (trip.image_path) {
            url = await resolveStorageURL(trip.image_path);
        } else if ((trip as any).image?.imageUrl) {
            url = fixOldBucketUrl((trip as any).image.imageUrl);
        }
        
        if (!cancel) {
          setResolvedUrl(url);
        }
      } catch (e) {
        console.error("img resolve failed:", e);
      } finally {
        if (!cancel) {
          setIsImageLoading(false);
        }
      }
    };
    
    fetchUrl();

    return () => { cancel = true; };
  }, [trip.image_path, (trip as any).image?.imageUrl]);

  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      return;
    };

    const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where("tripId", "==", trip.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setIsSubscribed(!querySnapshot.empty);
    }, (error) => {
       if (error.code === 'permission-denied') {
          console.warn("Permission check failed for trip subscription. This may be expected.");
          return;
      }
      console.error("Subscription check failed:", error);
    });

    return () => unsubscribe();
  }, [user, trip.id]);

  const title = trip.title[language as keyof typeof trip.title];
  const destination = trip.destination[language as keyof typeof trip.destination];
  const schedule = trip.schedule[language as keyof typeof trip.schedule];
  const price = trip.price;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          {isImageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : resolvedUrl ? (
            <Image
              src={resolvedUrl}
              alt={title}
              fill
              className="object-cover"
              sizes={imageSizes}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No Image</span>
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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{trip.title[language as keyof typeof trip.title]}</DialogTitle>
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
