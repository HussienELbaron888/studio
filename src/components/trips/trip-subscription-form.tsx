
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { sendConfirmationEmail } from "@/lib/email";
import { getSubscriptionConfirmationHtml } from "@/lib/email-templates";


const formSchema = z.object({
  studentName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  className: z.string().min(1, { message: "Class is required." }),
  phoneNumber: z.string().min(5, { message: "A valid phone number is required." }),
});

type SubscriptionFormProps = {
  setDialogOpen: (open: boolean) => void;
  tripTitle: string;
  tripId: string;
}

export function TripSubscriptionForm({ setDialogOpen, tripTitle, tripId }: SubscriptionFormProps) {
  const { content, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      className: "",
      phoneNumber: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !user.uid || !user.email) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const payload = {
        ...values,
        userId: user.uid,
        userEmail: user.email,
        tripId: tripId,
        itemId: tripId,
        itemTitle: tripTitle,
        itemType: 'trip',
        subscribedAt: serverTimestamp(),
      };
      await addDoc(subscriptionsRef, payload);

      const subject = `تأكيد الاشتراك في رحلة: ${tripTitle}`;
      const htmlContent = getSubscriptionConfirmationHtml({
        itemTitle: tripTitle,
        itemType: language === 'ar' ? 'رحلة' : 'Trip',
        subscriber: values,
      });

      const emailResult = await sendConfirmationEmail(user.email, subject, htmlContent);

       if (emailResult.success) {
        toast({
            title: content.subscriptionSuccessTitle,
            description: "تم إرسال بريد تأكيدي لاشتراكك.",
        });
      } else {
         toast({
            title: "تم الاشتراك، لكن فشل إرسال البريد",
            description: `لم نتمكن من إرسال بريد التأكيد. السبب: ${emailResult.error}`,
            variant: "destructive"
        });
      }

      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        title: "Error",
        description: `Failed to save subscription: ${error.message}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.studentNameLabel}</FormLabel>
              <FormControl>
                <Input placeholder={content.studentNameLabel} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.classLabel}</FormLabel>
              <FormControl>
                <Input placeholder={content.classLabel} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.phoneLabel}</FormLabel>
              <FormControl>
                <Input placeholder={content.phoneLabel} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {content.submit}
        </Button>
      </form>
    </Form>
  );
}
