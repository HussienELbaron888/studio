
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import type { Activity } from '@/lib/types';
import { SubscriptionForm } from './subscription-form';
import { CalendarDays, Clock, Repeat, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveStorageURL } from '@/utils/storage-url';


type ActivityCardProps = {
  activity: Activity;
  imageSizes: string;
};

export function ActivityCard({ activity, imageSizes }: ActivityCardProps) {
  const { language, content } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const resolvedUrl = resolveStorageURL(activity.image_path);

  useState(() => {
    const uid = user?.uid;
    if (!uid) {
      setIsSubscribed(false);
      return;
    };

    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where("activityId", "==", activity.id),
      where("userId", "==", uid),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setIsSubscribed(!querySnapshot.empty);
    }, (error) => {
      if (error.code !== "permission-denied") {
        console.error("Subscription check failed:", error);
      }
    });

    return () => unsubscribe();
  });

  const schedule = activity.schedule?.[language as keyof typeof activity.schedule];
  const time = activity.time;
  const sessions = activity.sessions;
  const price = activity.price;
  const description = activity.description?.[language as keyof typeof activity.description];

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          {resolvedUrl ? (
            <Image
              src={resolvedUrl}
              alt={activity.image?.description || activity.title.en}
              fill
              className="object-cover"
              sizes={imageSizes}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/300'; }}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No Image</span>
            </div>
          )}
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
          <h3 className="font-headline text-lg font-semibold flex-grow min-h-[3rem]">
            {activity.title[language as keyof typeof activity.title]}
          </h3>

          {description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {description}
            </p>
          )}

          <div className="my-3 space-y-2 text-sm text-muted-foreground">
            {schedule && (
              <div className="flex items-center">
                <CalendarDays className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{schedule}</span>
              </div>
            )}
            {time && (
              <div className="flex items-center">
                <Clock className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{time}</span>
              </div>
            )}
             {sessions && sessions > 0 && (
              <div className="flex items-center">
                <Repeat className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{language === 'ar' ? `${sessions} حصص` : `${sessions} Sessions`}</span>
              </div>
            )}
             {activity.type === 'Paid' && price && price > 0 && (
              <div className="flex items-center font-semibold text-accent-foreground">
                <DollarSign className={cn("h-4 w-4", language === 'ar' ? "ml-2" : "mr-2")} />
                <span>{language === 'ar' ? `${price} ريال` : `${price} SAR`}</span>
              </div>
            )}
          </div>

          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-auto" disabled={isSubscribed}>
                  {isSubscribed ? content.subscribedButton : content.subscribeButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" aria-describedby="activity-sub-desc">
                <DialogHeader>
                  <DialogTitle>{activity.title[language as keyof typeof activity.title]}</DialogTitle>
                   <DialogDescription id="activity-sub-desc" className="sr-only">
                    نموذج الاشتراك في النشاط
                  </DialogDescription>
                </DialogHeader>
                <SubscriptionForm 
                  setDialogOpen={setDialogOpen} 
                  activityTitle={activity.title.en} // Pass english title for consistency in DB
                  activityId={activity.id}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
