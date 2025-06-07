
"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import MealCapture from '@/components/meal/meal-capture';
import MealEstimation from '@/components/meal/meal-estimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { estimateCaloriesMacros } from '@/ai/flows/estimate-calories-macros';
import type { EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { useToast } from '@/hooks/use-toast';
import { useMealLog } from '@/context/meal-log-context';
import { useRouter } from 'next/navigation';
import { Wand2, CheckCircle, Loader2, Info, AlertTriangle, CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { mealTypes, estimationTypes, type Meal, type EstimationType } from '@/types';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

export default function AddMealPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [mealDescription, setMealDescription] = useState('');
  const [estimation, setEstimation] = useState<EstimateCaloriesMacrosOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<Meal['mealType'] | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(format(new Date(), "HH:mm"));
  const [descriptionUsedInLastEstimate, setDescriptionUsedInLastEstimate] = useState<boolean | null>(null);
  const [selectedEstimationType, setSelectedEstimationType] = useState<EstimationType>('calories_macros');
  
  const { toast } = useToast();
  const { addMeal } = useMealLog();
  const router = useRouter();

  const handlePhotoCaptured = (dataUri: string) => {
    setPhotoDataUri(dataUri);
    setEstimation(null); 
    // setMealDescription(''); // Keep description if user wants to re-estimate with same description but new photo
    setDescriptionUsedInLastEstimate(null);
  };

  const handleEstimate = async () => {
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'No Photo', description: 'Please capture or upload a photo first.' });
      return;
    }
    setIsLoading(true);
    setEstimation(null);
    setDescriptionUsedInLastEstimate(!!mealDescription.trim());
    try {
      const result = await estimateCaloriesMacros({ 
        photoDataUri, 
        mealDescription, 
        estimationType: selectedEstimationType 
      });
      setEstimation(result); 

      if (!result.isMealDetected) {
        toast({ variant: 'destructive', title: 'Meal Not Detected', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI could not detect a meal in the photo. Please try a different image or add a description.' });
      } else if (
        (selectedEstimationType === 'calories_macros' && (result.estimatedCalories == null || result.macroBreakdown == null)) ||
        (selectedEstimationType === 'calories_only' && result.estimatedCalories == null) ||
        (selectedEstimationType === 'macros_only' && result.macroBreakdown == null)
      ) {
        toast({ variant: 'destructive', title: 'Estimation Incomplete', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI detected a meal but could not provide full estimates for the selected type.' });
      } else {
         toast({ title: 'Estimation Complete', description: 'Nutritional values have been estimated.' });
      }
    } catch (error: any) {
      console.error('Error estimating nutrition:', error);
      toast({ variant: 'destructive', title: 'Estimation Failed', description: error.message || 'Could not estimate nutrition. Please try again.' });
      setEstimation(null); 
      setDescriptionUsedInLastEstimate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimestamp = () => {
    if (!selectedDate || !selectedTime) return Date.now();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.getTime();
  };

  const isEstimationValidForLogging = () => {
    if (!estimation || !estimation.isMealDetected) return false;
    if (selectedEstimationType === 'calories_macros') {
      return estimation.estimatedCalories != null && estimation.macroBreakdown != null;
    }
    if (selectedEstimationType === 'calories_only') {
      return estimation.estimatedCalories != null;
    }
    if (selectedEstimationType === 'macros_only') {
      return estimation.macroBreakdown != null;
    }
    return false;
  };
  
  const canLogMeal = photoDataUri && selectedMealType && selectedDate && selectedTime && isEstimationValidForLogging();

  const handleLogMeal = () => {
    if (!canLogMeal || !estimation) { // Double check estimation due to its role in canLogMeal
      toast({ variant: 'destructive', title: 'Cannot Log Meal', description: 'Please ensure photo, meal type, date/time are set and a valid estimation is present for the selected type.' });
      return;
    }
    
    addMeal({
      timestamp: getTimestamp(),
      photoDataUri: photoDataUri as string, // Already checked by canLogMeal
      estimatedCalories: estimation.estimatedCalories ?? null, 
      protein: estimation.macroBreakdown?.protein ?? null,
      carbs: estimation.macroBreakdown?.carbs ?? null,
      fat: estimation.macroBreakdown?.fat ?? null,
      mealType: selectedMealType as Meal['mealType'], // Already checked
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
            <div className="space-y-6 rounded-lg border bg-card p-6 shadow-md">
              <div>
                <Label htmlFor="mealDescription" className="text-md font-medium">
                  Meal Description (Optional, for AI accuracy)
                </Label>
                <Textarea
                  id="mealDescription"
                  placeholder="e.g., 'Grilled chicken breast (approx 150g), half cup brown rice, steamed broccoli'. The more detail, the better the estimate!"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
                 <Alert variant="default" className="mt-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Providing details like ingredients, cooking methods, or portion sizes can significantly improve the accuracy of the AI estimation.
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <Label htmlFor="estimationType" className="text-md font-medium">Estimation Type</Label>
                <Select
                  value={selectedEstimationType}
                  onValueChange={(value) => setSelectedEstimationType(value as EstimationType)}
                >
                  <SelectTrigger id="estimationType" className="mt-2">
                    <SelectValue placeholder="Select estimation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {estimationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      Estimate Nutrition
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <MealEstimation 
            estimation={estimation} 
            isLoading={isLoading} 
            descriptionUsedForEstimation={descriptionUsedInLastEstimate} 
            estimationType={selectedEstimationType}
          />
          
          {isEstimationValidForLogging() && photoDataUri && (
            <div className="space-y-6 rounded-lg border bg-card p-6 shadow-md">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="date" className="text-md font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time" className="text-md font-medium">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mealType" className="text-md font-medium">Meal Type</Label>
                <Select
                  onValueChange={(value) => setSelectedMealType(value as Meal['mealType'])}
                  value={selectedMealType}
                >
                  <SelectTrigger id="mealType" className="mt-2">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               <div>
                <Label htmlFor="notes" className="text-md font-medium">Optional Notes for Log</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., homemade, restaurant dish, feelings after meal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <Button onClick={handleLogMeal} size="lg" className="w-full" disabled={!canLogMeal}>
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
