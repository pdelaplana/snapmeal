import { useFetchMealsByUserId } from '@/hooks/queries/use-fetch-meals-by-userid';
import type { Meal } from '@/types';
import { createContext, useContext } from 'react';

interface SharedLogContextValue {
  meals: Meal[];
  loading: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const SharedLogContext = createContext<SharedLogContextValue | undefined>(undefined);

export function SharedLogProvider({
  children,
  userId,
  loading,
}: { children: React.ReactNode; userId: string | undefined; loading: boolean }) {
  const {
    data: meals,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFetchMealsByUserId(userId);

  return (
    <SharedLogContext.Provider
      value={{
        meals: meals?.pages.flatMap((page) => page.meals) || [],
        loading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
      }}
    >
      {children}
    </SharedLogContext.Provider>
  );
}

export const useSharedLog = () => {
  const context = useContext(SharedLogContext);
  if (context === undefined) {
    throw new Error('useSharedLog must be used within a SharedLogProvider');
  }
  return context;
};
