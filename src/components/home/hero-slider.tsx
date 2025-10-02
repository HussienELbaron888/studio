
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from '@/components/ui/skeleton';
import type { Slide } from '@/lib/types';
import { resolveStorageURL } from '@/utils/storage-url';

function HeroSliderSkeleton() {
  return (
    <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div className="max-w-2xl w-full space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}


export function HeroSlider() {
  const { language, content } = useLanguage();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(
      collection(db, "slides"),
      where("published", "==", true),
      orderBy("order", "asc"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slidesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide));
      setSlides(slidesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching slides:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const slide of slides) {
        if (slide.image_path) {
          const url = await resolveStorageURL(slide.image_path);
          if (url) {
            urls[slide.id] = url;
          }
        }
      }
      setImageUrls(urls);
    };

    if (slides.length > 0) {
      fetchImageUrls();
    }
  }, [slides]);

  if (loading) {
    return <HeroSliderSkeleton />;
  }
  
  if (!slides.length) {
    return null; // Or a fallback component
  }

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true, direction: language === 'ar' ? 'rtl' : 'ltr' }}
      plugins={[Autoplay({ delay: 5000 })]}
    >
      <CarouselContent>
        {slides.map((item, index) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
              {imageUrls[item.id] ? (
                <Image
                  src={imageUrls[item.id]}
                  alt={item.title[language as keyof typeof item.title]}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <Skeleton className="w-full h-full" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6 md:p-12">
                <div className="max-w-2xl text-white">
                  <h2 className="font-headline text-3xl font-bold md:text-5xl lg:text-6xl">
                    {item.title[language as keyof typeof item.title]}
                  </h2>
                  <p className="mt-2 text-base md:mt-4 md:text-xl">
                    {item.description[language as keyof typeof item.description]}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 md:mt-6"
                  >
                    <Link href={item.buttonHref}>
                      <span>{item.buttonText[language as keyof typeof item.buttonText]}</span>
                      <ArrowRight
                        className={cn(
                          'h-5 w-5',
                          language === 'ar' ? 'mr-2' : 'ml-2'
                        )}
                      />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
        <div className="flex items-center justify-center gap-4 rounded-full bg-card/50 p-2 backdrop-blur-sm">
          {language === 'ar' ? (
            <>
              <CarouselNext className="static -translate-y-0" />
              <CarouselPrevious className="static -translate-y-0" />
            </>
          ) : (
            <>
              <CarouselPrevious className="static -translate-y-0" />
              <CarouselNext className="static -translate-y-0" />
            </>
          )}
        </div>
      </div>
    </Carousel>
  );
}
