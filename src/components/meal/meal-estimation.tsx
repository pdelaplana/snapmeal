import type { EstimateCaloriesMacrosOutput } from '@/ai/flows/estimate-calories-macros';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Beef, Wheat, Drumstick } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MealEstimationProps {
  estimation: EstimateCaloriesMacrosOutput | null;
  isLoading: boolean;
}

export default function MealEstimation({ estimation, isLoading }: MealEstimationProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Estimating Nutrition...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={50} className="w-full animate-pulse" />
          <p className="text-center text-sm text-muted-foreground">
            Our AI is analyzing your meal. This might take a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!estimation) {
    return null; // Or a message like "Estimation will appear here"
  }

  const { estimatedCalories, macroBreakdown } = estimation;
  const totalMacros = macroBreakdown.protein + macroBreakdown.carbs + macroBreakdown.fat;
  const proteinPercentage = totalMacros > 0 ? (macroBreakdown.protein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (macroBreakdown.carbs / totalMacros) * 100 : 0;
  const fatPercentage = totalMacros > 0 ? (macroBreakdown.fat / totalMacros) * 100 : 0;


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Estimated Nutrition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
          <div className="flex items-center">
            <Flame className="mr-3 h-8 w-8 text-primary" />
            <span className="text-lg font-medium text-foreground">Total Calories</span>
          </div>
          <span className="text-2xl font-bold text-primary">{estimatedCalories.toFixed(0)}</span>
        </div>

        <div className="space-y-3">
          <h3 className="text-md font-medium text-foreground">Macro Breakdown:</h3>
          <div className="flex items-center">
            <Beef className="mr-2 h-5 w-5 text-red-500" />
            <span className="w-20 shrink-0 text-sm">Protein:</span>
            <span className="mr-2 flex-grow font-medium">{macroBreakdown.protein.toFixed(1)}g</span>
            <Progress value={proteinPercentage} className="h-2 w-24" />
          </div>
          <div className="flex items-center">
            <Wheat className="mr-2 h-5 w-5 text-yellow-500" />
            <span className="w-20 shrink-0 text-sm">Carbs:</span>
            <span className="mr-2 flex-grow font-medium">{macroBreakdown.carbs.toFixed(1)}g</span>
            <Progress value={carbsPercentage} className="h-2 w-24" />
          </div>
          <div className="flex items-center">
            <Drumstick className="mr-2 h-5 w-5 text-orange-500" />
            <span className="w-20 shrink-0 text-sm">Fat:</span>
            <span className="mr-2 flex-grow font-medium">{macroBreakdown.fat.toFixed(1)}g</span>
            <Progress value={fatPercentage} className="h-2 w-24" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          *These are estimates. Actual values may vary.
        </p>
      </CardContent>
    </Card>
  );
}
