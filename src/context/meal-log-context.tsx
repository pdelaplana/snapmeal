'use client';

import type { Meal } from '@/types';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface MealLogContextType {
  meals: Meal[];
  addMeal: (newMealData: Omit<Meal, 'id'>) => void;
  updateMeal: (mealId: string, updatedMealData: Omit<Meal, 'id'>) => void;
  deleteMeal: (mealId: string) => void;
  getMealById: (id: string) => Meal | undefined;
  loading: boolean;
}

const MealLogContext = createContext<MealLogContextType | undefined>(undefined);

const MEAL_LOG_STORAGE_KEY = 'snapmeal_log';

export function MealLogProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedMeals = localStorage.getItem(MEAL_LOG_STORAGE_KEY);
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals).map((meal: any) => ({
          ...meal,
          recognizedItems: meal.recognizedItems ?? null,
        }));
        // Sort meals when loading from localStorage
        setMeals(parsedMeals.sort((a: Meal, b: Meal) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to load meals from local storage', error);
    }
    setLoading(false);
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (!loading) {
      try {
        // Meals should already be sorted when they get here
        localStorage.setItem(MEAL_LOG_STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error('Failed to save meals to local storage', error);
      }
    }
  }, [meals, loading]);

  const addMeal = useCallback((newMealData: Omit<Meal, 'id'>) => {
    const newMealWithId: Meal = {
      ...newMealData,
      id: crypto.randomUUID(),
      recognizedItems: newMealData.recognizedItems ?? null,
    };
    setMeals((prevMeals) =>
      [...prevMeals, newMealWithId].sort((a, b) => b.timestamp - a.timestamp),
    );
  }, []);

  const updateMeal = useCallback((mealId: string, updatedMealData: Omit<Meal, 'id'>) => {
    setMeals((prevMeals) =>
      prevMeals
        .map((meal) =>
          meal.id === mealId
            ? {
                id: meal.id,
                ...updatedMealData,
                recognizedItems: updatedMealData.recognizedItems ?? null,
              }
            : meal,
        )
        .sort((a, b) => b.timestamp - a.timestamp),
    );
  }, []);

  const deleteMeal = useCallback((mealId: string) => {
    setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== mealId));
    // No need to re-sort here as filter preserves order and original list was sorted
  }, []);

  const getMealById = useCallback(
    (id: string): Meal | undefined => {
      return meals.find((meal) => meal.id === id);
    },
    [meals],
  );

  // Removed the problematic useEffect that was causing re-render loops.
  // Sorting is now handled directly within addMeal, updateMeal, and initial load.

  return (
    <MealLogContext.Provider
      value={{ meals, addMeal, updateMeal, deleteMeal, getMealById, loading }}
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
