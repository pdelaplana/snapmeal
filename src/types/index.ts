export interface Meal {
  id: string;
  timestamp: number;
  photoDataUri: string;
  estimatedCalories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes?: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre-workout' | 'Post-workout';
  recognizedItems?: string[] | null; // Added field for recognized items
}

export const mealTypes: Meal['mealType'][] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Pre-workout',
  'Post-workout',
];

export const estimationTypes = [
  { value: 'calories_macros', label: 'Calories & Macros' },
  { value: 'calories_only', label: 'Calories Only' },
  { value: 'macros_only', label: 'Macros Only' },
] as const;

export type EstimationType = (typeof estimationTypes)[number]['value'];
