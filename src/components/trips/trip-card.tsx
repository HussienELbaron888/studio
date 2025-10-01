"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { storage } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import type { Trip } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays, MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

type TripCardProps = {
  trip: Trip;
  imageSizes: string;
};

export function TripCard({ trip, imageSizes }: TripCardProps) {
  const { language } = useLanguage();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function resolveUrl() {
      setIsImageLoading(true);
      if (trip.image_path) {
        try {
          const url = await getDownloadURL(storageRef(storage, trip.image_path));
          if (mounted) {
            setResolvedUrl(url);
          }
        } catch (e) {
          console.error("Error resolving image URL:", e);
          if (mounted) {
            setResolvedUrl(null);
          }
        } finally {
           if (mounted) {
            setIsImageLoading(false);
          }
        }
      } else {
        setIsImageLoading(false);
      }
    }

    resolveUrl();
    
    return () => { mounted = false; };
  }, [trip.image_path]);

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
        </div>
      </CardContent>
    </Card>
  );
}
