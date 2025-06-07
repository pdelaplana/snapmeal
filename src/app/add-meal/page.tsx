
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
import { mealTypes, type Meal } from '@/types';
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
  const { toast } = useToast();
  const { addMeal } = useMealLog();
  const router = useRouter();

  const handlePhotoCaptured = (dataUri: string) => {
    setPhotoDataUri(dataUri);
    setEstimation(null); 
    setMealDescription(''); 
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
      const result = await estimateCaloriesMacros({ photoDataUri, mealDescription });
      setEstimation(result); 

      if (result.isMealDetected && result.estimatedCalories != null && result.macroBreakdown != null) {
        toast({ title: 'Estimation Complete', description: 'Nutritional values have been estimated.' });
      } else if (!result.isMealDetected) {
        toast({ variant: 'destructive', title: 'Meal Not Detected', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI could not detect a meal in the photo. Please try a different image or add a description.' });
      } else {
        toast({ variant: 'destructive', title: 'Estimation Incomplete', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI detected a meal but could not provide full nutritional estimates.' });
      }
    } catch (error: any) {
      console.error('Error estimating calories:', error);
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

  const handleLogMeal = () => {
    if (!photoDataUri || !estimation || !estimation.isMealDetected || estimation.estimatedCalories == null || !estimation.macroBreakdown || !selectedMealType || !selectedDate || !selectedTime) {
      toast({ variant: 'destructive', title: 'Cannot Log Meal', description: 'Please capture a photo, get a valid estimation, select a meal type, and set date/time.' });
      return;
    }
    
    addMeal({
      timestamp: getTimestamp(),
      photoDataUri,
      estimatedCalories: estimation.estimatedCalories, 
      protein: estimation.macroBreakdown.protein,
      carbs: estimation.macroBreakdown.carbs,
      fat: estimation.macroBreakdown.fat,
      mealType: selectedMealType,
      notes: notes,
    });
    toast({ title: 'Meal Logged!', description: 'Your meal has been added to your log.' });
    router.push('/dashboard');
  };
  
  const canLogMeal = estimation && estimation.isMealDetected && estimation.estimatedCalories != null && estimation.macroBreakdown != null && photoDataUri && selectedMealType && selectedDate && selectedTime;

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
            <div className="space-y-4 rounded-lg border bg-card p-6 shadow-md">
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
          />
          
          {estimation?.isMealDetected && estimation.estimatedCalories != null && estimation.macroBreakdown != null && photoDataUri && (
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
