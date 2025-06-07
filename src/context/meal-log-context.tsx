
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Meal } from '@/types';

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
        // Ensure recognizedItems defaults to null if not present for older items
        const parsedMeals = JSON.parse(storedMeals).map((meal: any) => ({
          ...meal,
          recognizedItems: meal.recognizedItems ?? null,
        }));
        setMeals(parsedMeals);
      }
    } catch (error) {
      console.error("Failed to load meals from local storage", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(MEAL_LOG_STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error("Failed to save meals to local storage", error);
      }
    }
  }, [meals, loading]);

  const addMeal = useCallback((newMealData: Omit<Meal, 'id'>) => {
    const newMealWithId: Meal = {
      ...newMealData,
      id: crypto.randomUUID(),
      recognizedItems: newMealData.recognizedItems ?? null, // Ensure it's part of the new meal
    };
    setMeals(prevMeals => [newMealWithId, ...prevMeals].sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const updateMeal = useCallback((mealId: string, updatedMealData: Omit<Meal, 'id'>) => {
    setMeals(prevMeals =>
      prevMeals.map(meal =>
        meal.id === mealId ? { id: meal.id, ...updatedMealData, recognizedItems: updatedMealData.recognizedItems ?? null } : meal
      ).sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  const deleteMeal = useCallback((mealId: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
  }, []);

  const getMealById = useCallback((id: string): Meal | undefined => {
    return meals.find(meal => meal.id === id);
  }, [meals]);
  
  useEffect(() => {
    if (meals.length > 0) {
      const sortedMeals = [...meals].sort((a, b) => b.timestamp - a.timestamp);
      if (JSON.stringify(sortedMeals) !== JSON.stringify(meals)) {
        setMeals(sortedMeals);
      }
    }
  }, [meals]);


  return (
    <MealLogContext.Provider value={{ meals, addMeal, updateMeal, deleteMeal, getMealById, loading }}>
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
