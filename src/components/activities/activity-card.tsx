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
import type { Activity } from '@/lib/types';
import { SubscriptionForm } from './subscription-form';
import { Skeleton } from '../ui/skeleton';

type ActivityCardProps = {
  activity: Activity;
  imageSizes: string;
};

export function ActivityCard({ activity, imageSizes }: ActivityCardProps) {
  const { language, content } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(activity.image?.imageUrl || null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function resolveUrl() {
      setIsImageLoading(true);
      if (activity.image?.imageUrl) {
        setResolvedUrl(activity.image.imageUrl);
        setIsImageLoading(false);
        return;
      }
      
      if (activity.image_path) {
        try {
          const url = await getDownloadURL(storageRef(storage, activity.image_path));
          if (mounted) {
            setResolvedUrl(url);
          }
        } catch (e) {
          console.error("Error resolving image URL:", e);
          if (mounted) {
            setResolvedUrl(null); // Set to null on error to hide image
          }
        } finally {
           if (mounted) {
            setIsImageLoading(false);
          }
        }
      } else {
        setIsImageLoading(false);
      }
    }

    resolveUrl();
    
    return () => { mounted = false; };
  }, [activity.image_path, activity.image?.imageUrl]);

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
          {isImageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : resolvedUrl ? (
            <Image
              src={resolvedUrl}
              alt={activity.image?.description || activity.title.en}
              fill
              className="object-cover"
              data-ai-hint={activity.image?.imageHint}
              sizes={imageSizes}
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
          <h3 className="font-headline text-lg font-semibold flex-grow">
            {activity.title[language as keyof typeof activity.title]}
          </h3>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={isSubscribed}>
                  {isSubscribed ? content.subscribedButton : content.subscribeButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{activity.title[language as keyof typeof activity.title]}</DialogTitle>
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
