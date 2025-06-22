'use client';

import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import DeviceCamera, { type DeviceCameraHandle } from './device-camera';
import ImagePreview from './image-preview';
import { type AspectRatio, getAspectRatioClass } from './image-utils';
import { UploadArea, type UploadAreaHandle } from './upload-area';

interface ImageCaptureProps {
  onImageCaptured: (imageDataUri: string) => void;
  initialImageDataUri?: string | null;
  photoType?: string;
  aspectRatio?: AspectRatio;
  maxSizeMB?: number;
  previewAltText?: string;
  labelText?: string;
  helpText?: string;
  showRemoveButton?: boolean;
  uploadOnly?: boolean; // Optional prop to allow upload only mode
}

export default function ImageCapture({
  onImageCaptured,
  initialImageDataUri,
  photoType = 'photo',
  aspectRatio = 'video',
  maxSizeMB = 10,
  previewAltText = 'Photo preview',
  labelText,
  helpText,
  uploadOnly = false, // Default to false to allow camera capture
  showRemoveButton = true,
}: ImageCaptureProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  // Get display text based on photoType
  const displayText = {
    label: labelText || `Add ${photoType.charAt(0).toUpperCase() + photoType.slice(1)}`,
    labelWithPhoto:
      labelText || `Current ${photoType.charAt(0).toUpperCase() + photoType.slice(1)}`,
    help: helpText || `Upload an image or take a new ${photoType}.`,
    helpWithPhoto: helpText || `You can replace the current ${photoType} or remove it.`,
  };

  const uploadAreaRef = useRef<UploadAreaHandle>(null);

  const deviceCameraRef = useRef<DeviceCameraHandle>(null);

  // Effect for handling the initial photo data URI
  useEffect(() => {
    if (initialImageDataUri) {
      setPhotoPreview(initialImageDataUri);
    } else {
      setPhotoPreview(null);
      setFileName(null);
    }
  }, [initialImageDataUri]);

  const processImageFile = (file: File) => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Maximum file size is ${maxSizeMB}MB.`,
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new globalThis.Image();
      img.onload = () => {
        // Get image dimensions
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Always use width as the fixed dimension (1280px)
        const targetWidth = 1280;
        const targetHeight = Math.round(targetWidth * (imageHeight / imageWidth));

        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert to data URI with consistent quality
          const resizedDataUri = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoPreview(resizedDataUri);
          onImageCaptured(resizedDataUri);
        } else {
          // Fallback if canvas context fails
          setPhotoPreview(img.src);
          onImageCaptured(img.src);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFileName(null);
    if (uploadAreaRef.current?.clearFileInput) {
      uploadAreaRef.current.clearFileInput();
    }

    onImageCaptured('');
  };

  const handleTakePhotoClick = async () => {
    if (photoPreview !== null) {
      // When we already have a photo, clear it first
      handleRemovePhoto();
      // Wait for state update
      setTimeout(() => {
        // Now DeviceCamera should be rendered and ref available
        deviceCameraRef.current?.takePhoto();
      }, 0);
    } else {
      // Direct capture when no photo yet
      deviceCameraRef.current?.takePhoto();
    }
  };

  const handleUploadClick = () => {
    uploadAreaRef.current?.openFileDialog();
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='photo-upload' className='text-lg font-medium'>
          {photoPreview ? displayText.labelWithPhoto : displayText.label}
        </Label>
        <p className='text-sm text-muted-foreground'>
          {photoPreview ? displayText.helpWithPhoto : displayText.help}
        </p>
      </div>
      {photoPreview !== null ? (
        <ImagePreview
          aspectRatio={aspectRatio}
          photoPreview={photoPreview}
          previewAltText={previewAltText}
          handleRemovePhoto={handleRemovePhoto}
          handleTakePhotoClick={handleTakePhotoClick}
          handleUploadClick={handleUploadClick}
          showRemoveButton={showRemoveButton}
        />
      ) : (
        <>
          {uploadOnly && (
            <UploadArea
              ref={uploadAreaRef}
              aspectRatio={aspectRatio}
              maxSizeMB={maxSizeMB}
              handleFileChange={handleFileChange}
            />
          )}

          {!uploadOnly && (
            <DeviceCamera
              ref={deviceCameraRef}
              aspectRatio={aspectRatio}
              maxSizeMB={maxSizeMB}
              onImageCaptured={(imageUri, fileName) => {
                setPhotoPreview(imageUri);
                setFileName(fileName);
                onImageCaptured(imageUri);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
