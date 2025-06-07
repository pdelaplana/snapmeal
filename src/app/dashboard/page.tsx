
"use client";

import { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/app-layout";
import MealLogList from "@/components/meal/meal-log-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, LineChart } from "lucide-react"; // Added LineChart
import { useMealLog } from '@/context/meal-log-context';
import { isToday } from 'date-fns';

export default function DashboardPage() {
  const { meals, loading } = useMealLog();
  const [showMainAddButton, setShowMainAddButton] = useState(false);

  useEffect(() => {
    if (loading) {
      setShowMainAddButton(false);
      return;
    }

    if (meals.length === 0) {
      setShowMainAddButton(false);
    } else {
      const hasMealsToday = meals.some(meal => isToday(new Date(meal.timestamp)));
      setShowMainAddButton(hasMealsToday);
    }
  }, [meals, loading]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Your Meal Log
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            {!loading && meals.length > 0 && (
              <Link href="/summary">
                <Button variant="outline" size="lg">
                  <LineChart className="mr-2 h-5 w-5" />
                  View Summary
                </Button>
              </Link>
            )}
            {showMainAddButton && (
              <Link href="/add-meal">
                <Button variant="default" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Meal
                </Button>
              </Link>
            )}
          </div>
        </div>
        <MealLogList />
      </div>
    </AppLayout>
  );
}
