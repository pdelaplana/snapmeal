import { useCamera } from '@/hooks/use-camera';
import { Camera } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { type AspectRatio, getAspectRatioClass } from './image-utils';

// Define the handle type for exposed methods
export interface DeviceCameraHandle {
  takePhoto: () => Promise<void>;
}

interface DeviceCameraProps {
  aspectRatio?: AspectRatio;
  maxSizeMB?: number; // Maximum file size in MB
  onImageCaptured?: (imageUri: string, fileName: string) => void; // Callback when photo is captured
}

const DeviceCamera = forwardRef<DeviceCameraHandle, DeviceCameraProps>(
  ({ aspectRatio = 'video', maxSizeMB, onImageCaptured }, ref) => {
    const { capturePhoto, isCapturing } = useCamera();
    const [isProcessing, setIsProcessing] = useState(false);

    // Process image to adjust size
    const processImageFile = (dataUrl: string, format: string): Promise<string> => {
      return new Promise((resolve) => {
        setIsProcessing(true);

        const img = new Image();
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
            const resizedDataUri = canvas.toDataURL(`image/${format}` || 'image/jpeg', 0.85);
            setIsProcessing(false);
            resolve(resizedDataUri);
          } else {
            // Fallback if canvas context fails
            setIsProcessing(false);
            resolve(dataUrl);
          }
        };

        img.onerror = () => {
          console.error('Error loading image for processing');
          setIsProcessing(false);
          resolve(dataUrl); // Return original on error
        };

        img.src = dataUrl;
      });
    };

    // Implement the photo capture logic
    const handleTakePhoto = async (): Promise<void> => {
      if (isCapturing || isProcessing) return;

      try {
        // Use Capacitor Camera
        const photo = await capturePhoto();
        if (photo?.dataUrl) {
          // Process the photo to resize it
          //const processedDataUrl = await processImageFile(photo.dataUrl, photo.format);

          // Generate filename
          const filename = `Photo-${new Date().toISOString().slice(0, 10)}.${photo.format}`;

          // Send back to parent via callback
          onImageCaptured?.(photo.dataUrl, filename);
        }
      } catch (error) {
        console.error('Error taking or processing photo:', error);
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      takePhoto: handleTakePhoto,
    }));

    return (
      <div className='space-y-4'>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className={`flex ${getAspectRatioClass(aspectRatio)} w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-8 text-center transition-colors hover:border-primary hover:bg-accent/10`}
          onClick={handleTakePhoto}
        >
          <Camera className='mb-4 h-12 w-12 text-muted-foreground' />
          <p className='mb-2 font-semibold text-foreground'>
            Take Photo with Camera or Upload from Photo Gallery
          </p>
          <p className='text-xs text-muted-foreground'>PNG, JPG, GIF up to {maxSizeMB}MB</p>
        </div>
      </div>
    );
  },
);

// Add display name for better debugging
DeviceCamera.displayName = 'DeviceCamera';

export default DeviceCamera;
