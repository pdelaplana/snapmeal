export interface Meal {
  id: string;
  timestamp: number;
  photoDataUri: string; 
  estimatedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string; 
}
