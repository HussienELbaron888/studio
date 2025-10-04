
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { resolveStorageURL } from '@/utils/storage-url';
import type { Talent } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function TalentsCard() {
  const { content, language } = useLanguage();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackImage = PlaceHolderImages.find((img) => img.id === 'talents-bg')!;

  useEffect(() => {
    const fetchLatestTalent = async () => {
      setLoading(true);
      try {
        const talentsQuery = query(collection(db, 'talents'), orderBy('created_at', 'desc'), limit(1));
        const snapshot = await getDocs(talentsQuery);
        
        if (!snapshot.empty) {
          const latestTalent = snapshot.docs[0].data() as Talent;
          setTalent(latestTalent);
          if (latestTalent.image_path) {
            const url = await resolveStorageURL(latestTalent.image_path);
            setResolvedImageUrl(url);
          }
        }
      } catch (error) {
        console.debug("Error fetching latest talent, using fallback.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTalent();
  }, []);

  const finalImageUrl = resolvedImageUrl || fallbackImage.imageUrl;
  const imageAlt = talent?.name.en || fallbackImage.description;
  const imageHint = talent ? 'student portrait' : fallbackImage.imageHint;

  return (
    <Card className="relative flex min-h-[350px] w-full flex-col justify-end overflow-hidden p-0 md:min-h-[400px]">
      {loading ? (
        <Skeleton className="absolute inset-0" />
      ) : (
        <Image
            src={finalImageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={imageHint}
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImage.imageUrl; }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <CardContent className="relative z-10 p-6 text-white">
        <h3 className="font-headline text-2xl font-bold md:text-3xl">
          {content.talentsTitle}
        </h3>
        <p className="mt-2 max-w-md text-sm md:text-base">
          {content.talentsDescription}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/talents">
            <span>{content.talentsButton}</span>
            <ArrowRight
              className={cn('h-5 w-5', language === 'ar' ? 'mr-2' : 'ml-2')}
            />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
