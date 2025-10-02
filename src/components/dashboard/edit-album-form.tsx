
"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Album } from "@/lib/types";
import { updateAlbum } from "@/utils/update-album";

type EditAlbumFormProps = {
  album: Album;
  setDialogOpen: (open: boolean) => void;
};

export function EditAlbumForm({ album, setDialogOpen }: EditAlbumFormProps) {
  const { toast } = useToast();
  const { content } = useLanguage();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [date, setDate] = useState("");
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (album) {
      setTitleAr(album.title.ar);
      setTitleEn(album.title.en);
      setDate(album.date);
      setExistingImageUrls(album.imageUrls || []);
      setPreviewUrls(album.imageUrls || []);
    }
  }, [album]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const totalImages = existingImageUrls.length + files.length;
      if (totalImages > 10) {
        toast({ title: "Error", description: "You can upload a maximum of 10 images in total.", variant: "destructive" });
        return;
      }
      setImageFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };
  
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const totalImages = previewUrls.length + files.length;
      if (totalImages > 10) {
        toast({ title: "Error", description: "You can upload a maximum of 10 images in total.", variant: "destructive" });
        return;
      }
      setImageFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index: number, url: string) => {
    // Check if it's an existing image or a new preview
    if (existingImageUrls.includes(url)) {
      setExistingImageUrls(prev => prev.filter(imgUrl => imgUrl !== url));
    } else {
      const fileIndex = previewUrls.indexOf(url) - existingImageUrls.length;
      if(fileIndex >= 0) {
        setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalImages = previewUrls.length;
     if (totalImages === 0) {
      toast({ title: "Error", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }
    if (totalImages > 10) {
      toast({ title: "Error", description: `You cannot have more than 10 images. You currently have ${totalImages}.`, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const values = {
      title_ar: titleAr, 
      title_en: titleEn,
      date: date,
    };
    
    try {
      await updateAlbum(album.id, values, existingImageUrls, imageFiles);
      toast({
        title: "Success",
        description: "Album updated successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to update album: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title-ar-edit">{content.albumTitleLabel} (العربية)</Label>
          <Input id="title-ar-edit" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en-edit">{content.albumTitleLabel} (English)</Label>
          <Input id="title-en-edit" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="date-edit">{content.albumDateLabel}</Label>
          <Input id="date-edit" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>

      <div className="space-y-2">
        <Label>{content.albumImagesLabel}</Label>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
            {previewUrls.map((url, index) => (
                <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden border">
                    <Image src={url} alt={`Preview ${index}`} fill style={{ objectFit: 'cover' }} />
                    <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                    onClick={() => removeImage(index, url)}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
          
        {previewUrls.length < 10 && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary",
              dragActive ? "border-primary bg-primary/10" : "border-input"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-500">
                <span className="font-semibold">إضافة صور</span>
              </p>
              <p className="text-xs text-gray-500">متبقي ({10 - previewUrls.length})</p>
            </div>
            <Input
              ref={fileInputRef}
              id="dropzone-file-edit"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              multiple
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          "حفظ التعديلات"
        )}
      </Button>
    </form>
  );
}
