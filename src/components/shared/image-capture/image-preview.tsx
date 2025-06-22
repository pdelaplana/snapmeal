import Image from 'next/image';
import { type AspectRatio, getAspectRatioClass } from './image-utils';

interface ImagePreviewProps {
  aspectRatio?: AspectRatio;
  photoPreview: string;
  previewAltText?: string;
}
export default function ImagePreview({
  aspectRatio = 'video',
  photoPreview,
  previewAltText = 'Photo preview',
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
    </div>
  );
}
