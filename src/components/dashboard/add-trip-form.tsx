
"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { saveTrip, TripValues } from "@/utils/saveTrip";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AddTripFormProps = {
  setDialogOpen: (open: boolean) => void;
};

export function AddTripForm({ setDialogOpen }: AddTripFormProps) {
  const { toast } = useToast();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [destinationAr, setDestinationAr] = useState("");
  const [destinationEn, setDestinationEn] = useState("");
  const [scheduleAr, setScheduleAr] = useState("");
  const [scheduleEn, setScheduleEn] = useState("");
  const [price, setPrice] = useState<number | "">("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const values: TripValues = {
      title_ar: titleAr, title_en: titleEn,
      destination_ar: destinationAr, destination_en: destinationEn,
      schedule_ar: scheduleAr, schedule_en: scheduleEn,
      price: Number(price) || 0,
    };
    
    try {
      await saveTrip(values, imageFile);
      toast({
        title: "Success",
        description: "Trip added successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to add trip: ${error.message}`,
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
          <Label htmlFor="title-ar">{content.tripTitleLabel} (العربية)</Label>
          <Input id="title-ar" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en">Trip Title (English)</Label>
          <Input id="title-en" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destination-ar">{content.tripDestinationLabel} (العربية)</Label>
          <Input id="destination-ar" value={destinationAr} onChange={e => setDestinationAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination-en">Destination (English)</Label>
          <Input id="destination-en" value={destinationEn} onChange={e => setDestinationEn(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="schedule-ar">{content.tripScheduleLabel} (العربية)</Label>
          <Input id="schedule-ar" placeholder="مثال: كل يوم سبت" value={scheduleAr} onChange={e => setScheduleAr(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-en">Schedule (English)</Label>
          <Input id="schedule-en" placeholder="e.g., Every Saturday" value={scheduleEn} onChange={e => setScheduleEn(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">{content.priceLabel}</Label>
        <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>

      <div className="space-y-2">
        <Label>إدراج صورة</Label>
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
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
              id="dropzone-file"
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
          "حفظ الرحلة"
        )}
      </Button>
    </form>
  );
}
