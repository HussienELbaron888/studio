"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/context/language-context";
import { contentTagging } from "@/ai/flows/content-tagging";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

type AddActivityFormProps = {
  setDialogOpen: (open: boolean) => void;
}

export function AddActivityForm({ setDialogOpen }: AddActivityFormProps) {
  const { content } = useLanguage();
  const { toast } = useToast();
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleSuggestTags = async () => {
    const description = form.getValues("description");
    if (!description || description.length < 10) {
      form.setError("description", { message: "Please enter a longer description to suggest tags." });
      return;
    }
    
    setIsSuggesting(true);
    setSuggestedTags([]);
    
    try {
      const result = await contentTagging({ description });
      setSuggestedTags(result.tags);
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({
        title: "Error",
        description: "Failed to suggest tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ ...values, tags: suggestedTags });
    toast({
        title: "Success!",
        description: "Activity has been added (simulated).",
    });
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.activityTitleLabel}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Beach Cleanup" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.activityDescriptionLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the activity..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
            <Button type="button" variant="outline" onClick={handleSuggestTags} disabled={isSuggesting}>
                {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                {content.suggestTags}
            </Button>
        </div>

        {suggestedTags.length > 0 && (
            <div className="space-y-2">
                <Label>{content.suggestedTags}</Label>
                <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </div>
        )}

        <Button type="submit" className="w-full">
            {content.submit}
        </Button>
      </form>
    </Form>
  );
}
