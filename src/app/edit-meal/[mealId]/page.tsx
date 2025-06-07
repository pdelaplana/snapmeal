
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import MealCapture from '@/components/meal/meal-capture';
import MealEstimation from '@/components/meal/meal-estimation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { estimateCaloriesMacros, type EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { useToast } from '@/hooks/use-toast';
import { useMealLog } from '@/context/meal-log-context';
import type { Meal } from '@/types';
import { Wand2, Save, Loader2, Info, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function EditMealPage() {
  const router = useRouter();
  const params = useParams();
  const mealId = params.mealId as string;

  const { getMealById, updateMeal, loading: mealLogLoading } = useMealLog(); // Renamed context loading
  const { toast } = useToast();

  const [initialMealData, setInitialMealData] = useState<Meal | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [mealDescription, setMealDescription] = useState(''); // For AI estimation
  const [estimation, setEstimation] = useState<EstimateCaloriesMacrosOutput | null>(null);
  const [notes, setNotes] = useState(''); // For user's log
  const [isEstimating, setIsEstimating] = useState(false); // For AI estimation loading
  const [isPageLoading, setIsPageLoading] = useState(true); // For initial meal data loading

  useEffect(() => {
    if (!mealId) {
      // Should not happen if routing is correct, but as a safeguard
      toast({ variant: 'destructive', title: 'Error', description: 'Meal ID is missing.' });
      router.replace('/dashboard');
      return;
    }

    if (mealLogLoading) {
      setIsPageLoading(true); // Keep showing spinner if context is loading
      return;
    }

    // mealLogLoading is false here, so we can safely try to get the meal
    const mealToEdit = getMealById(mealId);
    if (mealToEdit) {
      setInitialMealData(mealToEdit);
      setPhotoDataUri(mealToEdit.photoDataUri);
      setMealDescription('');
      setNotes(mealToEdit.notes || '');
      setEstimation({
        isMealDetected: true,
        estimatedCalories: mealToEdit.estimatedCalories,
        macroBreakdown: {
          protein: mealToEdit.protein,
          carbs: mealToEdit.carbs,
          fat: mealToEdit.fat,
        },
      });
      setIsPageLoading(false); // Page data is now ready
    } else {
      // Meal log is loaded, but meal with this ID wasn't found
      toast({ variant: 'destructive', title: 'Meal not found', description: 'Could not find the meal you want to edit.' });
      router.replace('/dashboard');
      // setIsPageLoading(false); // Not strictly needed as redirection will occur
    }
  }, [mealId, getMealById, router, toast, mealLogLoading]); // Added mealLogLoading to dependencies

  const handlePhotoCaptured = useCallback((dataUri: string) => {
    setPhotoDataUri(dataUri);
    setMealDescription('');
  }, []);

  const handleEstimate = async () => {
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'No Photo', description: 'Please ensure a photo is present to estimate nutrition.' });
      return;
    }
    setIsEstimating(true);
    try {
      const result = await estimateCaloriesMacros({ photoDataUri, mealDescription });
      setEstimation(result);

      if (result.isMealDetected && result.estimatedCalories != null && result.macroBreakdown != null) {
        toast({ title: 'New Estimation Complete', description: 'Nutritional values have been re-estimated.' });
      } else if (!result.isMealDetected) {
        toast({ variant: 'destructive', title: 'Meal Not Detected', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI could not detect a meal in the photo. Please try a different image or add a description.' });
      } else {
        toast({ variant: 'destructive', title: 'Estimation Incomplete', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI detected a meal but could not provide full nutritional estimates.' });
      }
    } catch (error: any) {
      console.error('Error estimating calories:', error);
      toast({ variant: 'destructive', title: 'Estimation Failed', description: error.message || 'Could not estimate nutrition. Please try again.' });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleUpdateMeal = () => {
    if (!initialMealData) {
        toast({ variant: 'destructive', title: 'Error', description: 'Original meal data is missing.' });
        return;
    }
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'Cannot Update Meal', description: 'A photo is required for the meal log.' });
      return;
    }
    if (!estimation || !estimation.isMealDetected || estimation.estimatedCalories == null || !estimation.macroBreakdown) {
      toast({ variant: 'destructive', title: 'Cannot Update Meal', description: 'Valid nutritional estimation is required. Please estimate nutrition if you haven\'t.' });
      return;
    }

    updateMeal(initialMealData.id, {
      photoDataUri,
      estimatedCalories: estimation.estimatedCalories,
      protein: estimation.macroBreakdown.protein,
      carbs: estimation.macroBreakdown.carbs,
      fat: estimation.macroBreakdown.fat,
      notes: notes,
    });
    toast({ title: 'Meal Updated!', description: 'Your meal log has been updated.' });
    router.push('/dashboard');
  };

  if (isPageLoading || mealLogLoading) { // Check both loading states
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
          <LoadingSpinner className="h-10 w-10 text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!initialMealData) {
    // This case should now only be hit if meal truly doesn't exist after context load
    return (
      <AppLayout>
        <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
          <p className="text-lg text-destructive">Meal not found.</p>
          <Button onClick={() => router.push('/dashboard')} variant="link" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const canUpdateMeal = estimation && estimation.isMealDetected && estimation.estimatedCalories != null && estimation.macroBreakdown != null && photoDataUri;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold text-foreground">Edit Meal</h1>
            <p className="text-muted-foreground">Update the details of your logged meal.</p>
          </div>

          <MealCapture 
            onPhotoCaptured={handlePhotoCaptured} 
            initialPhotoDataUri={photoDataUri} 
          />

          {photoDataUri && (
            <div className="space-y-4 rounded-lg border bg-card p-6 shadow-md">
              <div>
                <Label htmlFor="mealDescription" className="text-md font-medium">
                  Meal Description (Optional, for AI re-estimation)
                </Label>
                <Textarea
                  id="mealDescription"
                  placeholder="e.g., 'Grilled chicken breast (approx 150g), half cup brown rice, steamed broccoli'. Add or change details if you want to re-estimate."
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
                 <Alert variant="default" className="mt-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    If you change the photo or want a new nutrition estimate, provide relevant details here and click "Re-estimate Nutrition".
                  </AlertDescription>
                </Alert>
              </div>
              <div className="text-center">
                <Button onClick={handleEstimate} disabled={isEstimating || !photoDataUri} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isEstimating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Re-estimate Nutrition
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <MealEstimation estimation={estimation} isLoading={isEstimating} />
          
          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-md">
            <div>
              <Label htmlFor="notes" className="text-md font-medium">Notes for Log</Label>
              <Textarea
                id="notes"
                placeholder="e.g., homemade, restaurant dish, feelings after meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>
            <Button onClick={handleUpdateMeal} disabled={!canUpdateMeal || isEstimating} size="lg" className="w-full">
              <Save className="mr-2 h-5 w-5" />
              Update Meal
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
