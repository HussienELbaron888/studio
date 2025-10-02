
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Talent } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { TalentCard } from '@/components/talents/talent-card';
import { Skeleton } from '@/components/ui/skeleton';

function TalentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[224px] w-full rounded-lg" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TalentsPage() {
  const { content } = useLanguage();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const talentsQuery = query(collection(db, 'talents'), orderBy('created_at', 'desc'));
        const snapshot = await getDocs(talentsQuery);
        const talentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Talent));
        setTalents(talentsData);
      } catch (error) {
        console.error("Error fetching talents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTalents();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navTalents}
      </h1>
      {loading ? (
        <TalentGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {talents.map((talent) => (
            <TalentCard 
              key={talent.id} 
              talent={talent} 
              imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
