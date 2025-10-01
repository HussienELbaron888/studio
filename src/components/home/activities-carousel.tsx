"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Activity } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { ActivityCard } from '@/components/activities/activity-card';
import { Skeleton } from '@/components/ui/skeleton';

function CarouselSkeleton() {
  return (
    <div className="flex space-x-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-4">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[224px] w-full rounded-lg" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitiesCarousel() {
  const { language, content } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activitiesQuery = query(collection(db, 'activities'), orderBy('created_at', 'desc'), limit(6));
    
    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        setLoading(false);
        return; // Silently ignore for public carousel
      }
      console.error("Error fetching activities:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section>
      <Carousel
        opts={{
          align: 'start',
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">
              {content.activitiesTitle}
            </h2>
            <Button asChild variant="link" className="hidden sm:inline-flex">
              <Link href="/activities">{content.viewAll}</Link>
            </Button>
          </div>
          <div className="items-center gap-2 hidden sm:flex">
             {language === 'ar' ? (
              <>
                <CarouselNext className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
                <CarouselPrevious className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
              </>
            ) : (
              <>
                <CarouselPrevious className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
                <CarouselNext className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
              </>
            )}
          </div>
        </div>
      
        <CarouselContent>
          {loading ? (
            <CarouselSkeleton />
          ) : (
            activities.map((activity) => (
              <CarouselItem
                key={activity.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <ActivityCard 
                  activity={activity}
                  imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </CarouselItem>
            ))
          )}
        </CarouselContent>

        <div className="sm:hidden mt-4 flex items-center justify-center gap-4">
            {language === 'ar' ? (
              <>
                <CarouselNext className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
                <CarouselPrevious className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
              </>
            ) : (
              <>
                <CarouselPrevious className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
                <CarouselNext className="static -translate-y-0 border-primary text-primary disabled:text-primary" />
              </>
            )}
        </div>
        <Button asChild variant="link" className="mt-4 w-full sm:hidden">
          <Link href="/activities">{content.viewAll}</Link>
        </Button>
      </Carousel>
    </section>
  );
}
