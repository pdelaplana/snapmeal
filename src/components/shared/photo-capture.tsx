'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Trash2, UploadCloud, VideoOff, XCircle } from 'lucide-react';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PhotoCaptureProps {
  onPhotoCaptured: (photoDataUri: string) => void;
  initialPhotoDataUri?: string | null;
  photoType?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'tall';
  maxSizeMB?: number;
  previewAltText?: string;
  labelText?: string;
  helpText?: string;
  showRemoveButton?: boolean;
}

export default function PhotoCapture({
  onPhotoCaptured,
  initialPhotoDataUri,
  photoType = 'photo',
  aspectRatio = 'video',
  maxSizeMB = 10,
  previewAltText = 'Photo preview',
  labelText,
  helpText,
  showRemoveButton = true,
}: PhotoCaptureProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentView, setCurrentView] = useState<'idle' | 'camera'>('idle');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get display text based on photoType
  const displayText = {
    label: labelText || `Add ${photoType.charAt(0).toUpperCase() + photoType.slice(1)}`,
    labelWithPhoto:
      labelText || `Current ${photoType.charAt(0).toUpperCase() + photoType.slice(1)}`,
    help: helpText || `Upload an image or take a new ${photoType}.`,
    helpWithPhoto: helpText || `You can replace the current ${photoType} or remove it.`,
  };

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

  useEffect(() => {
    if (initialPhotoDataUri) {
      setPhotoPreview(initialPhotoDataUri);
    } else {
      setPhotoPreview(null);
      setFileName(null);
    }
  }, [initialPhotoDataUri]);

  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      for (const track of stream.getTracks()) {
        track.stop();
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraPermission = async () => {
      if (currentView !== 'camera') {
        stopCameraStream();
        return;
      }

      setIsCameraInitializing(true);
      setCameraError(null);
      setHasCameraPermission(null);

      try {
        streamInstance = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = streamInstance;
        }
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        const errorMessage =
          error.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please enable it in your browser settings.'
            : `Could not access camera: ${error.message}. Ensure it's not in use by another app.`;
        setCameraError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Camera Access Issue',
          description: errorMessage,
        });
      } finally {
        setIsCameraInitializing(false);
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup function
      if (streamInstance) {
        for (const track of streamInstance.getTracks()) {
          track.stop();
        }
        if (videoRef.current?.srcObject) {
          const activeStream = videoRef.current.srcObject as MediaStream;
          for (const track of activeStream.getTracks()) {
            track.stop();
          }
          videoRef.current.srcObject = null;
        }
      }
    };
  }, [currentView, toast, stopCameraStream]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      fileInputRef.current.value = '';
    }
    onPhotoCaptured('');
    if (currentView === 'camera') {
      setCurrentView('idle');
    }
  };

  const handleTakePhotoClick = () => {
    setPhotoPreview(null);
    onPhotoCaptured('');
    setCurrentView('camera');
  };

  const handleSnapPhoto = () => {
    if (videoRef.current && canvasRef.current && hasCameraPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUri);
        onPhotoCaptured(dataUri);
        setFileName(`capture-${Date.now()}.jpg`);
        setCurrentView('idle');
        stopCameraStream();
      } else {
        toast({
          variant: 'destructive',
          title: 'Capture Failed',
          description: 'Could not get canvas context.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Capture Failed',
        description: 'Camera not ready or permission denied.',
      });
    }
  };

  const handleCancelCamera = () => {
    setCurrentView('idle');
    stopCameraStream();
    setCameraError(null);
    setHasCameraPermission(null);
  };

  if (currentView === 'camera') {
    return (
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label className='text-lg font-medium'>
            Take {photoType.charAt(0).toUpperCase() + photoType.slice(1)}
          </Label>
          <p className='text-sm text-muted-foreground'>
            Position {photoType === 'profile' ? 'yourself' : `the ${photoType}`} in the frame and
            snap a photo.
          </p>
        </div>
        {isCameraInitializing && (
          <div
            className={`flex flex-col items-center justify-center ${getAspectRatioClass()} w-full rounded-lg border-2 border-dashed border-primary bg-card p-8 text-center`}
          >
            <LoadingSpinner className='mb-4 h-12 w-12 text-primary' />
            <p className='font-semibold'>Initializing Camera...</p>
          </div>
        )}
        {hasCameraPermission === false && cameraError && (
          <Alert variant='destructive'>
            <VideoOff className='h-4 w-4' />
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}
        {hasCameraPermission === true && (
          <div
            className={`relative mx-auto ${getAspectRatioClass()} w-full max-w-lg overflow-hidden rounded-lg border-2 border-primary bg-black shadow-md`}
          >
            <video
              ref={videoRef}
              className='h-full w-full object-contain'
              autoPlay
              muted
              playsInline
            />
          </div>
        )}
        <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          {hasCameraPermission === true && !isCameraInitializing && (
            <Button onClick={handleSnapPhoto} size='lg' className='w-full sm:w-auto'>
              <Camera className='mr-2 h-5 w-5' />
              Snap Photo
            </Button>
          )}
          <Button
            onClick={handleCancelCamera}
            variant='outline'
            size='lg'
            className='w-full sm:w-auto'
          >
            <XCircle className='mr-2 h-5 w-5' />
            Cancel Camera
          </Button>
        </div>
        <canvas ref={canvasRef} className='hidden' />
      </div>
    );
  }

  // Idle view (upload or photo preview)
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

      {photoPreview ? (
        <div className='space-y-4'>
          <div
            className={`relative mx-auto ${getAspectRatioClass()} w-full max-w-lg overflow-hidden rounded-lg border-2 border-dashed border-primary shadow-md`}
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
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              className='w-full sm:w-auto'
            >
              <UploadCloud className='mr-2 h-4 w-4' />
              Change via Upload
            </Button>
            <Button variant='outline' onClick={handleTakePhotoClick} className='w-full sm:w-auto'>
              <Camera className='mr-2 h-4 w-4' />
              Retake with Camera
            </Button>
            {showRemoveButton && (
              <Button
                variant='destructive'
                onClick={handleRemovePhoto}
                className='w-full sm:w-auto'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Remove Photo
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
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
          <div className='text-center'>
            <Button variant='outline' onClick={handleTakePhotoClick} size='lg'>
              <Camera className='mr-2 h-5 w-5' />
              Or, Take Photo with Camera
            </Button>
          </div>
        </div>
      )}
      <Input
        ref={fileInputRef}
        id='photo-upload'
        name='photo-upload'
        type='file'
        accept='image/*'
        className='sr-only'
        onChange={handleFileChange}
      />
      <canvas ref={canvasRef} className='hidden' />
      {fileName && !photoPreview && currentView === 'idle' && (
        <p className='text-sm text-muted-foreground'>Selected for upload: {fileName}</p>
      )}
    </div>
  );
}
