'use client';

import AppLayout from '@/components/layout/app-layout';
import { LoadingSpinner } from '@/components/loading-spinner';
import MealForm from '@/components/meal/meal-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useMealLog } from '@/context/meal-log-context';
import { useToast } from '@/hooks/use-toast';
import type { Meal } from '@/types';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type PageState = 'loading' | 'loaded' | 'error';

export default function EditMealPage() {
  const router = useRouter();
  const params = useParams();
  const mealId = params.mealId as string;

  const { getMealById, updateMeal, deleteMeal, loading: mealLogLoading } = useMealLog();
  const { toast } = useToast();

  const [initialMealData, setInitialMealData] = useState<Meal | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mealLogLoading) {
      setPageState('loading');
      return;
    }

    if (!mealId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Meal ID is missing.',
      });
      router.replace('/dashboard');
      setPageState('error');
      return;
    }

    const mealToEdit = getMealById(mealId);

    if (mealToEdit) {
      setInitialMealData(mealToEdit);
      setPageState('loaded');
    } else {
      toast({
        variant: 'destructive',
        title: 'Meal not found',
        description: `The meal you're trying to edit doesn't exist or could not be loaded.`,
      });
      setPageState('error');
    }
  }, [mealLogLoading, mealId, getMealById, router, toast]);

  const handleSubmit = (mealData: Partial<Meal>) => {
    if (!initialMealData) return;

    setIsSubmitting(true);
    try {
      updateMeal({
        ...mealData,
        id: initialMealData.id,
      } as Meal);

      toast({
        title: 'Meal Updated!',
        description: 'Your meal log has been updated.',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'An error occurred while updating your meal. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = () => {
    if (!initialMealData) return;
    deleteMeal(initialMealData.id);
    toast({
      title: 'Meal Deleted',
      description: 'The meal has been removed from your log.',
    });
    router.push('/dashboard');
  };

  if (pageState === 'loading') {
    return (
      <AppLayout>
        <div className='flex min-h-[calc(100vh-150px)] items-center justify-center'>
          <LoadingSpinner className='h-10 w-10 text-primary' />
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'error' || !initialMealData) {
    return (
      <AppLayout>
        <div className='container mx-auto max-w-3xl px-4 py-8 text-center'>
          <p className='text-lg text-destructive'>Meal not found or an error occurred.</p>
          <Button onClick={() => router.push('/dashboard')} variant='link' className='mt-4'>
            <ChevronLeft className='mr-2 h-4 w-4' /> Go to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const DeleteButtonWrapper = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='lg' className='flex-1'>
          <Trash2 className='mr-2 h-5 w-5' />
          Delete Meal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this meal from your log.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMeal}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <AppLayout>
      <div className='container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h1 className='font-headline text-3xl font-bold text-foreground'>Edit Meal</h1>
          <p className='text-muted-foreground'>Update the details of your logged meal.</p>
        </div>

        <MealForm
          mode='edit'
          initialMeal={initialMealData}
          onSubmit={handleSubmit}
          submitButtonText='Update Meal'
          submitButtonIcon={<Save className='mr-2 h-5 w-5' />}
          extraActions={DeleteButtonWrapper}
          isProcessing={isSubmitting}
        />
      </div>
    </AppLayout>
  );
}
