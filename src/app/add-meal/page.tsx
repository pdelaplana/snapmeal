'use client';

import AppLayout from '@/components/layout/app-layout';
import MealForm from '@/components/meal/meal-form';
import { useMealLog } from '@/context/meal-log-context';
import { useToast } from '@/hooks/use-toast';
import type { Meal } from '@/types';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddMealPage() {
  const { addMeal } = useMealLog();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (mealData: Partial<Meal>) => {
    setIsSubmitting(true);
    try {
      addMeal(mealData as Meal);
      toast({
        title: 'Meal Logged!',
        description: 'Your meal has been added to your log.',
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Log Meal',
        description: 'An error occurred while logging your meal. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className='container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h1 className='font-headline text-3xl font-bold text-foreground'>Add New Meal</h1>
          <p className='text-muted-foreground'>Capture your meal, get estimates, and log it.</p>
        </div>

        <MealForm
          mode='add'
          onSubmit={handleSubmit}
          submitButtonText='Log This Meal'
          submitButtonIcon={<CheckCircle className='mr-2 h-5 w-5' />}
          isProcessing={isSubmitting}
        />
      </div>
    </AppLayout>
  );
}
