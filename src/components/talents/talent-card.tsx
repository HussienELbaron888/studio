
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import type { Talent } from '@/lib/types';
import { User, Award, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL } from '@/utils/storage-url';

type TalentCardProps = {
  talent: Talent;
  imageSizes: string;
};

const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/placeholder-talent/400/300';

export function TalentCard({ talent, imageSizes }: TalentCardProps) {
  const { language } = useLanguage();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (talent.image_path) {
      resolveStorageURL(talent.image_path).then(url => {
        if (isMounted && url) {
          setImageUrl(url);
        }
      });
    }
    return () => { isMounted = false; };
  }, [talent.image_path]);


  const name = talent.name[language as keyof typeof talent.name];
  const stage = talent.stage[language as keyof typeof talent.stage];
  const details = talent.details[language as keyof typeof talent.details];
  
  const finalImageUrl = imageUrl || FALLBACK_IMAGE_URL;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
           <Image
              src={finalImageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes={imageSizes}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_URL; }}
            />
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
