import { HeroSlider } from '@/components/home/hero-slider';
import { StatsSection } from '@/components/home/stats-section';
import { ActivitiesCarousel } from '@/components/home/activities-carousel';
import { TripsCarousel } from '@/components/home/trips-carousel';
import { EventsCard } from '@/components/home/events-card';
import { TalentsCard } from '@/components/home/talents-card';

export default function Home() {
  return (
    <div className="flex-grow">
      <div className="space-y-12 md:space-y-16 lg:space-y-20 pb-16">
        <HeroSlider />
        <div className="container mx-auto px-4">
          <div className="space-y-12 md:space-y-16 lg:space-y-20">
            <StatsSection />
            <ActivitiesCarousel />
            <TripsCarousel />
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              <EventsCard />
              <TalentsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
