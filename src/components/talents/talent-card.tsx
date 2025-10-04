
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import type { Talent } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { User, Award, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL } from '@/utils/storage-url';

type TalentCardProps = {
  talent: Talent;
  imageSizes: string;
};

export function TalentCard({ talent, imageSizes }: TalentCardProps) {
  const { language } = useLanguage();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsImageLoading(true);
    
    const fetchUrl = async () => {
      try {
        const url = await resolveStorageURL(talent.image_path);
        if (alive) {
          setResolvedUrl(url);
        }
      } catch (e) {
        console.error("img resolve failed:", e);
        if (alive) {
          setResolvedUrl(null);
        }
      } finally {
        if (alive) {
          setIsImageLoading(false);
        }
      }
    };
    
    fetchUrl();

    return () => { alive = false; };
  }, [talent.image_path]);

  const name = talent.name[language as keyof typeof talent.name];
  const stage = talent.stage[language as keyof typeof talent.stage];
  const details = talent.details[language as keyof typeof talent.details];

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          {isImageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : resolvedUrl ? (
            <Image
              src={resolvedUrl}
              alt={name}
              fill
              className="object-cover"
              sizes={imageSizes}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-headline text-lg font-semibold flex items-center">
            <User className={cn("h-5 w-5", language === 'ar' ? "ml-2" : "mr-2")} />
            {name}
          </h3>

          <div className="my-3 space-y-2 text-sm text-muted-foreground">
            {stage && (
              <div className="flex items-center">
                <Award className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{stage}</span>
              </div>
            )}
             {details && (
              <p className="flex items-start pt-2">
                <Info className={cn("h-4 w-4 shrink-0 mt-1", language === 'ar' ? "ml-2" : "mr-2")} />
                <span className="line-clamp-3">{details}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
