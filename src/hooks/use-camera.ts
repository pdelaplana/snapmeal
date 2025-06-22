'use client';

import { useToast } from '@/hooks/use-toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export interface PhotoResult {
  dataUrl: string;
  format: string;
}

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const capturePhoto = async (): Promise<PhotoResult | null> => {
    if (isCapturing) return null;

    try {
      setIsCapturing(true);

      // Take a photo with the camera or pick one from the gallery
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl, // Base64 string
        source: CameraSource.Camera, // Let user choose camera or gallery
        quality: 90, // Quality from 0 to 100
        width: 1280, // Target width
        correctOrientation: true, // Automatically rotate images based on EXIF data
      });

      if (!photo.dataUrl) return null;

      return {
        dataUrl: photo.dataUrl,
        format: photo.format || 'jpeg',
      };
    } catch (error) {
      console.error('Error capturing photo:', error);

      // Only show toast if it's not a user cancellation
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      if ((error as any)?.message !== 'User cancelled photos app') {
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description:
            'There was a problem accessing the camera. Please try again or upload a photo instead.',
        });
      }

      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    capturePhoto,
    isCapturing,
  };
}
