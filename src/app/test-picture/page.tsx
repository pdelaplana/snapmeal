'use client';

import ImageCapture from '@/components/shared/image-capture/image-capture';
import { useState } from 'react';

export default function TestPicturePage() {
  const [photoDataUri, setPhotoDataUri] = useState<string>('');

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6'>Picture Capture Test</h1>

      <div className='mb-8'>
        <ImageCapture
          onImageCaptured={(dataUri) => setPhotoDataUri(dataUri)}
          photoType='test'
          labelText='Native Camera Test'
        />
      </div>

      {photoDataUri && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-2'>Photo Result</h2>
          <p className='text-sm text-gray-500 mb-4'>Photo captured with native camera app</p>
          <div className='border border-dashed border-gray-300 p-2'>
            {/* biome-ignore lint/a11y/noRedundantAlt: <explanation> */}
            <img src={photoDataUri} alt='Captured or uploaded photo' style={{ maxWidth: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
