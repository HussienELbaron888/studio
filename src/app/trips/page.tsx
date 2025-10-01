"use client";

import { useLanguage } from '@/context/language-context';

export default function TripsPage() {
  const { content } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navTrips}
      </h1>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Trips page content will go here.</p>
      </div>
    </div>
  );
}
