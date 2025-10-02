
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

export type Album = {
  id: string;
  title: { en: string; ar: string };
  date: string; // YYYY-MM-DD
  imageUrls: string[];
  created_at?: any;
};

export type Slide = {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  buttonText: { en: string; ar: string };
  buttonHref: string;
  image_path: string;
  order: number;
  published: boolean;
  createdAt?: any;
};

export type Subscriber = {
  id: string;
  path: string;
  itemType: "activity" | "trip" | "event";
  itemTitle?: string;
  className?: string;
  studentName?: string;
  userEmail: string;
  userId: string;
  subscribedAt?: Date;
  phoneNumber?: string;
};
