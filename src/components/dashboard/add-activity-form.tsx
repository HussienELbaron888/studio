
"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImageAndSaveActivity, ActivityValues } from "@/utils/robust-upload";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AddActivityFormProps = {
  setDialogOpen: (open: boolean) => void;
};

export function AddActivityForm({ setDialogOpen }: AddActivityFormProps) {
  const { content } = useLanguage();
  const { toast } = useToast();

  // States for each form field
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [scheduleAr, setScheduleAr] = useState("");
  const [scheduleEn, setScheduleEn] = useState("");
  const [time, setTime] = useState("");
  const [sessions, setSessions] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [type, setType] = useState<"Paid" | "Free">("Free");
  
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

    const values: ActivityValues = {
      title_ar: titleAr, title_en: titleEn,
      description_ar: descriptionAr, description_en: descriptionEn,
      schedule_ar: scheduleAr, schedule_en: scheduleEn,
      time: time,
      sessions: Number(sessions) || 0,
      price: Number(price) || 0,
      type: type,
    };
    
    try {
      await uploadImageAndSaveActivity(values, imageFile);
      toast({
        title: "Success",
        description: "Activity added successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to add activity: ${error.message}`,
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
          <Label htmlFor="title-ar">عنوان النشاط (العربية)</Label>
          <Input id="title-ar" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en">Activity Title (English)</Label>
          <Input id="title-en" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-ar">الوصف (العربية)</Label>
        <Textarea id="description-ar" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-en">Description (English)</Label>
        <Textarea id="description-en" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="schedule-ar">المواعيد (العربية)</Label>
          <Input id="schedule-ar" placeholder="مثال: الأحد والثلاثاء" value={scheduleAr} onChange={e => setScheduleAr(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-en">Schedule (English)</Label>
          <Input id="schedule-en" placeholder="e.g., Sunday & Tuesday" value={scheduleEn} onChange={e => setScheduleEn(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time">الوقت</Label>
          <Input id="time" placeholder="4:00 PM - 5:00 PM" value={time} onChange={e => setTime(e.target.value)} />
        </div>
         <div className="space-y-2">
          <Label htmlFor="sessions">عدد الحصص</Label>
          <Input id="sessions" type="number" value={sessions} onChange={e => setSessions(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>النوع</Label>
        <RadioGroup value={type} onValueChange={(value: "Free" | "Paid") => setType(value)} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Free" id="type-free" />
            <Label htmlFor="type-free">مجاني</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Paid" id="type-paid" />
            <Label htmlFor="type-paid">مدفوع</Label>
          </div>
        </RadioGroup>
      </div>
      {type === 'Paid' && (
        <div className="space-y-2">
          <Label htmlFor="price">السعر (بالريال)</Label>
          <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      )}

      <div className="space-y-2">
        <Label>إدراج صورة</Label>
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <Image src={previewUrl} alt="Preview" layout="fill" objectFit="cover" />
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
          "حفظ النشاط"
        )}
      </Button>
    </form>
  );
}

