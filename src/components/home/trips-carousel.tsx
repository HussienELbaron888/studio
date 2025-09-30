
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
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { trips } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';

export function TripsCarousel() {
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
              {content.tripsTitle}
            </h2>
            <Button asChild variant="link" className="hidden sm:inline-flex">
                <Link href="/activities">{content.viewAll}</Link>
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-2">
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
          {trips.map((trip) => (
            <CarouselItem
              key={trip.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-56 w-full">
                    <Image
                      src={trip.image.imageUrl}
                      alt={trip.image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={trip.image.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-headline text-lg font-semibold">
                      {trip.title[language]}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <MapPin className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                      <span>{trip.destination[language]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
