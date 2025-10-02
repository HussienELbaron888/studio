
"use client";

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLanguage } from '@/context/language-context';

type AlbumViewerProps = {
  imageUrls: string[];
};

export function AlbumViewer({ imageUrls }: AlbumViewerProps) {
  const { language } = useLanguage();

  if (!imageUrls || imageUrls.length === 0) {
    return <div className="text-center text-muted-foreground">No images in this album.</div>;
  }

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full"
      >
        <CarouselContent>
          {imageUrls.map((url, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video w-full">
                <Image
                  src={url}
                  alt={`Album image ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>
    </div>
  );
}
