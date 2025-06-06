
'use server';

/**
 * @fileOverview AI agent that estimates the calorie count and macro breakdown of a meal from a photo and an optional description.
 *
 * - estimateCaloriesMacros - A function that handles the estimation process.
 * - EstimateCaloriesMacrosInput - The input type for the estimateCaloriesMacros function.
 * - EstimateCaloriesMacrosOutput - The return type for the estimateCaloriesMacros function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateCaloriesMacrosInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  mealDescription: z
    .string()
    .optional()
    .describe('An optional user-provided description of the meal to improve estimation accuracy.'),
});
export type EstimateCaloriesMacrosInput = z.infer<typeof EstimateCaloriesMacrosInputSchema>;

const EstimateCaloriesMacrosOutputSchema = z.object({
  estimatedCalories: z.number().describe('The estimated calorie count of the meal.'),
  macroBreakdown: z.object({
    protein: z.number().describe('The estimated protein content of the meal in grams.'),
    carbs: z.number().describe('The estimated carbohydrate content of the meal in grams.'),
    fat: z.number().describe('The estimated fat content of the meal in grams.'),
  }).describe('The estimated macro breakdown of the meal.'),
});
export type EstimateCaloriesMacrosOutput = z.infer<typeof EstimateCaloriesMacrosOutputSchema>;

export async function estimateCaloriesMacros(input: EstimateCaloriesMacrosInput): Promise<EstimateCaloriesMacrosOutput> {
  return estimateCaloriesMacrosFlow(input);
}

const estimateCaloriesMacrosPrompt = ai.definePrompt({
  name: 'estimateCaloriesMacrosPrompt',
  input: {schema: EstimateCaloriesMacrosInputSchema},
  output: {schema: EstimateCaloriesMacrosOutputSchema},
  prompt: `You are a nutrition expert. You will estimate the calorie count and macro breakdown (protein, carbs, fat) of a meal.

  Use the following as sources of information about the meal.
  Photo: {{media url=photoDataUri}}
  {{#if mealDescription}}
  User's description: {{{mealDescription}}}
  {{/if}}

  Prioritize the user's description if it provides specific details about ingredients or quantities, but also use the photo to visually assess portion sizes and identify items not mentioned in the description. If the description and photo seem to conflict, try to make a reasonable interpretation or focus on the more specific information.

  Return the estimated calorie count and macro breakdown in the following JSON format:
  {
    "estimatedCalories": number,
    "macroBreakdown": {
      "protein": number,
      "carbs": number,
      "fat": number
    }
  }`,
});

const estimateCaloriesMacrosFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesMacrosFlow',
    inputSchema: EstimateCaloriesMacrosInputSchema,
    outputSchema: EstimateCaloriesMacrosOutputSchema,
  },
  async input => {
    const {output} = await estimateCaloriesMacrosPrompt(input);
    return output!;
  }
);
