
"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { updateSlide, SlideValues } from "@/utils/updateSlide";
import { resolveStorageURL } from "@/utils/storage-url";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Slide } from "@/lib/types";

type EditSliderFormProps = {
  slide: Slide;
  setDialogOpen: (open: boolean) => void;
};

export function EditSliderForm({ slide, setDialogOpen }: EditSliderFormProps) {
  const { toast } = useToast();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [buttonTextAr, setButtonTextAr] = useState("");
  const [buttonTextEn, setButtonTextEn] = useState("");
  const [buttonHref, setButtonHref] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [published, setPublished] = useState(true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slide) {
        setTitleAr(slide.title.ar);
        setTitleEn(slide.title.en);
        setDescriptionAr(slide.description.ar);
        setDescriptionEn(slide.description.en);
        setButtonTextAr(slide.buttonText.ar);
        setButtonTextEn(slide.buttonText.en);
        setButtonHref(slide.buttonHref);
        setOrder(slide.order);
        setPublished(slide.published);
        resolveStorageURL(slide.image_path).then(url => {
            if (url) setPreviewUrl(url);
        }).catch(console.error);
    }
  }, [slide]);

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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if(fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const values: SlideValues = {
      title_ar: titleAr, title_en: titleEn,
      description_ar: descriptionAr, description_en: descriptionEn,
      buttonText_ar: buttonTextAr, buttonText_en: buttonTextEn,
      buttonHref, order, published,
    };
    
    try {
      await updateSlide(slide.id, values, imageFile, slide.image_path);
      toast({ title: "Success", description: "Slide updated successfully!" });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({ title: "Error", description: `Failed to update slide: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title-ar-edit">Title (العربية)</Label>
          <Input id="title-ar-edit" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title-en-edit">Title (English)</Label>
          <Input id="title-en-edit" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-ar-edit">Description (العربية)</Label>
        <Textarea id="description-ar-edit" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description-en-edit">Description (English)</Label>
        <Textarea id="description-en-edit" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="button-text-ar-edit">Button Text (العربية)</Label>
          <Input id="button-text-ar-edit" value={buttonTextAr} onChange={e => setButtonTextAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="button-text-en-edit">Button Text (English)</Label>
          <Input id="button-text-en-edit" value={buttonTextEn} onChange={e => setButtonTextEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
          <Label htmlFor="button-href-edit">Button Link</Label>
          <Input id="button-href-edit" value={buttonHref} onChange={e => setButtonHref(e.target.value)} placeholder="/events" required />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order-edit">Order</Label>
            <Input id="order-edit" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
          </div>
          <div className="space-y-2 flex flex-col pt-2">
            <Label>Published</Label>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
       </div>

      <div className="space-y-2">
        <Label>Image</Label>
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={removeImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer", dragActive ? "border-primary" : "border-input")}
          >
             <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
            </div>
            <Input ref={fileInputRef} id="dropzone-file-edit" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
      </Button>
    </form>
  );
}
