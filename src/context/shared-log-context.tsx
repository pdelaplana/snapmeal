import type { Meal } from '@/types';
import { createContext, useContext } from 'react';

interface SharedLogContextValue {
  meals: Meal[];
  loading: boolean;
}

const SharedLogContext = createContext<SharedLogContextValue | undefined>(undefined);

export function SharedLogProvider({
  children,
  meals,
  loading,
}: { children: React.ReactNode; meals: Meal[]; loading: boolean }) {
  return (
    <SharedLogContext.Provider value={{ meals, loading }}>{children}</SharedLogContext.Provider>
  );
}

export const useSharedLog = () => {
  const context = useContext(SharedLogContext);
  if (context === undefined) {
    throw new Error('useSharedLog must be used within a SharedLogProvider');
  }
  return context;
};
