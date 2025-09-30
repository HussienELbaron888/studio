
"use client";

import { useLanguage } from '@/context/language-context';
import { ActivityCard } from '@/components/activities/activity-card';
import { useActivities } from '@/hooks/use-activities';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ActivitiesPage() {
  const { content } = useLanguage();
  const { activities, loading } = useActivities();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navActivities}
      </h1>
      {activities.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
        </div>
      ) : (
         <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No activities have been added yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
