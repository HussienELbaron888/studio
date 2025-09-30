
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id) || PlaceHolderImages[0];

export type Activity = {
  id: string; // Changed from number to string to match Firestore document ID
  title: { en: string; ar: string };
  type: 'Free' | 'Paid';
  image: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  description: { en: string; ar: string };
  schedule: { en: string; ar: string };
  time: string;
  sessions: number;
  price: number;
};

export type Trip = {
  id: number;
  title: { en: string; ar: string };
  destination: { en: string; ar: string };
  image: ReturnType<typeof getImage>;
};

export type SliderItem = {
  id: number;
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  image: ReturnType<typeof getImage>;
};

export type PhotoAlbum = {
  id: number;
  title: { en: string; ar: string };
  image: ReturnType<typeof getImage>;
  count: number;
};

export const sliderItems: SliderItem[] = [
  {
    id: 1,
    title: {
      en: 'Join Our Summer Festival',
      ar: 'انضم لمهرجان الصيف',
    },
    subtitle: {
      en: 'A week of fun, games, and community activities.',
      ar: 'أسبوع مليء بالمرح والألعاب والأنشطة المجتمعية.',
    },
    image: getImage('slider-1'),
  },
  {
    id: 2,
    title: {
      en: 'Adventure Awaits: Desert Safari',
      ar: 'المغامرة تناديك: رحلة سفاري صحراوية',
    },
    subtitle: {
      en: 'Experience the thrill of dune bashing and a night under the stars.',
      ar: 'جرب إثارة التطعيس وقضاء ليلة تحت النجوم.',
    },
    image: getImage('slider-2'),
  },
  {
    id: 3,
    title: {
      en: "Kids' Creative Corner",
      ar: 'ركن الإبداع للأطفال',
    },
    subtitle: {
      en: 'Unleash your childs creativity with our art and craft workshops.',
      ar: 'أطلق العنان لإبداع طفلك مع ورش عمل الفنون والحرف اليدوية.',
    },
    image: getImage('slider-3'),
  },
];

// This is now legacy data, the app will fetch from Firestore.
// It's kept for reference and for other parts of the app that might still use it (e.g., trips).
export const activities: Omit<Activity, 'id'>[] = [
  {
    title: { en: 'Beach Volleyball', ar: 'كرة الطائرة الشاطئية' },
    type: 'Free',
    image: getImage('activity-1'),
    description: { en: 'Join us for a fun game of beach volleyball.', ar: 'انضم إلينا في لعبة ممتعة لكرة الطائرة الشاطئية.' },
    schedule: { en: 'Sat, Sun', ar: 'السبت, الأحد' },
    time: '5:00 PM',
    sessions: 8,
    price: 0,
  },
  {
    title: { en: 'Mountain Hiking', ar: 'تسلق الجبال' },
    type: 'Paid',
    image: getImage('activity-2'),
    description: { en: 'Explore the scenic mountain trails.', ar: 'استكشف مسارات الجبال الخلابة.' },
    schedule: { en: 'Fri', ar: 'الجمعة' },
    time: '7:00 AM',
    sessions: 4,
    price: 150,
  },
  {
    title: { en: 'Pasta Making Class', ar: 'درس صنع الباستا' },
    type: 'Paid',
    image: getImage('activity-3'),
    description: { en: 'Learn to make authentic Italian pasta.', ar: 'تعلم صنع البasta الإيطالية الأصيلة.' },
    schedule: { en: 'Mon, Wed', ar: 'الإثنين, الأربعاء' },
    time: '6:00 PM',
    sessions: 6,
    price: 250,
  },
  {
    title: { en: 'Yoga in the Park', ar: 'يوجا في الحديقة' },
    type: 'Free',
    image: getImage('activity-4'),
    description: { en: 'Relax and rejuvenate with our outdoor yoga session.', ar: 'استرخِ وجدد شبابك في جلسة اليوجا الخارجية.' },
    schedule: { en: 'Tue, Thu', ar: 'الثلاثاء, الخميس' },
    time: '8:00 AM',
    sessions: 8,
    price: 0,
  },
];

export const trips: Trip[] = [
  {
    id: 1,
    title: { en: 'Historical City Tour', ar: 'جولة في المدينة التاريخية' },
    destination: { en: 'Athens, Greece', ar: 'أثينا، اليونان' },
    image: getImage('trip-1'),
  },
  {
    id: 2,
    title: { en: 'Lake Relaxation', ar: 'استرخاء على البحيرة' },
    destination: { en: 'Lake Como, Italy', ar: 'بحيرة كومو، إيطاليا' },
    image: getImage('trip-2'),
  },
  {
    id: 3,
    title: { en: 'Forest Camping Weekend', ar: 'تخييم في الغابة' },
    destination: { en: 'Black Forest, Germany', ar: 'الغابة السوداء، ألمانيا' },
    image: getImage('trip-3'),
  },
];

export const photoAlbums: PhotoAlbum[] = [
  {
    id: 1,
    title: { en: 'Sports Day 2023', ar: 'اليوم الرياضي 2023' },
    image: getImage('album-1'),
    count: 45,
  },
  {
    id: 2,
    title: { en: 'National Day Festivities', ar: 'احتفالات اليوم الوطني' },
    image: getImage('album-2'),
    count: 82,
  },
  {
    id: 3,
    title: { en: 'Annual Charity Run', ar: 'سباق الجري الخيري السنوي' },
    image: getImage('album-3'),
    count: 61,
  },
  {
    id: 4,
    title: { en: 'Community Art Expo', ar: 'معرض الفن المجتمعي' },
    image: getImage('album-4'),
    count: 33,
  },
];
