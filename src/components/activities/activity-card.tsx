
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import type { Activity } from '@/lib/placeholder-data';
import { SubscriptionForm } from './subscription-form';
import { Tag } from 'lucide-react';

export function ActivityCard({ activity, imageSizes }: { activity: Activity, imageSizes: string }) {
  const { language, content } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(activity.image?.imageUrl || null);

  useEffect(() => {
    let mounted = true;
    async function resolveUrl() {
      if (!activity.image?.imageUrl && activity.image_path) {
        try {
          const ref = storageRef(storage, activity.image_path);
          const url = await getDownloadURL(ref);
          if (mounted) {
            setResolvedUrl(url);
          }
        } catch (error) {
          console.error("Error resolving image URL:", error);
          if (mounted) {
            setResolvedUrl("https://placehold.co/600x400/EEE/31343C?text=Image+Error");
          }
        }
      }
    }
    resolveUrl();
    return () => { mounted = false; };
  }, [activity]);


  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      return;
    };

    const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where("activityId", "==", activity.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setIsSubscribed(!querySnapshot.empty);
    });

    return () => unsubscribe();
  }, [user, activity.id]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          {resolvedUrl && (
            <Image
              src={resolvedUrl}
              alt={activity.image?.description || 'Activity image'}
              fill
              className="object-cover"
              data-ai-hint={activity.image?.imageHint}
              sizes={imageSizes}
            />
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
          <h3 className="font-headline text-lg font-semibold mb-2">
            {activity.title[language]}
          </h3>
          <div className="flex-grow space-y-2 text-sm text-muted-foreground">
             {activity.price > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>{activity.price} {content.currency}</span>
              </div>
            )}
             <div className="flex items-center gap-2">
                <span className='font-semibold'>{activity.schedule[language]}</span>
                <span>{activity.time}</span>
            </div>
          </div>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={isSubscribed}>
                  {isSubscribed ? content.subscribedButton : content.subscribeButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{activity.title[language]}</DialogTitle>
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
