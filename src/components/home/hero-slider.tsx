"use client";

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { sliderItems } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay"

export function HeroSlider() {
  const { language, content } = useLanguage();

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true, direction: language === 'ar' ? 'rtl' : 'ltr' }}
      plugins={[Autoplay({ delay: 5000 })]}
    >
      <CarouselContent>
        {sliderItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
              <Image
                src={item.image.imageUrl}
                alt={item.image.description}
                fill
                className="object-cover"
                data-ai-hint={item.image.imageHint}
                priority={item.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6 md:p-12">
                <div className="max-w-2xl text-white">
                  <h2 className="font-headline text-3xl font-bold md:text-5xl lg:text-6xl">
                    {item.title[language]}
                  </h2>
                  <p className="mt-2 text-base md:mt-4 md:text-xl">
                    {item.subtitle[language]}
                  </p>
                  <Button
                    size="lg"
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 md:mt-6"
                  >
                    <span>{content.eventsButton}</span>
                    <ArrowRight
                      className={cn(
                        'h-5 w-5',
                        language === 'ar' ? 'mr-2' : 'ml-2'
                      )}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
        <div className="flex items-center justify-center gap-4 rounded-full bg-card/50 p-2 backdrop-blur-sm">
          <CarouselPrevious className="static -translate-y-0" />
          <CarouselNext className="static -translate-y-0" />
        </div>
      </div>
    </Carousel>
  );
}
