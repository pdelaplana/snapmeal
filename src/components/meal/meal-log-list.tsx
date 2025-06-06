"use client";

import type { Meal } from '@/types';
import MealLogItem from './meal-log-item';
import { useMealLog } from '@/context/meal-log-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MealLogList() {
  const { meals, loading } = useMealLog();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No meals logged yet.</p>
        <p className="text-sm text-muted-foreground">Start by adding a new meal!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {meals.map((meal) => (
          <MealLogItem key={meal.id} meal={meal} />
        ))}
      </div>
    </ScrollArea>
  );
}
