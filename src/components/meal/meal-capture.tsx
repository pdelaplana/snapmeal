"use client";

import type { ChangeEvent } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Camera, UploadCloud, Trash2 } from 'lucide-react';

interface MealCaptureProps {
  onPhotoCaptured: (photoDataUri: string) => void;
}

export default function MealCapture({ onPhotoCaptured }: MealCaptureProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPhotoPreview(dataUri);
        onPhotoCaptured(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    onPhotoCaptured(""); // Notify parent that photo is removed
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="meal-photo" className="text-lg font-medium">Capture Your Meal</Label>
        <p className="text-sm text-muted-foreground">
          Take a photo or upload an image of your meal.
        </p>
      </div>
      
      {photoPreview ? (
        <div className="space-y-4">
          <div className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-lg border-2 border-dashed border-primary shadow-md">
            <Image src={photoPreview} alt="Meal preview" layout="fill" objectFit="contain" data-ai-hint="food meal"/>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRemovePhoto} className="text-destructive hover:bg-destructive/10">
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
               if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files; // Assign files to input
               handleFileChange({ target: fileInputRef.current } as ChangeEvent<HTMLInputElement>);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 font-semibold text-foreground">Click or drag & drop to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
          <Input
            ref={fileInputRef}
            id="meal-photo"
            name="meal-photo"
            type="file"
            accept="image/*"
            capture="environment" // Prefer back camera on mobile
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}
      {fileName && !photoPreview && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
    </div>
  );
}
