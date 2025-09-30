
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
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
  image: z.instanceof(File).optional(),
});

type AddActivityFormProps = {
  setDialogOpen: (open: boolean) => void;
}

export function AddActivityForm({ setDialogOpen }: AddActivityFormProps) {
  const { content } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      let imageHint = "";

      // Use a placeholder if no image is uploaded
      if (values.image) {
        const storageRef = ref(storage, `activities/${Date.now()}-${values.image.name}`);
        const uploadResult = await uploadBytes(storageRef, values.image);
        imageUrl = await getDownloadURL(uploadResult.ref);
        imageHint = "custom activity";
      } else {
        // You might want to have a default placeholder image
        imageUrl = "https://placehold.co/600x400/EEE/31343C?text=Activity";
        imageHint = "placeholder";
      }

      const newActivity = {
        title: { en: values.title_en, ar: values.title_ar },
        description: { en: values.description_en, ar: values.description_ar },
        schedule: { en: values.schedule_en, ar: values.schedule_ar },
        time: values.time,
        sessions: values.sessions,
        price: values.price,
        type: values.type,
        image: {
            id: `custom-${Date.now()}`,
            description: values.description_en,
            imageUrl: imageUrl,
            imageHint: imageHint
        }
      };

      await addDoc(collection(db, "activities"), newActivity);

      toast({
        title: "تم بنجاح!",
        description: "تمت إضافة النشاط بنجاح.",
      });
      setDialogOpen(false);

    } catch (error) {
      console.error("Error adding activity:", error);
      toast({
        title: "خطأ",
        description: "فشلت إضافة النشاط. الرجاء التحقق من صلاحيات التخزين والمحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                <FormLabel>{content.imageLabel}</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        {...fieldProps}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {content.addActivity}
        </Button>
      </form>
    </Form>
  );
}

    