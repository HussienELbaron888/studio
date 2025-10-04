
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
import { useLanguage } from '@/context/language-context';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function TalentsCard() {
  const { content, language } = useLanguage();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fallbackImageUrl = "https://images.unsplash.com/photo-1575426158836-0be172e108ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzdGFnZSUyMHNwb3RsaWdodHxlbnwwfHx8fDE3NTkxNDY5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080";
  const fallbackImageAlt = "A spotlight shining on a stage";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    const fetchLatestTalentImage = async () => {
      let finalUrl: string | null = null;
      let finalAlt = fallbackImageAlt;

      try {
        const talentsQuery = query(collection(db, 'talents'), orderBy('created_at', 'desc'), limit(1));
        const snapshot = await getDocs(talentsQuery);
        
        if (!snapshot.empty) {
          const latestTalent = snapshot.docs[0].data() as Talent;
          if (latestTalent.image_path) {
            const resolved = await resolveStorageURL(latestTalent.image_path);
            if (resolved) {
                finalUrl = resolved;
                finalAlt = latestTalent.name.en;
            }
          }
        }
        
        if (alive) {
          setImageUrl(finalUrl || fallbackImageUrl);
          setImageAlt(finalAlt);
        }

      } catch (error: any) {
        console.debug("Error fetching latest talent:", error?.code || error?.message);
        if (alive) {
          // On error, use fallback
          setImageUrl(fallbackImageUrl);
          setImageAlt(fallbackImageAlt);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchLatestTalentImage();

    return () => { alive = false; }
  }, []);

  return (
    <Card className="relative flex min-h-[350px] w-full flex-col justify-end overflow-hidden p-0 md:min-h-[400px] group">
      {loading ? (
        <Skeleton className="absolute inset-0" />
      ) : (
        imageUrl && (
            <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
        )
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
