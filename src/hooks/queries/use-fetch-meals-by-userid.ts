'use client';

import { fetchMealsByUserId } from '@/actions/fetch-meals-by-userid';
import type { Meal } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

interface MealPage {
  meals: Meal[];
  lastDocId: string | null;
  lastCursor: string | null;
}

/**
 * Custom hook that uses infinite query to fetch paginated meals for a user
 */
export function useFetchMealsByUserId(userId: string | undefined, limit = 10) {
  return useInfiniteQuery<MealPage>({
    queryKey: ['useFetchMealsByUserId', userId],

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    queryFn: async (pageParam: any) => {
      if (!userId) throw new Error('User ID is required');
      return fetchMealsByUserId(userId, limit, pageParam);
    },

    initialPageParam: { docId: null, date: null },

    getNextPageParam: (lastPage) => {
      if (!lastPage.lastDocId || !lastPage.lastCursor) return null;
      return {
        docId: lastPage.lastDocId,
        date: lastPage.lastCursor,
      };
    },

    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
