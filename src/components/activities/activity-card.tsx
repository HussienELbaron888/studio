
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import type { Activity } from '@/lib/placeholder-data';
import { SubscriptionForm } from './subscription-form';

type ActivityCardProps = {
  activity: Activity;
  imageSizes: string;
};

export function ActivityCard({ activity, imageSizes }: ActivityCardProps) {
  const { language, content } = useLanguage();
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          <Image
            src={activity.image.imageUrl}
            alt={activity.image.description}
            fill
            className="object-cover"
            data-ai-hint={activity.image.imageHint}
            sizes={imageSizes}
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
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-headline text-lg font-semibold flex-grow">
            {activity.title[language]}
          </h3>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">{content.subscribeButton}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{activity.title[language]}</DialogTitle>
              </DialogHeader>
              <SubscriptionForm setDialogOpen={setDialogOpen} activityTitle={activity.title[language]} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
