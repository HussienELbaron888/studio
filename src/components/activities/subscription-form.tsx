
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

const formSchema = z.object({
  studentName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  className: z.string().min(1, { message: "Class is required." }),
  phoneNumber: z.string().min(5, { message: "A valid phone number is required." }),
});

type SubscriptionFormProps = {
  setDialogOpen: (open: boolean) => void;
  activityTitle: string;
  activityId: string;
}

export function SubscriptionForm({ setDialogOpen, activityTitle, activityId }: SubscriptionFormProps) {
  const { content } = useLanguage();
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
    if (!user || !user.email) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Save subscription to Firestore
      const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');
      await addDoc(subscriptionsRef, {
        activityId,
        activityTitle,
        ...values,
        subscribedAt: serverTimestamp(),
      });

      // 2. Send email via the new API route
      try {
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: values.studentName,
            activityTitle,
            userEmail: user.email,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
           throw new Error(json.error || 'Failed to send email.');
        }

        toast({
          title: content.subscriptionSuccessTitle,
          description: content.subscriptionSuccessMessage,
        });
      } catch (emailError: any) {
         toast({
            title: "Subscription successful, but email failed",
            description: `Could not send confirmation email. Reason: ${emailError.message}`,
            variant: "destructive"
        });
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Error during subscription process:", error);
      toast({
        title: "Error",
        description: "Failed to save subscription. Please try again.",
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
