'use client';

import PhotoCapture from '@/components/shared/photo-capture';
import { useState } from 'react';

export default function TestPhotoPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string>('');

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6'>Photo Orientation Test</h1>

      <div className='mb-8'>
        <PhotoCapture
          onPhotoCaptured={(dataUri) => setPhotoDataUri(dataUri)}
          photoType='test'
          labelText='Test Photo'
        />
      </div>

      {photoDataUri && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-2'>Photo Result</h2>
          <p className='text-sm text-gray-500 mb-4'>
            Check that portrait photos appear at the correct width
          </p>
          <div className='border border-dashed border-gray-300 p-2'>
            {/* biome-ignore lint/a11y/useAltText: <explanation> */}
            <img src={photoDataUri} style={{ maxWidth: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
