
"use client";

import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

type AddActivityFormProps = {
  setDialogOpen: (open: boolean) => void;
};

export function AddActivityForm({ setDialogOpen }: AddActivityFormProps) {
  const { content } = useLanguage();
  const { toast } = useToast();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [scheduleAr, setScheduleAr] = useState("");
  const [scheduleEn, setScheduleEn] = useState("");
  const [time, setTime] = useState("");
  const [sessions, setSessions] = useState<number | string>(1);
  const [price, setPrice] = useState<number | string>(0);
  const [type, setType] = useState<"Free" | "Paid">("Free");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };
  
  const resetForm = () => {
    setTitleAr("");
    setTitleEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    setScheduleAr("");
    setScheduleEn("");
    setTime("");
    setSessions(1);
    setPrice(0);
    setType("Free");
    setImageFile(null);
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Prepare DocRef to get a unique ID
      const activityRef = doc(collection(db, "activities"));
      const activityId = activityRef.id;

      let imagePath: string | null = null;
      
      // 2. Upload image if it exists
      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        imagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
        const storageReference = ref(storage, imagePath);

        await uploadBytes(storageReference, imageFile, {
          contentType: imageFile.type || "application/octet-stream",
        });
      }

      // 3. Save the document to Firestore
      await setDoc(activityRef, {
        title: { en: titleEn, ar: titleAr },
        description: { en: descriptionEn, ar: descriptionAr },
        schedule: { en: scheduleEn, ar: scheduleAr },
        time: time,
        sessions: Number(sessions),
        price: Number(price),
        type: type,
        image: imageFile ? {
            id: `custom-${activityId}`,
            description: descriptionEn,
            imageUrl: "", // Left empty, card will resolve it
            imageHint: "custom activity"
        } : null,
        image_path: imagePath,
        created_at: serverTimestamp(),
      });

      toast({
        title: "تم بنجاح!",
        description: "تمت إضافة النشاط بنجاح.",
      });
      
      resetForm();
      setDialogOpen(false);

    } catch (error: any) {
      console.error("Failed to add activity:", error);
      toast({
        title: "خطأ في الإضافة",
        description: `فشلت العملية. الخطأ: ${error.code || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_ar">عنوان النشاط (بالعربية)</Label>
          <Input id="title_ar" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">Activity Title (English)</Label>
          <Input id="title_en" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description_ar">الوصف (بالعربية)</Label>
        <Textarea id="description_ar" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description_en">Description (English)</Label>
        <Textarea id="description_en" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule_ar">{content.scheduleLabel} (بالعربية)</Label>
          <Input id="schedule_ar" value={scheduleAr} onChange={e => setScheduleAr(e.target.value)} placeholder="الأحد، الثلاثاء" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule_en">{content.scheduleLabel} (English)</Label>
          <Input id="schedule_en" value={scheduleEn} onChange={e => setScheduleEn(e.target.value)} placeholder="Sun, Tue" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time">{content.timeLabel}</Label>
          <Input id="time" value={time} onChange={e => setTime(e.target.value)} placeholder="4:00 PM - 5:00 PM" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessions">{content.sessionsLabel}</Label>
          <Input id="sessions" type="number" value={sessions} onChange={e => setSessions(e.target.value)} required />
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{content.priceLabel}</Label>
          <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-3">
          <Label>{content.typeLabel}</Label>
          <RadioGroup value={type} onValueChange={(value: "Free" | "Paid") => setType(value)} className="flex space-x-4">
              <div className="flex items-center space-x-2 space-y-0">
                  <RadioGroupItem value="Free" id="type-free" />
                  <Label htmlFor="type-free" className="font-normal">{content.free}</Label>
              </div>
              <div className="flex items-center space-x-2 space-y-0">
                  <RadioGroupItem value="Paid" id="type-paid" />
                  <Label htmlFor="type-paid" className="font-normal">{content.paid}</Label>
              </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{content.imageLabel}</Label>
        <Input 
            id="image"
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جارٍ الحفظ...' : content.addActivity}
      </Button>
    </form>
  );
}
