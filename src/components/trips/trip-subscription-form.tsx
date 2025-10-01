
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/context/language-content";
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
  tripTitle: string;
  tripId: string;
}

export function TripSubscriptionForm({ setDialogOpen, tripTitle, tripId }: SubscriptionFormProps) {
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
      const response = await fetch('/api/trips/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              ...values,
              tripId,
              userId: user.uid,
              userEmail: user.email,
          })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
          throw new Error(data.message || 'Failed to subscribe.');
      }
      
      toast({
        title: content.subscriptionSuccessTitle,
        description: content.subscriptionSuccessMessage,
      });

      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save subscription. Please try again.",
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
