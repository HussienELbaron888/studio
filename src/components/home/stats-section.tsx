
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Star, Plane, Calendar, CreditCard, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';

const getStatsFn = httpsCallable(functions, 'getStats');

const StatCard = ({ icon: Icon, label, value, color, isLoading }: { icon: React.ElementType, label: string, value: number, color: string, isLoading: boolean }) => {
  const bgColor = `bg-${color}-100`;
  const textColor = `text-${color}-600`;
  const ringColor = `ring-${color}-500/20`;

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardContent className="flex items-center justify-between p-0">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 overflow-hidden relative group", ringColor, "hover:ring-4 transition-shadow duration-300")}>
       <div className={cn("absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150", bgColor)}></div>
      <CardContent className="flex items-center justify-between p-0 relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-headline text-3xl font-bold text-foreground">
            {value}
          </p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", bgColor, textColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
};


export function StatsSection() {
  const { content } = useLanguage();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result: any = await getStatsFn({});
        if (result.data.ok) {
           setStatsData(result.data.data);
        } else {
            throw new Error(result.data.error || "Failed to fetch stats");
        }
      } catch (error: any) {
        console.error("Error fetching stats:", error);
         toast({
          title: "Error fetching stats",
          description: error.message,
          variant: "destructive",
        });
        // Set to zero on error to avoid breaking the UI
        setStatsData({
          subscriptions: 0,
          paidActivities: 0,
          freeActivities: 0,
          events: 0,
          trips: 0,
          talents: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  const stats = [
    { key: 'subscriptions', label: content.totalSubscriptions, icon: Users, color: 'blue' },
    { key: 'paidActivities', label: content.paidActivities, icon: CreditCard, color: 'purple' },
    { key: 'freeActivities', label: content.freeActivities, icon: Gift, color: 'green' },
    { key: 'events', label: content.events, icon: Calendar, color: 'orange' },
    { key: 'trips', label: content.trips, icon: Plane, color: 'red' },
    { key: 'talents', label: content.talents, icon: Star, color: 'yellow' },
  ];
  
  // To get the colors in tailwind, we need to list them here so they are not purged.
  // bg-blue-100 text-blue-600 ring-blue-500/20
  // bg-purple-100 text-purple-600 ring-purple-500/20
  // bg-green-100 text-green-600 ring-green-500/20
  // bg-orange-100 text-orange-600 ring-orange-500/20
  // bg-red-100 text-red-600 ring-red-500/20
  // bg-yellow-100 text-yellow-600 ring-yellow-500/20

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="font-headline text-3xl font-bold md:text-4xl">
          {content.statsTitle}
        </h2>
         <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{content.statsSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={statsData ? statsData[stat.key] : 0}
            icon={stat.icon}
            color={stat.color}
            isLoading={loading}
          />
        ))}
      </div>
    </section>
  );
}

    