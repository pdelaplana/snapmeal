
"use client";

import type { ChangeEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { UploadCloud, Trash2 } from 'lucide-react'; // Removed Camera icon as direct capture isn't implemented here

interface MealCaptureProps {
  onPhotoCaptured: (photoDataUri: string) => void;
  initialPhotoDataUri?: string | null;
}

export default function MealCapture({ onPhotoCaptured, initialPhotoDataUri }: MealCaptureProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPhotoDataUri) {
      setPhotoPreview(initialPhotoDataUri);
      // We don't call onPhotoCaptured here as the parent component (edit page)
      // will already have this initial URI. onPhotoCaptured is for new selections.
      // setFileName("Current image"); // Optional: set a generic name
    } else {
      // If initialPhotoDataUri is explicitly cleared by parent, reset preview.
      // This might not be hit if parent always provides a URI or null correctly.
      setPhotoPreview(null);
      setFileName(null);
    }
  }, [initialPhotoDataUri]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPhotoPreview(dataUri);
        onPhotoCaptured(dataUri); // Notify parent of new photo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    onPhotoCaptured(""); // Notify parent that photo is removed/cleared
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="meal-photo" className="text-lg font-medium">
          {photoPreview ? "Current Meal Photo" : "Upload Meal Photo"}
        </Label>
        <p className="text-sm text-muted-foreground">
          {photoPreview ? "You can replace the current photo or remove it." : "Upload an image of your meal."}
        </p>
      </div>
      
      {photoPreview ? (
        <div className="space-y-4">
          <div className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-lg border-2 border-dashed border-primary shadow-md">
            <Image src={photoPreview} alt="Meal preview" layout="fill" objectFit="contain" data-ai-hint="food meal"/>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
            <Button variant="outline" onClick={handleRemovePhoto} className="w-full text-destructive hover:bg-destructive/10 sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Photo
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-8 text-center transition-colors hover:border-primary hover:bg-accent/10"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
               if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
               handleFileChange({ target: fileInputRef.current } as ChangeEvent<HTMLInputElement>);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 font-semibold text-foreground">Click or drag & drop to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}
      <Input
        ref={fileInputRef}
        id="meal-photo"
        name="meal-photo"
        type="file"
        accept="image/*"
        // Removed capture="environment" as primary action is upload, can be confusing with initialPhoto
        className="sr-only"
        onChange={handleFileChange}
      />
      {fileName && !photoPreview && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
    </div>
  );
}
