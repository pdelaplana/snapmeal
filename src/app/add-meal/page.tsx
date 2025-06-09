'use client';

import { estimateCaloriesMacros } from '@/ai/flows/estimate-calories-macros';
import type { EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import AppLayout from '@/components/layout/app-layout';
import MealCapture from '@/components/meal/meal-capture';
import MealEstimation from '@/components/meal/meal-estimation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useMealLog } from '@/context/meal-log-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type EstimationType, type Meal, estimationTypes, mealTypes } from '@/types';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle,
  Edit3,
  Info,
  ListTree,
  Loader2,
  Wand2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AddMealPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [mealDescription, setMealDescription] = useState('');
  const [estimation, setEstimation] = useState<EstimateCaloriesMacrosOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<Meal['mealType'] | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [descriptionUsedInLastEstimate, setDescriptionUsedInLastEstimate] = useState<
    boolean | null
  >(null);
  const [selectedEstimationType, setSelectedEstimationType] =
    useState<EstimationType>('calories_macros');
  const [showManualInputs, setShowManualInputs] = useState(true);

  // State for manual overrides
  const [manualCalories, setManualCalories] = useState<string>('');
  const [manualProtein, setManualProtein] = useState<string>('');
  const [manualCarbs, setManualCarbs] = useState<string>('');
  const [manualFat, setManualFat] = useState<string>('');
  const [loggedRecognizedItems, setLoggedRecognizedItems] = useState<string[] | null>(null);

  const { toast } = useToast();
  const { addMeal } = useMealLog();
  const router = useRouter();

  const handlePhotoCaptured = (dataUri: string) => {
    setPhotoDataUri(dataUri);
    setEstimation(null);
    setDescriptionUsedInLastEstimate(null);
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setLoggedRecognizedItems(null);
  };

  const handleEstimate = async () => {
    if (!photoDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Photo',
        description: 'Please capture or upload a photo first.',
      });
      return;
    }
    setIsLoading(true);
    setEstimation(null);
    setLoggedRecognizedItems(null);
    setDescriptionUsedInLastEstimate(!!mealDescription.trim());
    try {
      const result = await estimateCaloriesMacros({
        photoDataUri,
        mealDescription,
        estimationType: selectedEstimationType,
      });
      setEstimation(result);
      if (result.isMealDetected && result.recognizedItems) {
        setLoggedRecognizedItems(result.recognizedItems);
      } else {
        setLoggedRecognizedItems(null);
      }

      if (!result.isMealDetected) {
        toast({
          variant: 'destructive',
          title: 'Meal Not Detected',
          icon: <AlertTriangle className='h-5 w-5' />,
          description:
            'The AI could not detect a meal in the photo. Please try a different image or add a description.',
        });
      } else if (
        (selectedEstimationType === 'calories_macros' &&
          (result.estimatedCalories == null || result.macroBreakdown == null)) ||
        (selectedEstimationType === 'calories_only' && result.estimatedCalories == null) ||
        (selectedEstimationType === 'macros_only' && result.macroBreakdown == null)
      ) {
        toast({
          variant: 'destructive',
          title: 'Estimation Incomplete',
          icon: <AlertTriangle className='h-5 w-5' />,
          description:
            'The AI detected a meal but could not provide full estimates for the selected type.',
        });
      } else {
        toast({
          title: 'Estimation Complete',
          description: 'Nutritional values have been estimated.',
        });
      }
    } catch (error: any) {
      console.error('Error estimating nutrition:', error);
      toast({
        variant: 'destructive',
        title: 'Estimation Failed',
        description: error.message || 'Could not estimate nutrition. Please try again.',
      });
      setEstimation(null);
      setDescriptionUsedInLastEstimate(null);
      setLoggedRecognizedItems(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (estimation && estimation.isMealDetected) {
      if (
        selectedEstimationType === 'calories_macros' ||
        selectedEstimationType === 'calories_only'
      ) {
        setManualCalories(estimation.estimatedCalories?.toFixed(0) ?? '');
      } else {
        setManualCalories('');
      }
      if (
        selectedEstimationType === 'calories_macros' ||
        selectedEstimationType === 'macros_only'
      ) {
        setManualProtein(estimation.macroBreakdown?.protein?.toFixed(1) ?? '');
        setManualCarbs(estimation.macroBreakdown?.carbs?.toFixed(1) ?? '');
        setManualFat(estimation.macroBreakdown?.fat?.toFixed(1) ?? '');
      } else {
        setManualProtein('');
        setManualCarbs('');
        setManualFat('');
      }
      setLoggedRecognizedItems(estimation.recognizedItems ?? null);
    } else if (estimation && !estimation.isMealDetected) {
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualFat('');
      setLoggedRecognizedItems(null);
    } else if (!estimation) {
      // When photo is removed or estimation is reset
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualFat('');
      setLoggedRecognizedItems(null);
    }
  }, [estimation, selectedEstimationType]);

  const getTimestamp = () => {
    if (!selectedDate || !selectedTime) return Date.now();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.getTime();
  };

  const isValidNumberString = (val: string) =>
    val.trim() !== '' && !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0;

  const canLogMeal = () => {
    if (!photoDataUri || !selectedMealType || !selectedDate || !selectedTime) return false;

    if (selectedEstimationType === 'calories_macros') {
      return (
        isValidNumberString(manualCalories) &&
        isValidNumberString(manualProtein) &&
        isValidNumberString(manualCarbs) &&
        isValidNumberString(manualFat)
      );
    }
    if (selectedEstimationType === 'calories_only') {
      return isValidNumberString(manualCalories);
    }
    if (selectedEstimationType === 'macros_only') {
      return (
        isValidNumberString(manualProtein) &&
        isValidNumberString(manualCarbs) &&
        isValidNumberString(manualFat)
      );
    }
    return false;
  };

  const handleLogMeal = () => {
    if (!canLogMeal()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Log Meal',
        description:
          'Please ensure photo, meal type, date/time are set, and all required nutritional fields for the selected estimation type are filled with valid numbers.',
      });
      return;
    }

    addMeal({
      timestamp: getTimestamp(),
      photoDataUri: photoDataUri as string,
      estimatedCalories: isValidNumberString(manualCalories)
        ? Number.parseFloat(manualCalories)
        : null,
      protein: isValidNumberString(manualProtein) ? Number.parseFloat(manualProtein) : null,
      carbs: isValidNumberString(manualCarbs) ? Number.parseFloat(manualCarbs) : null,
      fat: isValidNumberString(manualFat) ? Number.parseFloat(manualFat) : null,
      mealType: selectedMealType as Meal['mealType'],
      notes: notes,
      recognizedItems: loggedRecognizedItems,
    });
    toast({
      title: 'Meal Logged!',
      description: 'Your meal has been added to your log.',
    });
    router.push('/dashboard');
  };

  return (
    <AppLayout>
      <div className='container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='space-y-10'>
          <div className='text-center'>
            <h1 className='font-headline text-3xl font-bold text-foreground'>Add New Meal</h1>
            <p className='text-muted-foreground'>Capture your meal, get estimates, and log it.</p>
          </div>

          <MealCapture onPhotoCaptured={handlePhotoCaptured} />

          {photoDataUri && (
            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle>AI Estimation Tools</CardTitle>
                <CardDescription>
                  Use AI to get a nutritional estimate, then adjust if needed.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label htmlFor='mealDescription' className='text-md font-medium'>
                    Meal Description (Optional, for AI accuracy)
                  </Label>
                  <Textarea
                    id='mealDescription'
                    placeholder="e.g., 'Grilled chicken breast (approx 150g), half cup brown rice, steamed broccoli'. The more detail, the better the estimate!"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    className='mt-2 min-h-[80px]'
                  />
                  <Alert variant='default' className='mt-3'>
                    <Info className='h-4 w-4' />
                    <AlertDescription>
                      Providing details like ingredients, cooking methods, or portion sizes can
                      significantly improve the accuracy of the AI estimation.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <Label htmlFor='estimationType' className='text-md font-medium'>
                    Estimation Type
                  </Label>
                  <Select
                    value={selectedEstimationType}
                    onValueChange={(value) => setSelectedEstimationType(value as EstimationType)}
                  >
                    <SelectTrigger id='estimationType' className='mt-2'>
                      <SelectValue placeholder='Select estimation type' />
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

                <div className='text-center'>
                  <Button
                    onClick={handleEstimate}
                    disabled={isLoading || !photoDataUri}
                    size='lg'
                    className='bg-accent hover:bg-accent/90 text-accent-foreground'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        Estimating...
                      </>
                    ) : (
                      <>
                        <Wand2 className='mr-2 h-5 w-5' />
                        Estimate Nutrition
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <MealEstimation
            estimation={estimation}
            isLoading={isLoading}
            descriptionUsedForEstimation={descriptionUsedInLastEstimate}
            estimationType={selectedEstimationType}
          />

          {photoDataUri && (
            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Edit3 className='h-6 w-6 text-primary' />
                  Log Meal Details
                </CardTitle>
                <CardDescription>
                  Verify or enter the nutritional information and details for your meal log.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='date'>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal mt-2',
                            !selectedDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor='time'>Time</Label>
                    <Input
                      id='time'
                      type='time'
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className='mt-2'
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='mealType'>Meal Type</Label>
                  <Select
                    onValueChange={(value) => setSelectedMealType(value as Meal['mealType'])}
                    value={selectedMealType}
                  >
                    <SelectTrigger id='mealType' className='mt-2'>
                      <SelectValue placeholder='Select meal type' />
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

                <div className='flex items-center space-x-2 py-2'>
                  <Switch
                    id='toggle-manual-inputs'
                    checked={showManualInputs}
                    onCheckedChange={setShowManualInputs}
                    aria-label='Toggle manual nutrition inputs'
                  />
                  <Label htmlFor='toggle-manual-inputs' className='text-md cursor-pointer'>
                    Manually Adjust Nutrition
                  </Label>
                </div>

                {showManualInputs && (
                  <>
                    {(selectedEstimationType === 'calories_macros' ||
                      selectedEstimationType === 'calories_only') && (
                      <div>
                        <Label htmlFor='manualCalories'>Calories (kcal)</Label>
                        <Input
                          id='manualCalories'
                          type='number'
                          placeholder='e.g., 500'
                          value={manualCalories}
                          onChange={(e) => setManualCalories(e.target.value)}
                          className='mt-2'
                          min='0'
                        />
                      </div>
                    )}
                    {(selectedEstimationType === 'calories_macros' ||
                      selectedEstimationType === 'macros_only') && (
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div>
                          <Label htmlFor='manualProtein'>Protein (g)</Label>
                          <Input
                            id='manualProtein'
                            type='number'
                            placeholder='e.g., 30'
                            value={manualProtein}
                            onChange={(e) => setManualProtein(e.target.value)}
                            className='mt-2'
                            min='0'
                            step='0.1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='manualCarbs'>Carbs (g)</Label>
                          <Input
                            id='manualCarbs'
                            type='number'
                            placeholder='e.g., 50'
                            value={manualCarbs}
                            onChange={(e) => setManualCarbs(e.target.value)}
                            className='mt-2'
                            min='0'
                            step='0.1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='manualFat'>Fat (g)</Label>
                          <Input
                            id='manualFat'
                            type='number'
                            placeholder='e.g., 20'
                            value={manualFat}
                            onChange={(e) => setManualFat(e.target.value)}
                            className='mt-2'
                            min='0'
                            step='0.1'
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {loggedRecognizedItems && loggedRecognizedItems.length > 0 && (
                  <div className='space-y-2'>
                    <Label className='text-md flex items-center'>
                      <ListTree className='mr-2 h-4 w-4 text-primary' />
                      Recognized Items (to be logged)
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                      {loggedRecognizedItems.map((item, index) => (
                        <Badge key={index} variant='secondary'>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor='notes'>Optional Notes for Log</Label>
                  <Textarea
                    id='notes'
                    placeholder='e.g., homemade, restaurant dish, feelings after meal...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className='mt-2 min-h-[100px]'
                  />
                </div>
                <Button
                  onClick={handleLogMeal}
                  size='lg'
                  className='w-full'
                  disabled={!canLogMeal()}
                >
                  <CheckCircle className='mr-2 h-5 w-5' />
                  Log This Meal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
