
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ref, uploadBytes } from "firebase/storage";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/context/language-context";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title_ar: z.string().min(3, "العنوان بالعربية مطلوب."),
  title_en: z.string().min(3, "Title in English is required."),
  description_ar: z.string().min(10, "الوصف بالعربية مطلوب."),
  description_en: z.string().min(10, "Description in English is required."),
  schedule_ar: z.string().min(2, "المواعيد بالعربية مطلوبة."),
  schedule_en: z.string().min(2, "Schedule in English is required."),
  time: z.string().min(1, "الوقت مطلوب."),
  sessions: z.coerce.number().min(1, "عدد الحصص مطلوب."),
  price: z.coerce.number().min(0, "السعر مطلوب."),
  type: z.enum(["Free", "Paid"], { required_error: "يجب تحديد النوع." }),
  image: z.any().optional(),
});

type AddActivityFormProps = {
  setDialogOpen: (open: boolean) => void;
}

export function AddActivityForm({ setDialogOpen }: AddActivityFormProps) {
  const { content } = useLanguage();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      schedule_ar: "",
      schedule_en: "",
      time: "",
      sessions: 1,
      price: 0,
      type: "Free",
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      form.setValue("image", file); // Inform react-hook-form about the file
    } else {
      setImageFile(null);
      form.setValue("image", null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Prepare DocRef to get a unique ID before any upload
      const activityRef = doc(collection(db, "activities"));
      const activityId = activityRef.id;

      let imagePath: string | null = null;
      let imageUrl: string | null = null; // Will remain null or empty

      // 2. Upload image if it exists, but DO NOT get the download URL here
      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        imagePath = `activities/${activityId}/cover_${Date.now()}.${ext}`;
        const storageReference = ref(storage, imagePath);
        
        await uploadBytes(storageReference, imageFile, {
            contentType: imageFile.type || "application/octet-stream" 
        });
        // We specifically DO NOT call getDownloadURL here to make the upload process faster and more reliable.
        // The URL will be resolved on the client-side when the activity card is displayed.
      }

      // 3. Save the document to Firestore with the generated ID
      await setDoc(activityRef, {
        title: { en: values.title_en, ar: values.title_ar },
        description: { en: values.description_en, ar: values.description_ar },
        schedule: { en: values.schedule_en, ar: values.schedule_ar },
        time: values.time,
        sessions: values.sessions,
        price: values.price,
        type: values.type,
        image: imageFile ? {
            id: `custom-${activityId}`,
            description: values.description_en,
            imageUrl: "", // Left empty intentionally.
            imageHint: "custom activity"
        } : null,
        image_path: imagePath, // Save the storage path
        created_at: serverTimestamp(),
      });

      toast({
        title: "تم بنجاح!",
        description: "تمت إضافة النشاط بنجاح.",
      });
      form.reset();
      setImageFile(null);
      setDialogOpen(false);

    } catch (error: any) {
      console.error("Failed to add activity:", error);
      toast({
        title: "خطأ في الإضافة",
        description: `فشلت العملية. الخطأ: ${error.code || error.message}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="title_ar" render={({ field }) => (
                <FormItem><FormLabel>عنوان النشاط (بالعربية)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="title_en" render={({ field }) => (
                <FormItem><FormLabel>Activity Title (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="description_ar" render={({ field }) => (
            <FormItem><FormLabel>الوصف (بالعربية)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description_en" render={({ field }) => (
            <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="schedule_ar" render={({ field }) => (
                <FormItem><FormLabel>{content.scheduleLabel} (بالعربية)</FormLabel><FormControl><Input placeholder="الأحد، الثلاثاء، الخميس" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="schedule_en" render={({ field }) => (
                <FormItem><FormLabel>{content.scheduleLabel} (English)</FormLabel><FormControl><Input placeholder="Sun, Tue, Thu" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem><FormLabel>{content.timeLabel}</FormLabel><FormControl><Input placeholder="4:00 PM - 5:00 PM" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sessions" render={({ field }) => (
                <FormItem><FormLabel>{content.sessionsLabel}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>{content.priceLabel}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>{content.typeLabel}</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Free" /></FormControl>
                            <FormLabel className="font-normal">{content.free}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Paid" /></FormControl>
                            <FormLabel className="font-normal">{content.paid}</FormLabel>
                        </FormItem>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{content.imageLabel}</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'جارٍ الحفظ...' : content.addActivity}
        </Button>
      </form>
    </Form>
  );
}

    