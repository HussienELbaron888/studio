
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { resolveStorageURL } from '@/utils/storage-url';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function EventsCard() {
  const { content, language } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackImage = PlaceHolderImages.find((img) => img.id === 'events-bg')!;

  useEffect(() => {
    const fetchLatestEvent = async () => {
      setLoading(true);
      try {
        const eventsQuery = query(collection(db, 'events'), orderBy('created_at', 'desc'), limit(1));
        const snapshot = await getDocs(eventsQuery);
        
        if (!snapshot.empty) {
          const latestEvent = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Event;
          setEvent(latestEvent);
          const url = resolveStorageURL(latestEvent.image_path);
          setImageUrl(url);
        } else {
          // No events found, use fallback
          setImageUrl(fallbackImage.imageUrl);
        }
      } catch (error) {
        console.debug("Error fetching latest event, using fallback.", error);
        setImageUrl(fallbackImage.imageUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEvent();
  }, [fallbackImage.imageUrl]);

  return (
    <Card className="relative flex min-h-[350px] w-full flex-col justify-end overflow-hidden p-0 md:min-h-[400px]">
      {loading ? (
        <Skeleton className="absolute inset-0" />
      ) : (
        <Image
          src={imageUrl || fallbackImage.imageUrl}
          alt={event?.title.en || fallbackImage.description}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={event ? 'event concert' : fallbackImage.imageHint}
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImage.imageUrl; }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <CardContent className="relative z-10 p-6 text-white">
        <h3 className="font-headline text-2xl font-bold md:text-3xl">
          {content.eventsTitle}
        </h3>
        <p className="mt-2 max-w-md text-sm md:text-base">
          {content.eventsDescription}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/events">
            <span>{content.eventsButton}</span>
            <ArrowRight
              className={cn('h-5 w-5', language === 'ar' ? 'mr-2' : 'ml-2')}
            />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
