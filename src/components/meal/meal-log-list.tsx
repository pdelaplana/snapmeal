
"use client";

import type { Meal } from '@/types';
import MealLogItem from './meal-log-item';
import { useMealLog } from '@/context/meal-log-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isToday, isYesterday, parseISO, compareDesc } from 'date-fns';

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
    // This message is for when there are no meals AT ALL.
    // The "Today" specific message will be handled below if there are meals, but none for today.
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No meals logged yet.</p>
        <p className="text-sm text-muted-foreground">Start by adding a new meal!</p>
      </div>
    );
  }

  // Group meals by day
  const groupMealsByDay = (mealsToGroup: Meal[]): Record<string, Meal[]> => {
    const grouped = mealsToGroup.reduce((acc, meal) => {
      const dateKey = format(new Date(meal.timestamp), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meal); // Meals are already sorted by timestamp in context
      return acc;
    }, {} as Record<string, Meal[]>);

    // Ensure "Today" group always exists
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    if (!grouped[todayKey]) {
      grouped[todayKey] = [];
    }
    return grouped;
  };

  const groupedMeals = groupMealsByDay(meals);
  // Sort the date keys in descending order (most recent day first)
  const dateKeys = Object.keys(groupedMeals).sort((a, b) => compareDesc(parseISO(a), parseISO(b)));

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-8 p-4">
        {dateKeys.map((dateKey) => {
          const mealsForDay = groupedMeals[dateKey];
          const dayDate = parseISO(dateKey);

          let dayLabel: string;
          if (isToday(dayDate)) {
            dayLabel = 'Today';
          } else if (isYesterday(dayDate)) {
            dayLabel = 'Yesterday';
          } else {
            dayLabel = format(dayDate, 'MMMM d, yyyy');
          }

          // Only render day sections if they are "Today" or have meals.
          if (dayLabel === 'Today' || mealsForDay.length > 0) {
            return (
              <div key={dateKey}>
                <h2 className="mb-4 pl-1 text-xl font-semibold text-foreground md:text-2xl">
                  {dayLabel}
                </h2>
                {mealsForDay.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mealsForDay.map((meal) => (
                      <MealLogItem key={meal.id} meal={meal} />
                    ))}
                  </div>
                ) : (
                  // This message is specifically for an empty "Today" group when other meals might exist on other days.
                  dayLabel === 'Today' && (
                    <p className="pl-1 text-sm text-muted-foreground">
                      No meals logged for Today.
                    </p>
                  )
                )}
              </div>
            );
          }
          return null; // Don't render empty past day sections
        })}
      </div>
    </ScrollArea>
  );
}
