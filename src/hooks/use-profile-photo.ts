'use client';

import { useAuth } from '@/context/auth-context';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UploadPhotoOptions {
  folder?: string;
  maxSizeBytes?: number;
  quality?: number;
  generateThumbnail?: boolean;
}

interface UseProfilePhotoReturn {
  uploadPhoto: (userId: string, dataUri: string, options?: UploadPhotoOptions) => Promise<string>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for uploading photos to Firebase Storage
 *
 * @returns Functions and state for managing photo uploads
 */
export function useProfilePhoto(): UseProfilePhotoReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Reset upload state
   */
  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  };

  /**
   * Compresses and optimizes an image data URI
   *
   * @param dataUri - The data URI of the image to compress
   * @param maxWidth - Maximum width of the compressed image
   * @param quality - Quality of the compressed image (0-1)
   * @returns A promise that resolves to a compressed data URI
   */
  const compressImage = async (
    dataUri: string,
    maxWidth = 1200,
    quality = 0.85,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.floor((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUri = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUri);
      };
      img.onerror = () => reject(new Error('Error loading image for compression'));
      img.src = dataUri;
    });
  };

  /**
   * Upload a photo to Firebase Storage
   *
   * @param dataUri - The data URI of the photo to upload
   * @param options - Upload options
   * @returns A promise that resolves to the download URL of the uploaded photo
   */
  const uploadPhoto = async (
    userId: string,
    dataUri: string,
    options: UploadPhotoOptions = {},
  ): Promise<string> => {
    if (!dataUri) {
      throw new Error('No photo data provided');
    }

    const {
      folder = 'profile_photos',
      maxSizeBytes = 5 * 1024 * 1024, // 5MB default
      quality = 0.85,
      generateThumbnail = true,
    } = options;

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Check data URI size (rough estimation)
      const estimatedBytes = Math.ceil((dataUri.length * 3) / 4) * 0.75;
      if (estimatedBytes > maxSizeBytes) {
        throw new Error(`Image exceeds maximum size of ${maxSizeBytes / (1024 * 1024)}MB`);
      }

      // Generate unique filename with user ID prefix for security
      const fileName = `${uuidv4()}.jpg`;
      const fullPath = `users/${userId}/${folder}/${fileName}`;

      // Compress the image
      const compressedDataUri = await compressImage(dataUri, 1200, quality);

      // Extract base64 data part
      const base64Data = compressedDataUri.split(',')[1];

      // Create storage reference
      const storageRef = ref(storage, fullPath);

      // Upload the image
      setProgress(10);
      const snapshot = await uploadString(storageRef, base64Data, 'base64', {
        contentType: 'image/jpeg',
      });

      setProgress(70);

      // Generate and upload thumbnail if requested
      if (generateThumbnail) {
        const thumbnailDataUri = await compressImage(compressedDataUri, 300, 0.7);
        const thumbnailBase64 = thumbnailDataUri.split(',')[1];
        const thumbnailPath = `users/${userId}/${folder}/thumbnails/${fileName}`;
        const thumbnailRef = ref(storage, thumbnailPath);

        await uploadString(thumbnailRef, thumbnailBase64, 'base64', {
          contentType: 'image/jpeg',
        });

        setProgress(90);
      }

      // Get download URL of the main image
      const downloadURL = await getDownloadURL(snapshot.ref);

      setProgress(100);
      setIsUploading(false);
      return downloadURL;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown upload error');
      setError(error);
      setIsUploading(false);
      throw error;
    }
  };

  return {
    uploadPhoto,
    isUploading,
    progress,
    error,
    reset,
  };
}
