'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { AspectRatio } from './image-utils';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: AspectRatio;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageUrl,
  aspectRatio = 'square', // square by default
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error creating cropped image:', e);
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='relative flex-grow' style={{ height: '70vh' }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={
            aspectRatio === 'square'
              ? 1
              : aspectRatio === 'wide'
                ? 16 / 9
                : aspectRatio === 'tall'
                  ? 3 / 4
                  : undefined
          }
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className='p-4 bg-card border-t'>
        <div className='mb-4'>
          <label htmlFor='zoom-slider' className='text-sm font-medium mb-2 block'>
            Zoom: {zoom.toFixed(1)}x
          </label>
          <Slider
            id='zoom-slider'
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(values) => setZoom(values[0])}
            className='py-4'
            aria-labelledby='zoom-slider-label'
          />
        </div>

        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={createCroppedImage}>Apply Crop</Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to create a cropped image
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('No 2d context'));
      }

      // Set canvas dimensions to match the crop size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      // Convert to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    image.onerror = () => {
      reject(new Error('Could not load image'));
    };
  });
}
