"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { activities } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';

export default function ActivitiesPage() {
  const { language, content } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navActivities}
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-56 w-full">
                <Image
                  src={activity.image.imageUrl}
                  alt={activity.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={activity.image.imageHint}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <Badge
                  className={`absolute top-3 ${
                    language === 'ar' ? 'left-3' : 'right-3'
                  } ${
                    activity.type === 'Paid'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary'
                  }`}
                >
                  {activity.type === 'Paid' ? content.paid : content.free}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-headline text-lg font-semibold">
                  {activity.title[language]}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
