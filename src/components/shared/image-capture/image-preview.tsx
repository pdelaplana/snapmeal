import { Button } from '@/components/ui/button';
import { Camera, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { type AspectRatio, getAspectRatioClass } from './image-utils';

interface ImagePreviewProps {
  aspectRatio?: AspectRatio;
  photoPreview: string;
  previewAltText?: string;
  showRemoveButton?: boolean;
  uploadOnly?: boolean; // Optional prop to allow upload only mode
  handleUploadClick?: () => void;
  handleTakePhotoClick?: () => void;
  handleRemovePhoto?: () => void;
}
export default function ImagePreview({
  aspectRatio = 'video',
  photoPreview,
  previewAltText = 'Photo preview',
  handleUploadClick,
  handleTakePhotoClick,
  handleRemovePhoto,
  showRemoveButton = true,
  uploadOnly = false, // Default to false to allow camera capture
}: ImagePreviewProps) {
  return (
    <div className='space-y-4'>
      <div
        className={`relative mx-auto ${getAspectRatioClass(aspectRatio)} w-full max-w-lg overflow-hidden rounded-lg border-2 border-dashed border-primary shadow-md`}
      >
        <Image
          src={photoPreview}
          alt={previewAltText}
          fill
          className='object-contain'
          sizes='(max-width: 768px) 100vw, 50vw'
          priority
        />
      </div>
      <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-center'>
        {uploadOnly && (
          <Button variant='outline' onClick={handleUploadClick} className='w-full sm:w-auto'>
            <UploadCloud className='mr-2 h-4 w-4' />
            Change via Upload
          </Button>
        )}
        {!uploadOnly && (
          <Button
            variant='outline'
            onClick={handleTakePhotoClick}
            className='w-full sm:w-auto'
            //disabled={isCapturing}
          >
            <Camera className='mr-2 h-4 w-4' />
            Take New Photo
          </Button>
        )}

        {showRemoveButton && (
          <Button variant='destructive' onClick={handleRemovePhoto} className='w-full sm:w-auto'>
            <Trash2 className='mr-2 h-4 w-4' />
            Remove Photo
          </Button>
        )}
      </div>
    </div>
  );
}
