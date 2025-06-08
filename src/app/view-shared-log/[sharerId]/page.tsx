"use client";

import AppLayout from "@/components/layout/app-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
import MealLogList from "@/components/meal/meal-log-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMealLog } from "@/context/meal-log-context";
import { config } from "@/lib/config"; // Import config for feature flags
import type { Meal } from "@/types";
import { ChevronLeft, Construction } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SharedLogContextValue {
  meals: Meal[];
  loading: boolean;
}

const SharedLogContext = React.createContext<SharedLogContextValue | undefined>(
  undefined,
);

export function SharedLogProvider({
  children,
  meals,
  loading,
}: { children: React.ReactNode; meals: Meal[]; loading: boolean }) {
  return (
    <SharedLogContext.Provider value={{ meals, loading }}>
      {children}
    </SharedLogContext.Provider>
  );
}

export const useSharedLog = () => {
  const context = React.useContext(SharedLogContext);
  if (context === undefined) {
    throw new Error("useSharedLog must be used within a SharedLogProvider");
  }
  return context;
};

export default function ViewSharedLogPage() {
  const params = useParams();
  const router = useRouter();
  const sharerId = params.sharerId as string;

  const [sharedMeals, setSharedMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharerName, setSharerName] = useState<string>(sharerId);

  const { getMealById: mainUserGetMealById } = useMealLog();

  useEffect(() => {
    if (!config.features.enableSharing) {
      setIsLoading(false);
      return;
    }

    if (sharerId) {
      setIsLoading(true);
      try {
        const mealStorageKey = `snapmeal_log_${sharerId}`;
        const storedMealsRaw = localStorage.getItem(mealStorageKey);
        if (storedMealsRaw) {
          const parsedMeals: Meal[] = JSON.parse(storedMealsRaw).map(
            (meal: any) => ({
              ...meal,
              recognizedItems: meal.recognizedItems ?? null,
            }),
          );
          setSharedMeals(parsedMeals.sort((a, b) => b.timestamp - a.timestamp));

          if (sharerId === "nutritionist@demo.com")
            setSharerName("Demo Nutritionist");
          else if (sharerId === "friend@demo.com")
            setSharerName("Active Friend");
          else setSharerName(sharerId);
        } else {
          setSharedMeals([]);
        }
      } catch (error) {
        console.error("Failed to load shared meals from local storage", error);
        setSharedMeals([]);
      }
      setIsLoading(false);
    }
  }, [sharerId]);

  if (!config.features.enableSharing) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 text-center">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-xl">
                <Construction className="mr-3 h-8 w-8 text-primary" />
                Sharing Feature Not Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The meal log sharing functionality is currently under
                development and not available.
              </p>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mt-6"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
            Back
          </Button>
        </div>

        <SharedLogProvider meals={sharedMeals} loading={isLoading}>
          <MealLogList />
        </SharedLogProvider>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You are viewing a shared meal log. Editing is not available for shared
          logs.
        </p>
      </div>
    </AppLayout>
  );
}
