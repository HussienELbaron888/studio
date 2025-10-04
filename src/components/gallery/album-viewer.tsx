
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
import { resolveStorageURL } from '@/utils/storage-url';

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
          loop: imageUrls.length > 1,
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full"
      >
        <CarouselContent>
          {imageUrls.map((path, index) => {
            const url = resolveStorageURL(path);
            return (
              <CarouselItem key={index}>
                <div className="relative aspect-video w-full">
                  <Image
                    src={url}
                    alt={`Album image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://picsum.photos/seed/12/800/450"; }}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
       {imageUrls.length > 1 && (
         <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
         </>
       )}
      </Carousel>
    </div>
  );
}
