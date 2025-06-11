'use client';

import { fetchMealById } from '@/actions/fetch-meal-by-id';
import type { Meal } from '@/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch a single meal by ID
 *
 * @param userId - The ID of the user who owns the meal
 * @param mealId - The ID of the meal to fetch
 * @returns React Query result with the meal data
 */
export function useFetchMealById(userId: string, mealId: string) {
  return useQuery<Meal>({
    queryKey: ['useFetchMealById', userId, mealId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      if (!mealId) throw new Error('Meal ID is required');

      return fetchMealById(userId, mealId);
    },
    // Only run the query if both IDs exist
    // staleTime is configured in QueryClient default options
    retry: (failureCount, error) => {
      // Don't retry if the meal was not found (404-like error)
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      // Otherwise retry up to 2 times
      return failureCount < 2;
    },
  });
}
