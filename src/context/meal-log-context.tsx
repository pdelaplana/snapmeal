"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Meal } from '@/types';

interface MealLogContextType {
  meals: Meal[];
  addMeal: (newMealData: Omit<Meal, 'id' | 'timestamp'>) => void;
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
    if (!loading) { // Only save to localStorage after initial load
      try {
        localStorage.setItem(MEAL_LOG_STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error("Failed to save meals to local storage", error);
      }
    }
  }, [meals, loading]);

  const addMeal = (newMealData: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...newMealData,
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9), // simple unique id
      timestamp: Date.now(),
    };
    setMeals(prevMeals => [newMeal, ...prevMeals]);
  };

  return (
    <MealLogContext.Provider value={{ meals, addMeal, loading }}>
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
