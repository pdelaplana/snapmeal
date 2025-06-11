'use client';

import {
  useAddMealMutation,
  useDeleteMealMutation,
  useUpdateMealMutation,
} from '@/hooks/mutations';
import { useFetchMealsByUserId } from '@/hooks/queries/use-fetch-meals-by-userid';
import type { Meal } from '@/types';
import type { AddMealDTO, UpdateMealDTO } from '@/types/meal';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

interface MealLogContextType {
  meals: Meal[];
  addMeal: (addMealDTO: AddMealDTO) => void;
  updateMeal: (updateMealDTO: UpdateMealDTO) => void;
  deleteMeal: (mealId: string) => void;
  getMealById: (id: string) => Meal | undefined;
  loading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const MealLogContext = createContext<MealLogContextType | undefined>(undefined);

export function MealLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const {
    data: meals,
    isLoading: initialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFetchMealsByUserId(user?.uid);

  const { mutateAsync: addMealAsync } = useAddMealMutation();
  const { mutateAsync: updateMealAsync } = useUpdateMealMutation();
  const { mutateAsync: deleteMealAsync } = useDeleteMealMutation();

  const addMeal = useCallback(
    async (addMealDTO: AddMealDTO) => {
      if (!user?.uid) {
        console.error('User not authenticated');
        return;
      }

      await addMealAsync({ userId: user.uid, addMealDTO });
    },
    [user, addMealAsync],
  );

  const updateMeal = useCallback(
    async (updatedMealData: UpdateMealDTO) => {
      if (!user?.uid) {
        console.error('User not authenticated');
        return;
      }

      await updateMealAsync({ userId: user.uid, updateMealDto: updatedMealData });
    },
    [user, updateMealAsync],
  );

  const deleteMeal = useCallback(
    (mealId: string) => {
      if (!user?.uid) {
        console.error('User not authenticated');
        return;
      }

      deleteMealAsync({ userId: user.uid, mealId });
    },
    [user, deleteMealAsync],
  );

  const getMealById = useCallback(
    (id: string): Meal | undefined => {
      return meals?.pages.flatMap((page) => page.meals).find((meal) => meal.id === id);
    },
    [meals],
  );

  return (
    <MealLogContext.Provider
      value={{
        meals: meals?.pages.flatMap((page) => page.meals) ?? [],
        addMeal,
        updateMeal,
        deleteMeal,
        getMealById,
        loading: initialLoading,
        fetchNextPage,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage: isFetchingNextPage ?? false,
      }}
    >
      {children}
    </MealLogContext.Provider>
  );
}

export const useMealLog = () => {
  const context = useContext(MealLogContext);
  if (context === undefined) {
    throw new Error('useMealLog must be used within a MealLogProvider');
  }
  return context;
};
