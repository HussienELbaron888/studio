"use client";
import React, { useState } from "react";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { app } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function AddActivityForm() {
  // Move Firebase service initialization inside the component to ensure it runs on the client.
  const db = getFirestore(app);
  const storage = getStorage(app);

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [scheduleAr, setScheduleAr] = useState("");
  const [scheduleEn, setScheduleEn] = useState("");
  const [time, setTime] = useState("");
  const [sessions, setSessions] = useState(0);
  const [price, setPrice] = useState(0);
  const [activityType, setActivityType] = useState("paid");
  const [type, setType] = useState("general");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const resetForm = () => {
    setTitleAr("");
    setTitleEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    setScheduleAr("");
    setScheduleEn("");
    setTime("");
    setSessions(0);
    setPrice(0);
    setActivityType("paid");
    setType("general");
    setImageFile(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("جارٍ حفظ النشاط...");
    setMessageType("success");

    try {
      // 1. Prepare data and generate ID
      const activityRef = doc(collection(db, "activities"));
      const activityId = activityRef.id;

      let imagePath: string | null = null;
      let imageUrlForDoc: string = "";

      // 2. Upload image if it exists
      if (imageFile) {
        setMessage("جارٍ رفع الصورة...");
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        imagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, imagePath);

        await uploadBytes(fileStorageRef, imageFile, {
          contentType: imageFile.type || "application/octet-stream",
        });
      }

      // 3. Save the document
      setMessage("جارٍ حفظ البيانات...");
      const values = {
        title_ar: titleAr,
        title_en: titleEn,
        description_ar: descriptionAr,
        description_en: descriptionEn,
        schedule_ar: scheduleAr,
        schedule_en: scheduleEn,
        time: time,
        sessions: sessions,
        price: activityType === 'free' ? 0 : price,
        type: type
      };

      await setDoc(activityRef, {
        ...values,
        title: { en: values.title_en, ar: values.title_ar },
        description: { en: values.description_en, ar: values.description_ar },
        schedule: { en: values.schedule_en, ar: values.schedule_ar },
        image: {
          id: `img-${Date.now()}`,
          description: values.description_en,
          imageUrl: imageUrlForDoc,
          imageHint: "activity cover",
        },
        image_path: imagePath,
        created_at: serverTimestamp(),
      });

      setMessageType("success");
      setMessage("تم إضافة النشاط بنجاح ✅");
      resetForm();

    } catch (err: any) {
      console.error("Operation failed:", err);
      setMessageType("error");
      setMessage(`فشل: ${err?.code || err?.message || "حدث خطأ غير متوقع"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{messageType === 'error' ? 'حدث خطأ' : 'الحالة'}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_ar">عنوان (عربي)</Label>
          <Input id="title_ar" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="مثال: ورشة صناعة الفخار" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (English)</Label>
          <Input id="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g., Pottery Making Workshop" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description_ar">وصف (عربي)</Label>
          <Textarea id="description_ar" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="وصف قصير للنشاط..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description_en">Description (English)</Label>
          <Textarea id="description_en" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="A brief description of the activity..." />
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule_ar">الموعد (عربي)</Label>
          <Input id="schedule_ar" value={scheduleAr} onChange={(e) => setScheduleAr(e.target.value)} placeholder="مثال: كل يوم سبت" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule_en">Schedule (English)</Label>
          <Input id="schedule_en" value={scheduleEn} onChange={(e) => setScheduleEn(e.target.value)} placeholder="e.g., Every Saturday" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time">الوقت</Label>
          <Input id="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="4:00 PM" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessions">عدد الجلسات</Label>
          <Input id="sessions" type="number" min="0" value={sessions} onChange={(e) => setSessions(Number(e.target.value))} placeholder="1" />
        </div>
        <div className="space-y-2">
          <Label>نوع السعر</Label>
          <RadioGroup value={activityType} onValueChange={setActivityType} className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="r-paid" />
              <Label htmlFor="r-paid">مدفوع</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="r-free" />
              <Label htmlFor="r-free">مجاني</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
           <Label htmlFor="price">السعر</Label>
           <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="100" disabled={activityType === 'free'} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="type">فئة النشاط</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="عام" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="file-input">صورة النشاط</Label>
            <Input id="file-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ النشاط"}
      </Button>
    </form>
  );
}
