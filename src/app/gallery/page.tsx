
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { Loader2, ImageIcon } from "lucide-react";
import type { Album } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlbumViewer } from "@/components/gallery/album-viewer";

function AlbumCard({ album }: { album: Album }) {
    const { language } = useLanguage();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer group">
                   <CardHeader className="p-0">
                     <div className="relative w-full aspect-video">
                        {album.imageUrls && album.imageUrls.length > 0 ? (
                            <Image
                                src={album.imageUrls[0]}
                                alt={album.title?.[language as keyof typeof album.title] || ''}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        ) : (
                            <div className="bg-muted flex items-center justify-center h-full">
                                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                            </div>
                        )}
                     </div>
                   </CardHeader>
                   <CardContent className="p-4">
                        <CardTitle className="text-lg truncate">{album.title?.[language as keyof typeof album.title] || ''}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{album.date}</p>
                   </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0" aria-describedby={`album-dialog-${album.id}`}>
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>{album.title?.[language as keyof typeof album.title] || ''}</DialogTitle>
                    <p id={`album-dialog-${album.id}`} className="sr-only">Image viewer for album {album.title.en}</p>
                </DialogHeader>
                <div className="p-4 md:p-6">
                   <AlbumViewer imageUrls={album.imageUrls} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function GalleryPage() {
  const [items, setItems] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { content } = useLanguage();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((album) => (
                <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      )}
    </div>
  );
}
