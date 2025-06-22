import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

import { type ChangeEvent, forwardRef, useImperativeHandle, useRef } from 'react';

export interface UploadAreaHandle {
  openFileDialog: () => void;
  clearFileInput?: () => void;
}

interface UploadAreaProps {
  aspectRatio?: 'video' | 'square' | 'wide' | 'tall';
  maxSizeMB?: number;

  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

// Use forwardRef to pass a ref from parent to this component
export const UploadArea = forwardRef<UploadAreaHandle, UploadAreaProps>(
  ({ aspectRatio, maxSizeMB = 10, handleFileChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose the openFileDialog method to the parent component
    useImperativeHandle(ref, () => ({
      openFileDialog: () => {
        fileInputRef.current?.click();
      },
      clearFileInput: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    }));

    // Generate aspect ratio class
    const getAspectRatioClass = () => {
      switch (aspectRatio) {
        case 'square':
          return 'aspect-square';
        case 'wide':
          return 'aspect-[16/9]';
        case 'tall':
          return 'aspect-[3/4]';
        case 'video':
          return 'aspect-video';
        default:
          return 'aspect-video';
      }
    };

    return (
      <>
        <div className='space-y-4'>
          {/* Upload area */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className={`flex ${getAspectRatioClass()} w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-8 text-center transition-colors hover:border-primary hover:bg-accent/10`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
                handleFileChange({
                  target: fileInputRef.current,
                } as ChangeEvent<HTMLInputElement>);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <UploadCloud className='mb-4 h-12 w-12 text-muted-foreground' />
            <p className='mb-2 font-semibold text-foreground'>Click or drag & drop to upload</p>
            <p className='text-xs text-muted-foreground'>PNG, JPG, GIF up to {maxSizeMB}MB</p>
          </div>
        </div>
        <Input
          ref={fileInputRef}
          id='photo-upload'
          name='photo-upload'
          type='file'
          accept='image/*'
          className='sr-only'
          onChange={handleFileChange}
        />
      </>
    );
  },
);

// Add a display name for better debugging
UploadArea.displayName = 'UploadArea';
