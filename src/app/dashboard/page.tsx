"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useLanguage } from '@/context/language-context';
import { ManageActivities } from '@/components/dashboard/manage-activities';

export default function DashboardPage() {
  const { content } = useLanguage();

  const tabs = [
    { value: 'activities', label: content.manageActivities, component: <ManageActivities /> },
    { value: 'trips', label: content.manageTrips, component: <p className="p-4 text-muted-foreground">Manage Trips content here.</p> },
    { value: 'events', label: content.manageEvents, component: <p className="p-4 text-muted-foreground">Manage Events content here.</p> },
    { value: 'talents', label: content.manageTalents, component: <p className="p-4 text-muted-foreground">Manage Talents content here.</p> },
    { value: 'gallery', label: content.manageGallery, component: <p className="p-4 text-muted-foreground">Manage Gallery content here.</p> },
    { value: 'slider', label: content.manageSlider, component: <p className="p-4 text-muted-foreground">Manage Slider content here.</p> },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.dashboardTitle}
      </h1>
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              {tab.component}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
