import type { EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { EstimationType } from '@/types';
import { Beef, Drumstick, Flame, HelpCircle, Info, ListTree, Wheat } from 'lucide-react';

interface MealEstimationProps {
  estimation: EstimateCaloriesMacrosOutput | null;
  isLoading: boolean;
  descriptionUsedForEstimation?: boolean | null;
  estimationType?: EstimationType;
}

export default function MealEstimation({
  estimation,
  isLoading,
  descriptionUsedForEstimation,
  estimationType,
}: MealEstimationProps) {
  if (isLoading) {
    return (
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold'>Estimating Nutrition...</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Progress value={50} className='w-full animate-pulse' />
          <p className='text-center text-sm text-muted-foreground'>
            Our AI is analyzing your meal. This might take a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!estimation) {
    return null;
  }

  const showCalories =
    estimation.estimatedCalories != null &&
    (estimationType === 'calories_macros' || estimationType === 'calories_only');
  const showMacros =
    estimation.macroBreakdown != null &&
    (estimationType === 'calories_macros' || estimationType === 'macros_only');
  const showRecognizedItems =
    estimation.isMealDetected &&
    estimation.recognizedItems &&
    estimation.recognizedItems.length > 0;

  if (!estimation.isMealDetected) {
    return null;
  }

  if (
    estimation.isMealDetected &&
    !showCalories &&
    !showMacros &&
    !showRecognizedItems &&
    estimationType
  ) {
    return (
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold'>Estimation Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <HelpCircle className='h-4 w-4' />
            <AlertDescription>
              A meal was detected, but the AI could not provide the requested{' '}
              {estimationType.replace('_', ' ')} estimates or recognized items. You might want to
              try a clearer photo, add a description, or re-estimate.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { estimatedCalories, macroBreakdown, recognizedItems } = estimation;

  let proteinPercentage = 0;
  let carbsPercentage = 0;
  let fatPercentage = 0;
  if (macroBreakdown) {
    const totalMacros =
      (macroBreakdown.protein || 0) + (macroBreakdown.carbs || 0) + (macroBreakdown.fat || 0);
    proteinPercentage = totalMacros > 0 ? ((macroBreakdown.protein || 0) / totalMacros) * 100 : 0;
    carbsPercentage = totalMacros > 0 ? ((macroBreakdown.carbs || 0) / totalMacros) * 100 : 0;
    fatPercentage = totalMacros > 0 ? ((macroBreakdown.fat || 0) / totalMacros) * 100 : 0;
  }

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>AI Estimation Results</CardTitle>
        {typeof descriptionUsedForEstimation === 'boolean' && (
          <Alert variant='default' className='mt-3'>
            <Info className='h-4 w-4' />
            <AlertDescription>
              {descriptionUsedForEstimation
                ? 'This estimation was enhanced by your provided description.'
                : 'This estimation is based on the photo only. Tip: Adding a description can improve accuracy.'}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className='space-y-6'>
        {showCalories && estimatedCalories != null && (
          <div className='flex items-center justify-between rounded-lg bg-primary/10 p-4'>
            <div className='flex items-center'>
              <Flame className='mr-3 h-8 w-8 text-primary' />
              <span className='text-lg font-medium text-foreground'>Total Calories</span>
            </div>
            <span className='text-2xl font-bold text-primary'>{estimatedCalories.toFixed(0)}</span>
          </div>
        )}

        {showMacros && macroBreakdown && (
          <div className='space-y-3'>
            <h3 className='text-md font-medium text-foreground'>Macro Breakdown:</h3>
            <div className='flex items-center'>
              <Beef className='mr-2 h-5 w-5 text-red-500' />
              <span className='w-20 shrink-0 text-sm'>Protein:</span>
              <span className='mr-2 flex-grow font-medium'>
                {(macroBreakdown.protein || 0).toFixed(1)}g
              </span>
              <Progress value={proteinPercentage} className='h-2 w-24' />
            </div>
            <div className='flex items-center'>
              <Wheat className='mr-2 h-5 w-5 text-yellow-500' />
              <span className='w-20 shrink-0 text-sm'>Carbs:</span>
              <span className='mr-2 flex-grow font-medium'>
                {(macroBreakdown.carbs || 0).toFixed(1)}g
              </span>
              <Progress value={carbsPercentage} className='h-2 w-24' />
            </div>
            <div className='flex items-center'>
              <Drumstick className='mr-2 h-5 w-5 text-orange-500' />
              <span className='w-20 shrink-0 text-sm'>Fat:</span>
              <span className='mr-2 flex-grow font-medium'>
                {(macroBreakdown.fat || 0).toFixed(1)}g
              </span>
              <Progress value={fatPercentage} className='h-2 w-24' />
            </div>
          </div>
        )}

        {showRecognizedItems && recognizedItems && recognizedItems.length > 0 && (
          <div className='space-y-3'>
            <div className='flex items-center'>
              <ListTree className='mr-2 h-5 w-5 text-primary' />
              <h3 className='text-md font-medium text-foreground'>Recognized Items:</h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              {recognizedItems.map((item, index) => (
                <Badge key={item} variant='secondary' className='text-sm'>
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(showCalories || showMacros) && (
          <p className='text-xs text-muted-foreground'>
            *These are AI estimates. Actual values may vary. You can manually adjust them below.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
