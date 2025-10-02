
"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { saveAlbum } from "@/utils/save-album";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

type AddAlbumFormProps = {
  setDialogOpen: (open: boolean) => void;
};

export function AddAlbumForm({ setDialogOpen }: AddAlbumFormProps) {
  const { toast } = useToast();
  const { content } = useLanguage();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [date, setDate] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      if (files.length > 10) {
        toast({ title: "Error", description: "You can upload a maximum of 10 images.", variant: "destructive" });
        return;
      }
      setImageFiles(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    }
  };
  
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) {
       if (files.length > 10) {
        toast({ title: "Error", description: "You can upload a maximum of 10 images.", variant: "destructive" });
        return;
      }
      setImageFiles(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
       if(fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
    }
  };

  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newPreviewUrls = [...previewUrls];
    newImageFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setImageFiles(newImageFiles);
    setPreviewUrls(newPreviewUrls);

    // This is tricky; we need a DataTransfer object to update input.files
    const dt = new DataTransfer();
    newImageFiles.forEach(file => dt.items.add(file));
    if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast({ title: "Error", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }
     if (imageFiles.length > 10) {
      toast({ title: "Error", description: "You cannot upload more than 10 images.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const values = {
      title_ar: titleAr, 
      title_en: titleEn,
      date: date
    };
    
    try {
      await saveAlbum(values, imageFiles);
      toast({
        title: "Success",
        description: "Album added successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to add album: ${error.message}`,
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
          <Label htmlFor="title-ar">{content.albumTitleLabel} (العربية)</Label>
          <Input id="title-ar" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en">{content.albumTitleLabel} (English)</Label>
          <Input id="title-en" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>

       <div className="space-y-2">
          <Label htmlFor="date">{content.albumDateLabel}</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>

      <div className="space-y-2">
        <Label>{content.albumImagesLabel}</Label>
        {previewUrls.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden border">
                        <Image src={url} alt={`Preview ${index}`} fill style={{ objectFit: 'cover' }} />
                        <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                        onClick={() => removeImage(index)}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary",
              dragActive ? "border-primary bg-primary/10" : "border-input"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">انقر للاختيار</span> أو اسحب وأفلت الصور هنا
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, or WEBP (حتى 10 صور)</p>
            </div>
            <Input
              ref={fileInputRef}
              id="dropzone-file"
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
          "حفظ الألبوم"
        )}
      </Button>
    </form>
  );
}
