
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
import type { Event } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL } from '@/utils/storage-url';
import { EventSubscriptionForm } from './event-subscription-form';


type EventCardProps = {
  event: Event;
  imageSizes: string;
};

export function EventCard({ event, imageSizes }: EventCardProps) {
  const { language, content } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsImageLoading(true);
    
    const fetchUrl = async () => {
      try {
        const url = await resolveStorageURL(event.image_path);
        if (alive) {
          setResolvedUrl(url);
        }
      } catch (e: any) {
        console.debug("img resolve failed:", event.image_path, e?.code || e?.message);
        if (alive) {
          setResolvedUrl(null);
        }
      } finally {
        if (alive) {
          setIsImageLoading(false);
        }
      }
    };
    
    fetchUrl();

    return () => { alive = false; };
  }, [event.image_path]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setIsSubscribed(false);
      return;
    };

    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where("itemId", "==", event.id),
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
  }, [user?.uid, event.id]);

  const title = event.title[language as keyof typeof event.title];
  const description = event.description[language as keyof typeof event.description];
  const location = event.location[language as keyof typeof event.location];
  const price = event.price;

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

          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="my-3 space-y-2 text-sm text-muted-foreground">
            {location && (
              <div className="flex items-center">
                <MapPin className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{location}</span>
              </div>
            )}
             {price && price > 0 ? (
              <div className="flex items-center font-semibold text-accent-foreground">
                <DollarSign className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{language === 'ar' ? `${price} ريال` : `${price} SAR`}</span>
              </div>
            ) : (
              <div className="flex items-center font-semibold text-primary">
                 <DollarSign className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                 <span>{content.free}</span>
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
              <DialogContent className="sm:max-w-[425px]" aria-describedby="event-sub-desc">
                <DialogHeader>
                  <DialogTitle>{event.title[language as keyof typeof event.title]}</DialogTitle>
                  <DialogDescription id="event-sub-desc" className="sr-only">
                    نموذج الاشتراك في الفعالية
                  </DialogDescription>
                </DialogHeader>
                <EventSubscriptionForm 
                  setDialogOpen={setDialogOpen} 
                  eventTitle={event.title.en} 
                  eventId={event.id}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
