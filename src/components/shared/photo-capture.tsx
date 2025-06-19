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
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const { toast } = useToast();

  // Reference to track if we need to request camera permission to get labels
  const cameraLabelsCheckedRef = useRef(false);

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

  // Check if device is likely a mobile device or a laptop/desktop
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator?.userAgent || '',
    );
  };

  // Check if the current device is mobile
  const isMobile = isMobileDevice();

  // Add this function inside your component before any hooks
  const checkCameraSupport = () => {
    // Check if we have getUserMedia API
    const hasUserMedia = !!navigator.mediaDevices?.getUserMedia;
    // Check if we're on HTTPS (required for camera in production)
    const isSecureContext = window.isSecureContext || process.env.NODE_ENV === 'development';

    return hasUserMedia && isSecureContext;
  };

  // Function to stop the camera stream
  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      for (const track of stream.getTracks()) {
        track.stop();
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  // Function to get available cameras and update camera selection UI
  const getAvailableCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.log('enumerateDevices() not supported.');
      setAvailableCameras([]);
      return [];
    }

    try {
      // Check if we need to request camera permissions to get labels
      // Using a ref instead of state dependency to prevent re-renders
      if (!cameraLabelsCheckedRef.current) {
        try {
          // Get temporary access to see labels (will be closed right after)
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
          for (const track of tempStream.getTracks()) {
            track.stop();
          }
          // Mark that we've checked for labels
          cameraLabelsCheckedRef.current = true;
        } catch (err) {
          console.log('Failed to get temporary camera access for labels:', err);
          // Continue anyway as we might still get devices without labels
        }
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');

      console.log(`Available cameras (${videoDevices.length}):`, videoDevices);

      // Store cameras in state
      setAvailableCameras(videoDevices);

      // Auto-select first camera if none is selected yet
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }

      return videoDevices;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      setAvailableCameras([]);
      return [];
    }
  }, [selectedCameraId]); // Added selectedCameraId as a dependency

  // Function to handle camera change
  const handleCameraChange = (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    stopCameraStream();
    setCurrentView('camera');
  };

  // Function to initialize the camera
  const initializeCamera = useCallback(async () => {
    if (currentView !== 'camera') return;

    setIsCameraInitializing(true);
    setCameraError(null);

    // Get available cameras
    await getAvailableCameras();

    try {
      // Use consistent camera constraints that prioritize width for consistent photo dimensions
      const initialConstraints = {
        audio: false,
        video: selectedCameraId
          ? {
              deviceId: { exact: selectedCameraId },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              // No aspect ratio constraint - allows the browser to adapt better to device orientation
            }
          : {
              facingMode: isMobile ? 'environment' : 'user',
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              // No aspect ratio constraint - allows the browser to adapt better to device orientation
            },
      };

      let streamInstance: MediaStream;

      try {
        // First attempt with preferred facing mode
        streamInstance = await navigator.mediaDevices.getUserMedia(initialConstraints);
      } catch (error) {
        console.log('First camera attempt failed, trying fallback option...', error);
        try {
          // If first attempt fails, try with the opposite camera
          streamInstance = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: isMobile ? 'user' : 'environment',
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              // Removed aspect ratio constraint for better adaptation to device orientation
            },
          });
        } catch (secondError) {
          console.log(
            'Second camera attempt failed, trying with basic constraints...',
            secondError,
          );
          // Final fallback with minimal constraints
          streamInstance = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = streamInstance;

        // Important: Add these event handlers to debug issues
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log(
              `Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
            );
            // Once metadata is loaded, explicitly call play()
            videoRef.current.play().catch((err) => {
              console.error('Error playing video:', err);
              setCameraError('Could not start video playback. Please try again.');
            });
          }
        };

        // Add error handler to the video element
        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          setCameraError('Video display error. Please try again or use upload instead.');
        };

        // Add additional check for video playing correctly
        videoRef.current.onplaying = () => {
          // Check if video dimensions are valid after a small delay
          setTimeout(() => {
            if (
              videoRef.current &&
              (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0)
            ) {
              console.error('Video dimensions are zero - camera may not be working properly');
              setCameraError(
                'Camera video stream appears to be empty. Try a different browser or device.',
              );
            }
          }, 1000); // Check after 1 second of playback
        };
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      const errorMessage =
        error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please enable it in your browser settings.'
          : error.name === 'NotReadableError'
            ? 'Camera is in use by another application. Please close other apps using the camera.'
            : `Could not access camera: ${error.message || error.name}. Ensure it's not in use by another app.`;
      setCameraError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Camera Access Issue',
        description: errorMessage,
      });
    } finally {
      setIsCameraInitializing(false);
    }
  }, [currentView, selectedCameraId, toast, isMobile, getAvailableCameras]);

  // Effect for handling the initial photo data URI
  useEffect(() => {
    if (initialPhotoDataUri) {
      setPhotoPreview(initialPhotoDataUri);
    } else {
      setPhotoPreview(null);
      setFileName(null);
    }
  }, [initialPhotoDataUri]);

  // Effect for initializing the camera when view changes
  useEffect(() => {
    if (currentView === 'camera') {
      initializeCamera();
    }

    return () => {
      // Cleanup function
      stopCameraStream();
    };
  }, [currentView, initializeCamera, stopCameraStream]);
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

      // Process the image to ensure consistent dimensions
      const processImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new globalThis.Image();
          img.onload = () => {
            // Get image dimensions
            const imageWidth = img.width;
            const imageHeight = img.height;

            // Use fixed width for consistency - 1280px width is standard
            const targetWidth = 1280;
            // Calculate height maintaining the original aspect ratio
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
              onPhotoCaptured(resizedDataUri);
            } else {
              // Fallback if canvas context fails
              setPhotoPreview(img.src);
              onPhotoCaptured(img.src);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      };

      processImageFile(file);
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
    if (!checkCameraSupport()) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description:
          'Your browser does not support camera access or it may be restricted in this context.',
      });
      return;
    }

    if (process.env.NODE_ENV !== 'development' && window.location.protocol !== 'https:') {
      toast({
        variant: 'destructive',
        title: 'Camera Access Error',
        description: 'Camera access requires HTTPS. Please use a secure connection.',
      });
      return;
    }

    setPhotoPreview(null);
    onPhotoCaptured('');
    setCurrentView('camera');
  };
  const handleSnapPhoto = () => {
    if (videoRef.current && canvasRef.current && hasCameraPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Use fixed dimensions for consistency - 1280px width is standard
      const targetWidth = 1280;
      // Calculate height maintaining the original aspect ratio
      const targetHeight = Math.round(targetWidth * (videoHeight / videoWidth));

      console.log(`Video dimensions: ${videoWidth}x${videoHeight}`);
      console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);

      // Set canvas dimensions to our target size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // Draw the video frame onto the canvas with our target dimensions
        context.drawImage(video, 0, 0, targetWidth, targetHeight);

        // Convert to data URI with quality setting (0.85 = 85% quality)
        const dataUri = canvas.toDataURL('image/jpeg', 0.85);
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
              className='h-full w-full object-cover'
              autoPlay
              playsInline
              muted
            />

            {/* Add an overlay during initialization for better UX */}
            {isCameraInitializing && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50'>
                <LoadingSpinner className='h-10 w-10 text-primary' />
                <p className='mt-2 text-sm font-medium text-white'>
                  {isCameraInitializing ? 'Starting camera...' : 'Waiting for video...'}
                </p>
              </div>
            )}

            {/* Add a camera shutter button overlay for better mobile experience */}
            <div className='absolute top-4 left-0 right-0 flex justify-center'>
              <Button
                onClick={handleSnapPhoto}
                size='icon'
                className='h-12 w-12 rounded-full bg-primary/90 hover:bg-primary'
                aria-label='Take photo'
              >
                <Camera className='h-6 w-6' />
              </Button>
            </div>
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

        {hasCameraPermission === true && availableCameras.length > 1 && (
          <div className='mb-2'>
            <Label htmlFor='camera-select' className='mb-1 block text-sm font-medium'>
              Select Camera
            </Label>
            <select
              id='camera-select'
              value={selectedCameraId || ''}
              onChange={(e) => handleCameraChange(e.target.value)}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              aria-label='Select camera'
            >
              {availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${camera.deviceId.substring(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>
        )}
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

      {!checkCameraSupport() && (
        <Alert variant='destructive' className='mt-4'>
          <AlertTitle>Camera Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support camera access. Please try using a different browser or
            upload a photo instead.
          </AlertDescription>
        </Alert>
      )}

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
