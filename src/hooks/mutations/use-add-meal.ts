'use client';

import { addMeal } from '@/actions/add-meal';
import type { AddMealDTO } from '@/types/meal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for adding a new meal to Firestore
 * Returns a mutation object with methods and state for adding a meal
 */
export function useAddMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, addMealDTO }: { userId: string; addMealDTO: AddMealDTO }) => {
      return addMeal(userId, addMealDTO);
    },
    onSuccess: (newMealId, variables) => {
      // Invalidate and refetch queries that are affected by the mutation
      queryClient.invalidateQueries({ queryKey: ['useFetchMealsByUserId', variables.userId] });
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
      // Handle error (e.g., show toast notification)
    },
  });
}
