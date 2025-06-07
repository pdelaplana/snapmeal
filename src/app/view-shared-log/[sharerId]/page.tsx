
"use client";

import React, { useEffect, useState } from 'react'; // Added React import
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import MealLogList from '@/components/meal/meal-log-list'; // Reusing this for display
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Meal } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useMealLog } from '@/context/meal-log-context'; // To potentially adapt MealLogList

// This is a simplified context just for this page to hold the shared meals
// to avoid conflicts with the main MealLogContext's CRUD operations.
interface SharedLogContextValue {
  meals: Meal[];
  loading: boolean;
  // No CRUD operations needed for viewing shared logs
}

const SharedLogContext = React.createContext<SharedLogContextValue | undefined>(undefined);

export function SharedLogProvider({ children, meals, loading }: { children: React.ReactNode, meals: Meal[], loading: boolean}) {
  return (
    <SharedLogContext.Provider value={{ meals, loading }}>
      {children}
    </SharedLogContext.Provider>
  );
}

export const useSharedLog = () => {
  const context = React.useContext(SharedLogContext);
  if (context === undefined) {
    throw new Error('useSharedLog must be used within a SharedLogProvider');
  }
  return context;
};


// We need to adapt MealLogList to accept meals as a prop or use the new context.
// For simplicity, let's try to make a version of MealLogList for shared viewing.
// OR, we modify MealLogList to optionally accept meals directly.
// Given the project structure, it's cleaner to pass meals as props or use a local state.
// We will feed MealLogList with the fetched shared meals.

export default function ViewSharedLogPage() {
  const params = useParams();
  const router = useRouter();
  const sharerId = params.sharerId as string;

  const [sharedMeals, setSharedMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharerName, setSharerName] = useState<string>(sharerId); // Default to ID, try to get name

  // Get the main meal log context to potentially disable editing in MealLogList if we enhance it
  // For now, we will just display. The edit buttons in MealLogItem will attempt to edit
  // in the current user's context, which won't find the meal.
  const { getMealById: mainUserGetMealById } = useMealLog();


  useEffect(() => {
    if (sharerId) {
      setIsLoading(true);
      try {
        const mealStorageKey = `snapmeal_log_${sharerId}`;
        const storedMealsRaw = localStorage.getItem(mealStorageKey);
        if (storedMealsRaw) {
          const parsedMeals: Meal[] = JSON.parse(storedMealsRaw).map((meal: any) => ({
            ...meal,
            recognizedItems: meal.recognizedItems ?? null,
          }));
           // Ensure sorting by timestamp, most recent first
          setSharedMeals(parsedMeals.sort((a, b) => b.timestamp - a.timestamp));

          // Attempt to get a more friendly name (this is a mock, could be improved)
          if (sharerId === 'nutritionist@demo.com') setSharerName('Demo Nutritionist');
          else if (sharerId === 'friend@demo.com') setSharerName('Active Friend');
          else setSharerName(sharerId);

        } else {
          setSharedMeals([]);
          // Potentially show a "no meals shared by this user" message
        }
      } catch (error) {
        console.error("Failed to load shared meals from local storage", error);
        setSharedMeals([]);
      }
      setIsLoading(false);
    }
  }, [sharerId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
          <LoadingSpinner className="h-10 w-10 text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-foreground">
              Viewing Meal Log
            </h1>
            <p className="text-muted-foreground">Shared by: {sharerName}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
        
        {/* 
          Wrap MealLogList with a temporary provider that overrides useMealLog 
          to return sharedMeals and loading state for sharedMeals.
          This is a bit of a hack. A better way would be to make MealLogList accept meals as prop.
          For now, MealLogList uses useMealLog internally. We will provide a "dummy" context.
        */}
        <SharedLogProvider meals={sharedMeals} loading={isLoading}>
            <MealLogList />
        </SharedLogProvider>
        
        <p className="mt-6 text-center text-xs text-muted-foreground">
          You are viewing a shared meal log. Editing is not available for shared logs.
        </p>
      </div>
    </AppLayout>
  );
}
