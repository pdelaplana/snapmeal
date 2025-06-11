'use client';

import AppLayout from '@/components/layout/app-layout';
import MealLogList from '@/components/meal/meal-log-list';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMealLog } from '@/context/meal-log-context';
import { isToday } from 'date-fns';
import { ChevronDown, LineChart, PlusCircle } from 'lucide-react'; // Added LineChart
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      const hasMealsToday = meals.some((meal) => isToday(new Date(meal.date)));
      setShowMainAddButton(hasMealsToday);
    }
  }, [meals, loading]);

  return (
    <AppLayout>
      <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <h1 className='font-headline text-3xl font-bold text-foreground'>Your Meal Log</h1>

          {/* Mobile view: Dropdown menu */}
          <div className='md:hidden w-full'>
            {!loading && (meals.length > 0 || showMainAddButton) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='w-full justify-between'>
                    Actions <ChevronDown className='h-4 w-4 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-[calc(100vw-2rem)]' // Make it nearly full width on mobile
                  align='start' // Changed from "end" to "start"
                  sideOffset={4} // Added small offset for better appearance
                >
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {meals.length > 0 && (
                    <DropdownMenuItem asChild>
                      <Link href='/summary' className='flex w-full items-center cursor-pointer'>
                        <LineChart className='mr-2 h-4 w-4' />
                        View Summary
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {showMainAddButton && (
                    <DropdownMenuItem asChild>
                      <Link href='/add-meal' className='flex w-full items-center cursor-pointer'>
                        <PlusCircle className='mr-2 h-4 w-4' />
                        Add New Meal
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Desktop view: Regular buttons */}
          <div className='hidden md:flex flex-row gap-2'>
            {!loading && meals.length > 0 && (
              <Link href='/summary'>
                <Button variant='outline' size='lg'>
                  <LineChart className='mr-2 h-5 w-5' />
                  View Summary
                </Button>
              </Link>
            )}
            {showMainAddButton && (
              <Link href='/add-meal'>
                <Button variant='default' size='lg'>
                  <PlusCircle className='mr-2 h-5 w-5' />
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
