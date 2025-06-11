'use client';

import { updateMeal } from '@/actions/update-meal';
import type { UpdateMealDTO } from '@/types/meal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for updating a meal using React Query
 * Returns a mutation object with methods and state for updating a meal
 */
export function useUpdateMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updateMealDto,
    }: { userId: string; updateMealDto: UpdateMealDTO }) => {
      return updateMeal(userId, updateMealDto);
    },
    onSuccess: (mealId, variables) => {
      // Invalidate and refetch queries that are affected by this update
      queryClient.invalidateQueries({ queryKey: ['useFetchMealsByUserId', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['meal', variables.userId, mealId] });
    },
  });
}
