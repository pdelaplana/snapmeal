'use client';

import { exportData } from '@/actions/export-data';
import { useMutation } from '@tanstack/react-query';

/**
 * Custom hook for exporting user data
 * Returns a mutation object with methods and state for exporting data
 */
export function useExportDataMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      return exportData(userId);
    },
    onSuccess: (data) => {
      console.log('Data export job queued successfully:', data);
      // Handle success (e.g., show toast notification)
    },
    onError: (error) => {
      console.error('Export data mutation failed:', error);
      // Handle error (e.g., show toast notification)
    },
  });
}
