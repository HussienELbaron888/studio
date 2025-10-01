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
