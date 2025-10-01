
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EventsCard() {
  const { content, language } = useLanguage();
  const image = PlaceHolderImages.find((img) => img.id === 'events-bg')!;

  return (
    <Card className="relative flex min-h-[350px] w-full flex-col justify-end overflow-hidden p-0 md:min-h-[400px]">
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        data-ai-hint={image.imageHint}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <CardContent className="relative z-10 p-6 text-white">
        <h3 className="font-headline text-2xl font-bold md:text-3xl">
          {content.eventsTitle}
        </h3>
        <p className="mt-2 max-w-md text-sm md:text-base">
          {content.eventsDescription}
        </p>
        <Button
          size="lg"
          className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <span>{content.eventsButton}</span>
          <ArrowRight
            className={cn('h-5 w-5', language === 'ar' ? 'mr-2' : 'ml-2')}
          />
        </Button>
      </CardContent>
    </Card>
  );
}
