'use client';

import { deleteAccount } from '@/actions/delete-account';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for deleting a user account using React Query
 * Returns a mutation object with methods and state for deleting an account
 */
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteAccount(userId);
    },
    onSuccess: () => {
      // Clear all queries when account is deleted
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Account deletion failed:', error);
    },
  });
}
