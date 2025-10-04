
"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { EventValues, updateEvent } from "@/utils/updateEvent";
import { resolveStorageURL } from "@/utils/storage-url";
import { useLanguage } from "@/context/language-context";


type EditEventFormProps = {
  event: Event;
  setDialogOpen: (open: boolean) => void;
};

export function EditEventForm({ event, setDialogOpen }: EditEventFormProps) {
  const { toast } = useToast();
  const { content } = useLanguage();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [locationAr, setLocationAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [price, setPrice] = useState<number | "">("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setTitleAr(event.title.ar);
      setTitleEn(event.title.en);
      setDescriptionAr(event.description?.ar || "");
      setDescriptionEn(event.description?.en || "");
      setLocationAr(event.location?.ar || "");
      setLocationEn(event.location?.en || "");
      setPrice(event.price || "");
      
      if (event.image_path) {
        setPreviewUrl(resolveStorageURL(event.image_path));
      }
    }
  }, [event]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
       if(fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const values: EventValues = {
      title_ar: titleAr, title_en: titleEn,
      description_ar: descriptionAr, description_en: descriptionEn,
      location_ar: locationAr, location_en: locationEn,
      price: Number(price) || 0,
    };
    
    try {
      await updateEvent(event.id, values, imageFile, event.image_path);
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
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
          <Label htmlFor="title-ar-edit">{content.eventTitleLabel} (العربية)</Label>
          <Input id="title-ar-edit" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en-edit">Event Title (English)</Label>
          <Input id="title-en-edit" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-ar-edit">{content.eventDescriptionLabel} (العربية)</Label>
        <Textarea id="description-ar-edit" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-en-edit">Description (English)</Label>
        <Textarea id="description-en-edit" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location-ar-edit">{content.eventLocationLabel} (العربية)</Label>
          <Input id="location-ar-edit" value={locationAr} onChange={e => setLocationAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-en-edit">Location (English)</Label>
          <Input id="location-en-edit" value={locationEn} onChange={e => setLocationEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
          <Label htmlFor="price-edit">{content.priceLabel}</Label>
          <Input id="price-edit" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>

      <div className="space-y-2">
        <Label>إدراج صورة</Label>
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://picsum.photos/seed/7/600/400"; }} />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
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
                <span className="font-semibold">انقر للاختيار</span> أو اسحب وأفلت الصورة هنا
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
            </div>
            <Input
              ref={fileInputRef}
              id="dropzone-file-edit"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
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
