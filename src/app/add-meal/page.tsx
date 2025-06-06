"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import MealCapture from '@/components/meal/meal-capture';
import MealEstimation from '@/components/meal/meal-estimation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { estimateCaloriesMacros } from '@/ai/flows/estimate-calories-macros';
import type { EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { useToast } from '@/hooks/use-toast';
import { useMealLog } from '@/context/meal-log-context';
import { useRouter } from 'next/navigation';
import { Wand2, CheckCircle, Loader2 } from 'lucide-react';

export default function AddMealPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [estimation, setEstimation] = useState<EstimateCaloriesMacrosOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const { addMeal } = useMealLog();
  const router = useRouter();

  const handlePhotoCaptured = (dataUri: string) => {
    setPhotoDataUri(dataUri);
    setEstimation(null); // Clear previous estimation if new photo is captured
  };

  const handleEstimate = async () => {
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'No Photo', description: 'Please capture or upload a photo first.' });
      return;
    }
    setIsLoading(true);
    setEstimation(null);
    try {
      const result = await estimateCaloriesMacros({ photoDataUri });
      setEstimation(result);
      toast({ title: 'Estimation Complete', description: 'Nutritional values have been estimated.' });
    } catch (error) {
      console.error('Error estimating calories:', error);
      toast({ variant: 'destructive', title: 'Estimation Failed', description: 'Could not estimate nutrition. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogMeal = () => {
    if (!photoDataUri || !estimation) {
      toast({ variant: 'destructive', title: 'Cannot Log Meal', description: 'Please capture a photo and get an estimation first.' });
      return;
    }
    addMeal({
      photoDataUri,
      estimatedCalories: estimation.estimatedCalories,
      protein: estimation.macroBreakdown.protein,
      carbs: estimation.macroBreakdown.carbs,
      fat: estimation.macroBreakdown.fat,
      notes: notes,
    });
    toast({ title: 'Meal Logged!', description: 'Your meal has been added to your log.' });
    router.push('/dashboard');
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold text-foreground">Add New Meal</h1>
            <p className="text-muted-foreground">Capture your meal, get estimates, and log it.</p>
          </div>

          <MealCapture onPhotoCaptured={handlePhotoCaptured} />

          {photoDataUri && (
            <div className="text-center">
              <Button onClick={handleEstimate} disabled={isLoading || !photoDataUri} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Estimate Calories & Macros
                  </>
                )}
              </Button>
            </div>
          )}

          <MealEstimation estimation={estimation} isLoading={isLoading} />
          
          {estimation && photoDataUri && (
            <div className="space-y-6 rounded-lg border bg-card p-6 shadow-md">
               <div>
                <Label htmlFor="notes" className="text-md font-medium">Optional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., homemade, restaurant dish, feelings after meal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <Button onClick={handleLogMeal} size="lg" className="w-full">
                <CheckCircle className="mr-2 h-5 w-5" />
                Log This Meal
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
