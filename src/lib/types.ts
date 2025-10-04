
import type { Timestamp } from 'firebase/firestore';

export type Activity = {
  id: string; // Firestore document ID
  title: { en: string; ar: string };
  type: 'Free' | 'Paid';
  description?: { en: string; ar: string };
  schedule?: { en: string; ar: string };
  time?: string;
  sessions?: number;
  price?: number;
  image?: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  } | null;
  image_path?: string | null;
  created_at?: any;
};

export type Trip = {
  id: string; // Firestore document ID
  title: { en: string; ar: string };
  destination: { en: string; ar: string };
  schedule: { en: string; ar: string };
  price: number;
  image_path?: string | null;
  created_at?: any;
};

export type Event = {
  id: string; // Firestore document ID
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  location: { en: string; ar: string };
  price?: number;
  image_path?: string | null;
  created_at?: any;
};

export type Talent = {
  id: string; // Firestore document ID
  name: { en: string; ar: string };
  stage: { en: string; ar: string };
  details: { en: string; ar: string };
  image_path?: string | null;
  created_at?: any;
};

export interface Subscription {
  id: string;
  userId: string;
  itemTitle: string;
  itemType: 'activity' | 'trip' | 'event';
  subscribedAt: Timestamp;
}
