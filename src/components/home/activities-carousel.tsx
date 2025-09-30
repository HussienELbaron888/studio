
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
import { useLanguage } from '@/context/language-context';
import { ActivityCard } from '@/components/activities/activity-card';
import { useActivities } from '@/hooks/use-activities';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export function ActivitiesCarousel() {
  const { language, content } = useLanguage();
  const { activities, loading } = useActivities();

  if (loading) {
    return (
       <div className="flex justify-center items-center h-80">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  if (activities.length === 0) {
      return (
        <section>
             <h2 className="font-headline text-3xl font-bold md:text-4xl mb-4">
              {content.activitiesTitle}
            </h2>
            <Card className="flex items-center justify-center h-80">
                <CardContent className="p-8 text-center text-muted-foreground">
                    <p>No activities available at the moment. Please check back later.</p>
                </CardContent>
            </Card>
        </section>
      )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            {content.activitiesTitle}
          </h2>
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/activities">{content.viewAll}</Link>
          </Button>
        </div>
      </div>
      
      <Carousel
        opts={{
          align: 'start',
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full"
      >
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
        <div className="hidden sm:flex items-center justify-center gap-2 absolute -top-14 ltr:right-0 rtl:left-0">
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
        </Carousel>

        <Button asChild variant="link" className="mt-4 w-full sm:hidden">
          <Link href="/activities">{content.viewAll}</Link>
        </Button>
    </section>
  );
}

