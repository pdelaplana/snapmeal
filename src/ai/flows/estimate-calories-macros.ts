
'use server';

/**
 * @fileOverview AI agent that estimates the calorie count and macro breakdown of a meal from a photo and an optional description.
 * It also determines if a meal is detected in the photo.
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

export const EstimateCaloriesMacrosOutputSchema = z.object({
  isMealDetected: z.boolean().describe('Whether a meal was detected in the photo.'),
  estimatedCalories: z.number().optional().nullable().describe('The estimated calorie count of the meal. Provided only if a meal is detected, otherwise null.'),
  macroBreakdown: z.object({
    protein: z.number().describe('The estimated protein content of the meal in grams.'),
    carbs: z.number().describe('The estimated carbohydrate content of the meal in grams.'),
    fat: z.number().describe('The estimated fat content of the meal in grams.'),
  }).optional().nullable().describe('The estimated macro breakdown of the meal. Provided only if a meal is detected, otherwise null.'),
});
export type EstimateCaloriesMacrosOutput = z.infer<typeof EstimateCaloriesMacrosOutputSchema>;

export async function estimateCaloriesMacros(input: EstimateCaloriesMacrosInput): Promise<EstimateCaloriesMacrosOutput> {
  return estimateCaloriesMacrosFlow(input);
}

const estimateCaloriesMacrosPrompt = ai.definePrompt({
  name: 'estimateCaloriesMacrosPrompt',
  input: {schema: EstimateCaloriesMacrosInputSchema},
  output: {schema: EstimateCaloriesMacrosOutputSchema},
  prompt: `You are a nutrition expert. Your first task is to determine if the provided photo clearly shows a meal.

If a meal is detected:
  Set 'isMealDetected' to true.
  Estimate the calorie count and macro breakdown (protein, carbs, fat) for the meal.
  Return these details in the JSON format specified below.

If no meal is detected in the photo:
  Set 'isMealDetected' to false.
  'estimatedCalories' and 'macroBreakdown' should be set to null or omitted from the JSON response.

Use the following as sources of information about the meal.
Photo: {{media url=photoDataUri}}
{{#if mealDescription}}
User's description: {{{mealDescription}}}
{{/if}}

Prioritize the user's description if it provides specific details about ingredients or quantities, but also use the photo to visually assess portion sizes and identify items not mentioned in the description. If the description and photo seem to conflict, try to make a reasonable interpretation or focus on the more specific information.

Respond ONLY with a valid JSON object adhering to the specified output schema. Do not add any explanatory text before or after the JSON.

Example for a detected meal:
{
  "isMealDetected": true,
  "estimatedCalories": 500,
  "macroBreakdown": {
    "protein": 30,
    "carbs": 50,
    "fat": 20
  }
}
Example if no meal is detected (option 1: with nulls):
{
  "isMealDetected": false,
  "estimatedCalories": null,
  "macroBreakdown": null
}
Example if no meal is detected (option 2: fields omitted):
{
  "isMealDetected": false
}`,
});

const estimateCaloriesMacrosFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesMacrosFlow',
    inputSchema: EstimateCaloriesMacrosInputSchema,
    outputSchema: EstimateCaloriesMacrosOutputSchema,
  },
  async input => {
    const response = await estimateCaloriesMacrosPrompt(input);
    
    if (response.error) {
      console.error('Error from AI model:', response.error);
      throw new Error(`AI model failed to generate a response: ${response.error.message || 'Reason unknown'}`);
    }

    if (!response.output) {
      console.error('AI model returned no output and no error. Raw response candidates:', response.candidates);
      throw new Error('AI model returned no valid output. This might be due to content filtering or an issue with the prompt response format.');
    }
    
    return response.output;
  }
);
    
