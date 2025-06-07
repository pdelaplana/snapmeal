
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Meal } from '@/types';

interface MealLogContextType {
  meals: Meal[];
  addMeal: (newMealData: Omit<Meal, 'id' | 'timestamp'>) => void;
  updateMeal: (mealId: string, updatedMealData: Omit<Meal, 'id' | 'timestamp'>) => void;
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
        setMeals(JSON.parse(storedMeals));
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

  const addMeal = useCallback((newMealData: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...newMealData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setMeals(prevMeals => [newMeal, ...prevMeals].sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const updateMeal = useCallback((mealId: string, updatedMealData: Omit<Meal, 'id' | 'timestamp'>) => {
    setMeals(prevMeals =>
      prevMeals.map(meal =>
        meal.id === mealId ? { ...meal, ...updatedMealData, timestamp: Date.now() } : meal
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
