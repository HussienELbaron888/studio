"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { photoAlbums } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';
import { Camera } from 'lucide-react';

export default function GalleryPage() {
  const { language, content } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navGallery}
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photoAlbums.map((album) => (
          <Card key={album.id} className="group overflow-hidden">
            <CardContent className="relative h-64 w-full p-0">
              <Image
                src={album.image.imageUrl}
                alt={album.image.description}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={album.image.imageHint}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </CardContent>
            <CardFooter className="relative z-10 -mt-14 flex justify-between bg-card p-4">
              <h3 className="font-headline text-md font-semibold">
                {album.title[language]}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Camera className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                <span>{album.count}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
