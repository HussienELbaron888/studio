
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { Loader2 } from "lucide-react";
import type { Album } from "@/lib/types";

export default function GalleryPage() {
  const [items, setItems] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { content, language } = useLanguage();

  useEffect(() => {
    const run = async () => {
      const q = query(collection(db, "albums"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const rows: Album[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
       <h1 className="mb-8 font-headline text-3xl font-bold md:text-4xl">
        {content.navGallery}
      </h1>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !items.length ? (
        <div className="p-6 text-center text-muted-foreground">لا توجد ألبومات حالياً</div>
      ) : (
        <div className="space-y-12">
            {items.map((a) => (
                <section key={a.id} className="rounded-2xl shadow-lg border bg-card p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap border-b pb-4 mb-4">
                    <h2 className="font-headline text-xl sm:text-2xl font-bold text-primary">
                      {a.title?.[language as keyof typeof a.title] || a.title}
                    </h2>
                    {a.date && <div className="text-sm text-muted-foreground">{a.date}</div>}
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {a.imageUrls?.map((src, i) => (
                    <div key={i} className="relative w-full aspect-square overflow-hidden rounded-xl group">
                        <Image
                          src={src}
                          alt={`${a.title?.[language as keyof typeof a.title] || a.title} - ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    ))}
                </div>
                </section>
            ))}
        </div>
      )}
    </div>
  );
}
