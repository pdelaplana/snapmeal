
export interface Meal {
  id: string;
  timestamp: number;
  photoDataUri: string;
  estimatedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Pre-workout" | "Post-workout";
}

export const mealTypes: Meal['mealType'][] = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-workout", "Post-workout"];
