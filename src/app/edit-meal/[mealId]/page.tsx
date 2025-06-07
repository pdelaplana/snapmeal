
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import MealCapture from '@/components/meal/meal-capture';
import MealEstimation from '@/components/meal/meal-estimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { estimateCaloriesMacros, type EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { useToast } from '@/hooks/use-toast';
import { useMealLog } from '@/context/meal-log-context';
import { mealTypes, estimationTypes, type Meal, type EstimationType } from '@/types';
import { Wand2, Save, Loader2, Info, AlertTriangle, ChevronLeft, Trash2, CalendarIcon, Edit3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


type PageState = 'loading' | 'loaded' | 'error';

export default function EditMealPage() {
  const router = useRouter();
  const params = useParams();
  const mealId = params.mealId as string;

  const { getMealById, updateMeal, deleteMeal, loading: mealLogLoading } = useMealLog();
  const { toast } = useToast();

  const [initialMealData, setInitialMealData] = useState<Meal | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [mealDescription, setMealDescription] = useState('');
  const [aiEstimation, setAiEstimation] = useState<EstimateCaloriesMacrosOutput | null>(null); 
  const [notes, setNotes] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<Meal['mealType'] | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [descriptionUsedInLastEstimate, setDescriptionUsedInLastEstimate] = useState<boolean | null>(null);
  const [selectedEstimationType, setSelectedEstimationType] = useState<EstimationType>('calories_macros');
  const [showManualInputs, setShowManualInputs] = useState(true);

  // State for manual overrides
  const [manualCalories, setManualCalories] = useState<string>('');
  const [manualProtein, setManualProtein] = useState<string>('');
  const [manualCarbs, setManualCarbs] = useState<string>('');
  const [manualFat, setManualFat] = useState<string>('');


  useEffect(() => {
    if (mealLogLoading) {
      setPageState('loading');
      return;
    }

    if (!mealId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Meal ID is missing.' });
      router.replace('/dashboard');
      setPageState('error');
      return;
    }

    const mealToEdit = getMealById(mealId);

    if (mealToEdit) {
      setInitialMealData(mealToEdit);
      setPhotoDataUri(mealToEdit.photoDataUri);
      setMealDescription(''); 
      setNotes(mealToEdit.notes || '');
      setSelectedMealType(mealToEdit.mealType);
      
      const mealTimestamp = new Date(mealToEdit.timestamp);
      setSelectedDate(mealTimestamp);
      setSelectedTime(format(mealTimestamp, "HH:mm"));
      
      let initialEstType: EstimationType = 'calories_macros';
      if (mealToEdit.estimatedCalories != null && (mealToEdit.protein != null || mealToEdit.carbs != null || mealToEdit.fat != null)) {
        initialEstType = 'calories_macros';
      } else if (mealToEdit.estimatedCalories != null) {
        initialEstType = 'calories_only';
      } else if (mealToEdit.protein != null || mealToEdit.carbs != null || mealToEdit.fat != null) {
        initialEstType = 'macros_only';
      }
      setSelectedEstimationType(initialEstType);

      setManualCalories(mealToEdit.estimatedCalories?.toString() ?? '');
      setManualProtein(mealToEdit.protein?.toString() ?? '');
      setManualCarbs(mealToEdit.carbs?.toString() ?? '');
      setManualFat(mealToEdit.fat?.toString() ?? '');

      setAiEstimation({
        isMealDetected: true, 
        estimatedCalories: mealToEdit.estimatedCalories,
        macroBreakdown: (mealToEdit.protein != null || mealToEdit.carbs != null || mealToEdit.fat != null) ? {
          protein: mealToEdit.protein ?? 0,
          carbs: mealToEdit.carbs ?? 0,
          fat: mealToEdit.fat ?? 0,
        } : null,
      });
      setDescriptionUsedInLastEstimate(null); 
      setPageState('loaded');
    } else {
      toast({ variant: 'destructive', title: 'Meal not found', description: `The meal you're trying to edit doesn't exist or could not be loaded.` });
      router.replace('/dashboard');
      setPageState('error');
    }
  }, [mealLogLoading, mealId, getMealById, router, toast]);


  useEffect(() => {
    if (pageState !== 'loaded' || isEstimating) return; 

    if (aiEstimation && aiEstimation.isMealDetected) {
      if (selectedEstimationType === 'calories_macros' || selectedEstimationType === 'calories_only') {
        setManualCalories(aiEstimation.estimatedCalories?.toFixed(0) ?? '');
      } else {
        setManualCalories('');
      }
      if (selectedEstimationType === 'calories_macros' || selectedEstimationType === 'macros_only') {
        setManualProtein(aiEstimation.macroBreakdown?.protein?.toFixed(1) ?? '');
        setManualCarbs(aiEstimation.macroBreakdown?.carbs?.toFixed(1) ?? '');
        setManualFat(aiEstimation.macroBreakdown?.fat?.toFixed(1) ?? '');
      } else {
        setManualProtein('');
        setManualCarbs('');
        setManualFat('');
      }
    } else if (aiEstimation && !aiEstimation.isMealDetected) { 
        setManualCalories('');
        setManualProtein('');
        setManualCarbs('');
        setManualFat('');
    }
  }, [aiEstimation, selectedEstimationType, pageState, isEstimating]);


  const handlePhotoCaptured = useCallback((dataUri: string) => {
    setPhotoDataUri(dataUri);
    setAiEstimation(null); 
    setDescriptionUsedInLastEstimate(null); 
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
  }, []);

  const handleEstimate = async () => {
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'No Photo', description: 'Please ensure a photo is present to estimate nutrition.' });
      return;
    }
    setIsEstimating(true);
    setDescriptionUsedInLastEstimate(!!mealDescription.trim());
    try {
      const result = await estimateCaloriesMacros({ 
        photoDataUri, 
        mealDescription,
        estimationType: selectedEstimationType
      });
      setAiEstimation(result); 

      if (!result.isMealDetected) {
        toast({ variant: 'destructive', title: 'Meal Not Detected', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI could not detect a meal in the photo. Please try a different image or add a description.' });
      } else if (
        (selectedEstimationType === 'calories_macros' && (result.estimatedCalories == null || result.macroBreakdown == null)) ||
        (selectedEstimationType === 'calories_only' && result.estimatedCalories == null) ||
        (selectedEstimationType === 'macros_only' && result.macroBreakdown == null)
      ) {
        toast({ variant: 'destructive', title: 'Estimation Incomplete', icon: <AlertTriangle className="h-5 w-5" />, description: 'The AI detected a meal but could not provide full estimates for the selected type.' });
      } else {
         toast({ title: 'New Estimation Complete', description: 'Nutritional values have been re-estimated.' });
      }
    } catch (error: any) {
      console.error('Error re-estimating nutrition:', error);
      toast({ variant: 'destructive', title: 'Re-estimation Failed', description: error.message || 'Could not re-estimate nutrition. Please try again.' });
      setAiEstimation(initialMealData ? {
        isMealDetected: true,
        estimatedCalories: initialMealData.estimatedCalories,
        macroBreakdown: (initialMealData.protein != null || initialMealData.carbs != null || initialMealData.fat != null) ? { protein: initialMealData.protein ?? 0, carbs: initialMealData.carbs ?? 0, fat: initialMealData.fat ?? 0 } : null,
      } : null);
      setDescriptionUsedInLastEstimate(null); 
    } finally {
      setIsEstimating(false);
    }
  };
  
  const getTimestamp = () => {
    if (!selectedDate || !selectedTime) { 
        return initialMealData?.timestamp || Date.now();
    }
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.getTime();
  };

  const isValidNumberString = (val: string) => val.trim() !== '' && !isNaN(parseFloat(val)) && parseFloat(val) >= 0;

  const canUpdateMeal = () => {
    if (!initialMealData || !photoDataUri || !selectedMealType || !selectedDate || !selectedTime) return false;

    if (selectedEstimationType === 'calories_macros') {
      return isValidNumberString(manualCalories) && isValidNumberString(manualProtein) && isValidNumberString(manualCarbs) && isValidNumberString(manualFat);
    }
    if (selectedEstimationType === 'calories_only') {
      return isValidNumberString(manualCalories);
    }
    if (selectedEstimationType === 'macros_only') {
      return isValidNumberString(manualProtein) && isValidNumberString(manualCarbs) && isValidNumberString(manualFat);
    }
    return false;
  };

  const handleUpdateMeal = () => {
    if (!initialMealData || !canUpdateMeal()) { 
        toast({ variant: 'destructive', title: 'Cannot Update Meal', description: 'Please ensure all required fields are filled and all required nutritional fields for the selected estimation type are valid numbers.' });
        return;
    }

    updateMeal(initialMealData.id, {
      timestamp: getTimestamp(),
      photoDataUri: photoDataUri as string,
      estimatedCalories: isValidNumberString(manualCalories) ? parseFloat(manualCalories) : null,
      protein: isValidNumberString(manualProtein) ? parseFloat(manualProtein) : null,
      carbs: isValidNumberString(manualCarbs) ? parseFloat(manualCarbs) : null,
      fat: isValidNumberString(manualFat) ? parseFloat(manualFat) : null,
      mealType: selectedMealType as Meal['mealType'],
      notes: notes,
    });
    toast({ title: 'Meal Updated!', description: 'Your meal log has been updated.' });
    router.push('/dashboard');
  };

  const handleDeleteMeal = () => {
    if (!initialMealData) return;
    deleteMeal(initialMealData.id);
    toast({ title: 'Meal Deleted', description: 'The meal has been removed from your log.' });
    router.push('/dashboard');
  };

  if (pageState === 'loading') {
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
          <LoadingSpinner className="h-10 w-10 text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'error' || !initialMealData) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
          <p className="text-lg text-destructive">Meal not found or an error occurred.</p>
          <Button onClick={() => router.push('/dashboard')} variant="link" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }
  
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
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>AI Estimation Tools</CardTitle>
                <CardDescription>Use AI to get a nutritional estimate, then adjust if needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="mealDescriptionEdit" className="text-md font-medium">
                    Meal Description (Optional, for AI re-estimation)
                  </Label>
                  <Textarea
                    id="mealDescriptionEdit"
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
                
                <div>
                  <Label htmlFor="estimationTypeEdit" className="text-md font-medium">Estimation Type</Label>
                  <Select
                    value={selectedEstimationType}
                    onValueChange={(value) => {
                      setSelectedEstimationType(value as EstimationType);
                    }}
                  >
                    <SelectTrigger id="estimationTypeEdit" className="mt-2">
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
              </CardContent>
            </Card>
          )}

          <MealEstimation 
            estimation={aiEstimation} 
            isLoading={isEstimating}
            descriptionUsedForEstimation={descriptionUsedInLastEstimate}
            estimationType={selectedEstimationType}
          />
          
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-6 w-6 text-primary" />
                    Update Logged Meal Details
                </CardTitle>
                <CardDescription>Verify or update the nutritional information and other details for your meal log.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dateEdit">Date</Label>
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
                  <Label htmlFor="timeEdit">Time</Label>
                  <Input
                    id="timeEdit"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mealTypeEdit">Meal Type</Label>
                <Select
                  onValueChange={(value) => setSelectedMealType(value as Meal['mealType'])}
                  value={selectedMealType}
                >
                  <SelectTrigger id="mealTypeEdit" className="mt-2">
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

              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id="toggle-manual-inputs-edit"
                  checked={showManualInputs}
                  onCheckedChange={setShowManualInputs}
                  aria-label="Toggle manual nutrition inputs"
                />
                <Label htmlFor="toggle-manual-inputs-edit" className="text-md cursor-pointer">Manually Adjust Nutrition</Label>
              </div>

              {showManualInputs && (
                <>
                  {(selectedEstimationType === 'calories_macros' || selectedEstimationType === 'calories_only') && (
                    <div>
                      <Label htmlFor="manualCaloriesEdit">Logged Calories (kcal)</Label>
                      <Input
                        id="manualCaloriesEdit"
                        type="number"
                        placeholder="e.g., 500"
                        value={manualCalories}
                        onChange={(e) => setManualCalories(e.target.value)}
                        className="mt-2"
                        min="0"
                      />
                    </div>
                  )}
                  {(selectedEstimationType === 'calories_macros' || selectedEstimationType === 'macros_only') && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="manualProteinEdit">Logged Protein (g)</Label>
                        <Input
                          id="manualProteinEdit"
                          type="number"
                          placeholder="e.g., 30"
                          value={manualProtein}
                          onChange={(e) => setManualProtein(e.target.value)}
                          className="mt-2"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="manualCarbsEdit">Logged Carbs (g)</Label>
                        <Input
                          id="manualCarbsEdit"
                          type="number"
                          placeholder="e.g., 50"
                          value={manualCarbs}
                          onChange={(e) => setManualCarbs(e.target.value)}
                          className="mt-2"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="manualFatEdit">Logged Fat (g)</Label>
                        <Input
                          id="manualFatEdit"
                          type="number"
                          placeholder="e.g., 20"
                          value={manualFat}
                          onChange={(e) => setManualFat(e.target.value)}
                          className="mt-2"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label htmlFor="notesEdit">Notes for Log</Label>
                <Textarea
                  id="notesEdit"
                  placeholder="e.g., homemade, restaurant dish, feelings after meal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleUpdateMeal} disabled={!canUpdateMeal() || isEstimating} size="lg" className="flex-1">
                  <Save className="mr-2 h-5 w-5" />
                  Update Meal
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="flex-1">
                      <Trash2 className="mr-2 h-5 w-5" />
                      Delete Meal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this meal
                        from your log.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteMeal}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

