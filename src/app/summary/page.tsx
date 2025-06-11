'use client';

import AppLayout from '@/components/layout/app-layout';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMealLog } from '@/context/meal-log-context';
import type { Meal } from '@/types';
import { compareDesc, endOfWeek, format, getDaysInMonth, parseISO, startOfWeek } from 'date-fns';
import { CalendarDays, CalendarIcon, CalendarRange, Scale, Utensils, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

interface NutrientSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
}

interface DailySummaryItem extends NutrientSummary {
  date: string;
  formattedDate: string;
}

interface WeeklySummaryItem extends NutrientSummary {
  weekKey: string;
  weekLabel: string;
  avgDailyCalories: number;
}

interface MonthlySummaryItem extends NutrientSummary {
  monthKey: string;
  monthLabel: string;
  avgDailyCalories: number;
}

const initialNutrientSummary = (): NutrientSummary => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  mealCount: 0,
});

export default function SummaryPage() {
  const { meals, loading: mealsLoading } = useMealLog();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dailySummaries: DailySummaryItem[] = useMemo(() => {
    if (mealsLoading || !meals || meals.length === 0) return [];

    const summaries: Record<string, DailySummaryItem> = {};

    for (const meal of meals) {
      const dateKey = format(new Date(meal.date), 'yyyy-MM-dd');
      if (!summaries[dateKey]) {
        summaries[dateKey] = {
          date: dateKey,
          formattedDate: format(new Date(meal.date), 'MMMM d, yyyy (EEEE)'),
          ...initialNutrientSummary(),
        };
      }
      summaries[dateKey].calories += meal.estimatedCalories ?? 0;
      summaries[dateKey].protein += meal.protein ?? 0;
      summaries[dateKey].carbs += meal.carbs ?? 0;
      summaries[dateKey].fat += meal.fat ?? 0;
      summaries[dateKey].mealCount += 1;
    }

    return Object.values(summaries).sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [meals, mealsLoading]);

  const weeklySummaries: WeeklySummaryItem[] = useMemo(() => {
    if (mealsLoading || !meals || meals.length === 0) return [];
    const summaries: Record<string, WeeklySummaryItem> = {};

    for (const meal of meals) {
      const mealDate = new Date(meal.date);
      const sow = startOfWeek(mealDate, { weekStartsOn: 1 });
      const eow = endOfWeek(mealDate, { weekStartsOn: 1 });
      const weekKey = format(sow, 'yyyy-MM-dd');

      if (!summaries[weekKey]) {
        summaries[weekKey] = {
          weekKey,
          weekLabel: `${format(sow, 'MMM d')} - ${format(eow, 'MMM d, yyyy')}`,
          ...initialNutrientSummary(),
          avgDailyCalories: 0,
        };
      }
      summaries[weekKey].calories += meal.estimatedCalories ?? 0;
      summaries[weekKey].protein += meal.protein ?? 0;
      summaries[weekKey].carbs += meal.carbs ?? 0;
      summaries[weekKey].fat += meal.fat ?? 0;
      summaries[weekKey].mealCount += 1;
    }

    return Object.values(summaries)
      .map((s) => ({
        ...s,
        avgDailyCalories: s.calories > 0 ? s.calories / 7 : 0,
      }))
      .sort((a, b) => compareDesc(parseISO(a.weekKey), parseISO(b.weekKey)));
  }, [meals, mealsLoading]);

  const monthlySummaries: MonthlySummaryItem[] = useMemo(() => {
    if (mealsLoading || !meals || meals.length === 0) return [];
    const summaries: Record<string, MonthlySummaryItem> = {};

    for (const meal of meals) {
      const mealDate = new Date(meal.date);
      const monthKey = format(mealDate, 'yyyy-MM');

      if (!summaries[monthKey]) {
        summaries[monthKey] = {
          monthKey,
          monthLabel: format(mealDate, 'MMMM yyyy'),
          ...initialNutrientSummary(),
          avgDailyCalories: 0,
        };
      }
      summaries[monthKey].calories += meal.estimatedCalories ?? 0;
      summaries[monthKey].protein += meal.protein ?? 0;
      summaries[monthKey].carbs += meal.carbs ?? 0;
      summaries[monthKey].fat += meal.fat ?? 0;
      summaries[monthKey].mealCount += 1;
    }

    return Object.values(summaries)
      .map((s) => {
        const daysInMonthVal = getDaysInMonth(parseISO(`${s.monthKey}-01`));
        return {
          ...s,
          avgDailyCalories: s.calories > 0 ? s.calories / daysInMonthVal : 0,
        };
      })
      .sort((a, b) => compareDesc(parseISO(`${a.monthKey}-01`), parseISO(`${b.monthKey}-01`)));
  }, [meals, mealsLoading]);

  const renderSummaryCard = (item: DailySummaryItem | WeeklySummaryItem | MonthlySummaryItem) => {
    const title =
      (item as DailySummaryItem).formattedDate ||
      (item as WeeklySummaryItem).weekLabel ||
      (item as MonthlySummaryItem).monthLabel;
    const avgCalories = (item as WeeklySummaryItem | MonthlySummaryItem).avgDailyCalories;

    return (
      <Card
        key={
          (item as DailySummaryItem).date ||
          (item as WeeklySummaryItem).weekKey ||
          (item as MonthlySummaryItem).monthKey
        }
        className='shadow-md'
      >
        <CardHeader>
          <CardTitle className='text-lg'>{title}</CardTitle>
          <CardDescription className='flex items-center'>
            <Utensils className='mr-2 h-4 w-4 text-muted-foreground' />
            {item.mealCount} meal(s) logged
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center'>
              <Zap className='mr-2 h-4 w-4 text-primary' />
              Total Calories:
            </span>
            <span className='font-semibold text-primary'>{item.calories.toFixed(0)} kcal</span>
          </div>
          {avgCalories !== undefined && avgCalories > 0 && (
            <div className='flex items-center justify-between'>
              <span className='flex items-center'>
                <Zap className='mr-2 h-4 w-4 text-primary/70' />
                Avg Daily Calories:
              </span>
              <span className='font-semibold'>{avgCalories.toFixed(0)} kcal</span>
            </div>
          )}
          <div>
            <p className='flex items-center font-medium mb-1'>
              <Scale className='mr-2 h-4 w-4 text-primary' />
              Macros:
            </p>
            <div className='pl-6 space-y-1 text-muted-foreground'>
              <div className='flex justify-between'>
                <span>Protein:</span>{' '}
                <span className='font-medium text-foreground'>{item.protein.toFixed(1)}g</span>
              </div>
              <div className='flex justify-between'>
                <span>Carbs:</span>{' '}
                <span className='font-medium text-foreground'>{item.carbs.toFixed(1)}g</span>
              </div>
              <div className='flex justify-between'>
                <span>Fat:</span>{' '}
                <span className='font-medium text-foreground'>{item.fat.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (mealsLoading) {
    return (
      <AppLayout>
        <div className='flex min-h-[calc(100vh-150px)] items-center justify-center'>
          <LoadingSpinner className='h-10 w-10 text-primary' />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h1 className='font-headline text-3xl font-bold text-foreground'>Nutritional Summary</h1>
          <p className='text-muted-foreground'>Review your calorie and macro intake over time.</p>
        </div>

        <Tabs
          value={activeTab}
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          onValueChange={(value) => setActiveTab(value as any)}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-3 mb-6'>
            <TabsTrigger value='daily'>
              <CalendarDays className='mr-2 h-4 w-4' />
              Daily
            </TabsTrigger>
            <TabsTrigger value='weekly'>
              <CalendarRange className='mr-2 h-4 w-4' />
              Weekly
            </TabsTrigger>
            <TabsTrigger value='monthly'>
              <CalendarIcon className='mr-2 h-4 w-4' />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value='daily'>
            {dailySummaries.length > 0 ? (
              <div className='space-y-6'>{dailySummaries.map(renderSummaryCard)}</div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                No daily summary data available.
              </p>
            )}
          </TabsContent>
          <TabsContent value='weekly'>
            {weeklySummaries.length > 0 ? (
              <div className='space-y-6'>{weeklySummaries.map(renderSummaryCard)}</div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                No weekly summary data available.
              </p>
            )}
          </TabsContent>
          <TabsContent value='monthly'>
            {monthlySummaries.length > 0 ? (
              <div className='space-y-6'>{monthlySummaries.map(renderSummaryCard)}</div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                No monthly summary data available.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
