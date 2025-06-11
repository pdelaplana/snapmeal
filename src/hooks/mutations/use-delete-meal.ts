'use client';

import { deleteMeal } from '@/actions/delete-meal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for deleting a meal using React Query
 * Returns a mutation object with methods and state for deleting a meal
 */
export function useDeleteMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, mealId }: { userId: string; mealId: string }) => {
      return deleteMeal(userId, mealId);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the meals list query
      queryClient.invalidateQueries({
        queryKey: ['useFetchMealsByUserId', variables.userId],
      });

      // Remove the specific meal from the query cache
      queryClient.removeQueries({
        queryKey: ['meal', variables.userId, variables.mealId],
      });
    },
    onError: (error) => {
      console.error('Meal deletion failed:', error);
    },
  });
}
