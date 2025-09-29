"use client";

import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { activities } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';

export function ActivitiesCarousel() {
  const { language, content } = useLanguage();

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold md:text-4xl">
          {content.activitiesTitle}
        </h2>
        <Button asChild variant="link">
          <Link href="/activities">{content.viewAll}</Link>
        </Button>
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
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-56 w-full">
                    <Image
                      src={activity.image.imageUrl}
                      alt={activity.image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={activity.image.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <Badge
                      className={`absolute top-3 ${
                        language === 'ar' ? 'left-3' : 'right-3'
                      } ${
                        activity.type === 'Paid'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary'
                      }`}
                    >
                      {activity.type === 'Paid' ? content.paid : content.free}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-headline text-lg font-semibold">
                      {activity.title[language]}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -top-14 border-primary text-primary disabled:text-primary ltr:right-12 rtl:left-12" />
        <CarouselNext className="absolute -top-14 border-primary text-primary disabled:text-primary ltr:right-0 rtl:left-0" />
      </Carousel>
    </section>
  );
}
