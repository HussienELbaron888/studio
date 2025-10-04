"use client";

import { Users, LayoutGrid, Calendar, Star } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    icon: Users,
    value: '12,500+',
    labelKey: 'members',
  },
  {
    icon: LayoutGrid,
    value: '200+',
    labelKey: 'activities',
  },
  {
    icon: Calendar,
    value: '50+',
    labelKey: 'events',
  },
  {
    icon: Star,
    value: '80+',
    labelKey: 'talents',
  },
];

export function StatsSection() {
  const { content } = useLanguage();

  return (
    <section>
      <h2 className="mb-8 text-center font-headline text-3xl font-bold md:text-4xl">
        {content.statsTitle}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
        {stats.map((stat) => (
          <Card key={stat.labelKey} className="text-center">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <stat.icon className="h-10 w-10 text-primary" />
              <p className="mt-4 font-headline text-3xl font-bold">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground">
                {content[stat.labelKey as keyof typeof content]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
