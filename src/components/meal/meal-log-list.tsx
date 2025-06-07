
"use client";

import type { Meal } from '@/types';
import MealLogItem from './meal-log-item';
import { useMealLog } from '@/context/meal-log-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isToday, isYesterday, parseISO, compareDesc } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation'; // To detect if on shared log page
import { useSharedLog } from '@/app/view-shared-log/[sharerId]/page'; // Import the context for shared logs


export default function MealLogList() {
  const pathname = usePathname();
  const isViewingSharedLog = pathname.startsWith('/view-shared-log');
  
  // Conditionally use the appropriate hook
  const mainLog = useMealLog();
  let sharedLog;
  try {
    sharedLog = useSharedLog(); // This will throw error if not in SharedLogProvider
  } catch (e) {
    sharedLog = null; // Not in shared context
  }

  const { meals, loading } = isViewingSharedLog && sharedLog ? sharedLog : mainLog;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (meals.length === 0) {
    if (isViewingSharedLog) {
      return (
         <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-medium text-foreground">
            This user hasn't logged any meals or they are not shared.
          </p>
        </div>
      );
    }
    return (
      <div className="py-12 text-center">
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-foreground">No meals logged yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Start by adding a new meal!</p>
            <Link href="/add-meal" className="mt-6 inline-block">
                <Button variant="default" size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add First Meal
                </Button>
            </Link>
        </div>
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
      acc[dateKey].push(meal); 
      return acc;
    }, {} as Record<string, Meal[]>);

    // Ensure "Today" group always exists if not viewing shared log
    if (!isViewingSharedLog) {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        if (!grouped[todayKey]) {
          grouped[todayKey] = [];
        }
    }
    return grouped;
  };

  const groupedMeals = groupMealsByDay(meals);
  // Sort the date keys in descending order (most recent day first)
  const dateKeys = Object.keys(groupedMeals).sort((a, b) => compareDesc(parseISO(a), parseISO(b)));

  return (
    <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-220px)]"> {/* Adjusted height for shared view */}
      <div className="space-y-8 p-1 sm:p-4">
        {dateKeys.map((dateKey) => {
          const mealsForDay = groupedMeals[dateKey];
          // Ensure meals within the day are also sorted by time, most recent first
          mealsForDay.sort((a, b) => b.timestamp - a.timestamp);
          
          const dayDate = parseISO(dateKey);

          let dayLabel: string;
          if (isToday(dayDate)) {
            dayLabel = 'Today';
          } else if (isYesterday(dayDate)) {
            dayLabel = 'Yesterday';
          } else {
            dayLabel = format(dayDate, 'MMMM d, yyyy');
          }

          // Only render day sections if they are "Today" or have meals (unless viewing shared, then always show if meals exist)
          if ((!isViewingSharedLog && (dayLabel === 'Today' || mealsForDay.length > 0)) || (isViewingSharedLog && mealsForDay.length > 0) ) {
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
                  !isViewingSharedLog && dayLabel === 'Today' && ( // Only show "Add Meal" prompt for current user's log
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-8 text-center shadow-sm">
                      <p className="text-lg font-medium text-foreground">
                        No meals logged for Today.
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ready to log your first meal of the day?
                      </p>
                      <Link href="/add-meal" className="mt-4 inline-block">
                        <Button variant="default" size="lg">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Meal
                        </Button>
                      </Link>
                    </div>
                  )
                )}
              </div>
            );
          }
          return null; 
        })}
      </div>
    </ScrollArea>
  );
}

    