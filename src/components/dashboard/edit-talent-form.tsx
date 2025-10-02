
"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Talent } from "@/lib/types";
import { TalentValues, updateTalent } from "@/utils/updateTalent";
import { resolveStorageURL } from "@/utils/storage-url";
import { useLanguage } from "@/context/language-context";

type EditTalentFormProps = {
  talent: Talent;
  setDialogOpen: (open: boolean) => void;
};

export function EditTalentForm({ talent, setDialogOpen }: EditTalentFormProps) {
  const { toast } = useToast();
  const { content } = useLanguage();

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [stageAr, setStageAr] = useState("");
  const [stageEn, setStageEn] = useState("");
  const [detailsAr, setDetailsAr] = useState("");
  const [detailsEn, setDetailsEn] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (talent) {
      setNameAr(talent.name.ar);
      setNameEn(talent.name.en);
      setStageAr(talent.stage.ar);
      setStageEn(talent.stage.en);
      setDetailsAr(talent.details.ar);
      setDetailsEn(talent.details.en);
      
      resolveStorageURL(talent.image_path)
        .then(url => {
          if (url) setPreviewUrl(url);
        })
        .catch(console.error);
    }
  }, [talent]);

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

    const values: TalentValues = {
      name_ar: nameAr, name_en: nameEn,
      stage_ar: stageAr, stage_en: stageEn,
      details_ar: detailsAr, details_en: detailsEn,
    };
    
    try {
      await updateTalent(talent.id, values, imageFile, talent.image_path);
      toast({
        title: "Success",
        description: "Talent updated successfully!",
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        title: "Error",
        description: `Failed to update talent: ${error.message}`,
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
          <Label htmlFor="name-ar-edit">{content.talentNameLabel} (العربية)</Label>
          <Input id="name-ar-edit" value={nameAr} onChange={e => setNameAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name-en-edit">{content.talentNameLabel} (English)</Label>
          <Input id="name-en-edit" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage-ar-edit">{content.talentStageLabel} (العربية)</Label>
          <Input id="stage-ar-edit" value={stageAr} onChange={e => setStageAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage-en-edit">{content.talentStageLabel} (English)</Label>
          <Input id="stage-en-edit" value={stageEn} onChange={e => setStageEn(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="details-ar-edit">{content.talentDetailsLabel} (العربية)</Label>
        <Textarea id="details-ar-edit" value={detailsAr} onChange={e => setDetailsAr(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="details-en-edit">{content.talentDetailsLabel} (English)</Label>
        <Textarea id="details-en-edit" value={detailsEn} onChange={e => setDetailsEn(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>إدراج صورة</Label>
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
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
              id="dropzone-file-edit"
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
          "حفظ التعديلات"
        )}
      </Button>
    </form>
  );
}
