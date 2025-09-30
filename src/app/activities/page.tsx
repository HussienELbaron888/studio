
"use client";

import { activities } from '@/lib/placeholder-data';
import { useLanguage } from '@/context/language-context';
import { ActivityCard } from '@/components/activities/activity-card';

export default function ActivitiesPage() {
  const { content } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navActivities}
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activities.map((activity) => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
            imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ))}
      </div>
    </div>
  );
}
