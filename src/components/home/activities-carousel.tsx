
"use client";

import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { activities } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';
import { ActivityCard } from '@/components/activities/activity-card';

export function ActivitiesCarousel() {
  const { language, content } = useLanguage();

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
          {activities.map((activity) => (
            <CarouselItem
              key={activity.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <ActivityCard 
                activity={activity}
                imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </CarouselItem>
          ))}
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
