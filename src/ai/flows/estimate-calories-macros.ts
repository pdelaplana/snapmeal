'use server';

/**
 * @fileOverview AI agent that estimates the calorie count and macro breakdown of a meal from a photo and an optional description.
 * It also determines if a meal is detected in the photo, allows specifying the type of estimation, and lists recognized food items.
 *
 * - estimateCaloriesMacros - A function that handles the estimation process.
 * - EstimateCaloriesMacrosInput - The input type for the estimateCaloriesMacros function.
 * - EstimateCaloriesMacrosOutput - The return type for the estimateCaloriesMacros function.
 */

import { ai } from '@/ai/genkit';
import type { EstimationType } from '@/types';
import { z } from 'genkit';

const EstimateCaloriesMacrosInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
  mealDescription: z
    .string()
    .optional()
    .describe('An optional user-provided description of the meal to improve estimation accuracy.'),
  estimationType: z
    .enum(['calories_macros', 'calories_only', 'macros_only'])
    .default('calories_macros' as EstimationType)
    .describe(
      'Specifies what to estimate: both calories and macros, only calories, or only macros.',
    ),
});
export type EstimateCaloriesMacrosInput = z.infer<typeof EstimateCaloriesMacrosInputSchema>;

const EstimateCaloriesMacrosOutputSchema = z.object({
  isMealDetected: z.boolean().describe('Whether a meal was detected in the photo.'),
  estimatedCalories: z
    .number()
    .optional()
    .nullable()
    .describe(
      'The estimated calorie count of the meal. Provided if requested and a meal is detected, otherwise null.',
    ),
  macroBreakdown: z
    .object({
      protein: z.number().describe('The estimated protein content of the meal in grams.'),
      carbs: z.number().describe('The estimated carbohydrate content of the meal in grams.'),
      fat: z.number().describe('The estimated fat content of the meal in grams.'),
    })
    .optional()
    .nullable()
    .describe(
      'The estimated macro breakdown of the meal. Provided if requested and a meal is detected, otherwise null.',
    ),
  recognizedItems: z
    .array(z.string())
    .optional()
    .nullable()
    .describe(
      'A list of distinct food items or ingredients recognized in the meal, or null if none identified or no meal detected.',
    ),
});
export type EstimateCaloriesMacrosOutput = z.infer<typeof EstimateCaloriesMacrosOutputSchema>;

export async function estimateCaloriesMacros(
  input: EstimateCaloriesMacrosInput,
): Promise<EstimateCaloriesMacrosOutput> {
  return estimateCaloriesMacrosFlow(input);
}

const estimateCaloriesMacrosPrompt = ai.definePrompt({
  name: 'estimateCaloriesMacrosPrompt',
  input: { schema: EstimateCaloriesMacrosInputSchema },
  output: { schema: EstimateCaloriesMacrosOutputSchema },
  prompt: `You are a nutrition expert. Your first task is to determine if the provided photo clearly shows a meal.

If a meal IS detected:
  Set 'isMealDetected' to true.
  The user has requested estimation type: "{{{estimationType}}}".
  - If 'estimationType' is 'calories_macros' or 'calories_only': Estimate the calorie count and include it in 'estimatedCalories'.
  - If 'estimationType' is 'calories_macros' or 'macros_only': Estimate the macro breakdown (protein, carbs, fat in grams) and include it in 'macroBreakdown'.
  - If 'estimationType' is 'calories_only', 'macroBreakdown' MUST be null.
  - If 'estimationType' is 'macros_only', 'estimatedCalories' MUST be null.
  - If 'estimationType' is 'calories_macros', both 'estimatedCalories' and 'macroBreakdown' should be populated.
  Also, identify up to 5-7 distinct, primary food items or ingredients visible in the photo and/or mentioned in the description. List them in the 'recognizedItems' array. If no specific items can be clearly identified but a meal is present, 'recognizedItems' can be an empty array or null.

If NO meal is detected in the photo:
  Set 'isMealDetected' to false.
  'estimatedCalories', 'macroBreakdown', and 'recognizedItems' MUST be set to null.

Use the following as sources of information about the meal.
Photo: {{media url=photoDataUri}}
{{#if mealDescription}}
User's description: {{{mealDescription}}}
{{/if}}

Prioritize the user's description if it provides specific details about ingredients or quantities, but also use the photo to visually assess portion sizes and identify items not mentioned in the description.

Respond ONLY with a valid JSON object adhering to the specified output schema. Do not add any explanatory text before or after the JSON.
Examples:
- Calories & Macros ('calories_macros'): { "isMealDetected": true, "estimatedCalories": 500, "macroBreakdown": { "protein": 30, "carbs": 50, "fat": 20 }, "recognizedItems": ["chicken breast", "brown rice", "broccoli"] }
- Calories Only ('calories_only'):   { "isMealDetected": true, "estimatedCalories": 500, "macroBreakdown": null, "recognizedItems": ["salad greens", "tomato", "cucumber"] }
- Macros Only ('macros_only'):     { "isMealDetected": true, "estimatedCalories": null, "macroBreakdown": { "protein": 30, "carbs": 50, "fat": 20 }, "recognizedItems": ["steak", "sweet potato"] }
- No Meal Detected: { "isMealDetected": false, "estimatedCalories": null, "macroBreakdown": null, "recognizedItems": null }`,
});

const estimateCaloriesMacrosFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesMacrosFlow',
    inputSchema: EstimateCaloriesMacrosInputSchema,
    outputSchema: EstimateCaloriesMacrosOutputSchema,
  },
  async (input: EstimateCaloriesMacrosInput): Promise<EstimateCaloriesMacrosOutput> => {
    try {
      const flowInput = {
        ...input,
        estimationType: input.estimationType || 'calories_macros',
      };

      const response = await estimateCaloriesMacrosPrompt(flowInput);

      if (response.error) {
        console.error(
          'Error from AI model with input:',
          JSON.stringify(flowInput),
          'Error:',
          response.error,
        );
        throw new Error(
          `AI model failed to generate a response: ${String(response.error.message || response.error || 'Reason unknown')}`,
        );
      }

      if (!response.output) {
        console.error(
          'AI model returned no output and no error. Input:',
          JSON.stringify(flowInput),
          'Raw response candidates:',
          response.candidates,
        );
        throw new Error(
          'AI model returned no valid output. This might be due to content filtering or an issue with the prompt response format.',
        );
      }

      const { output } = response;
      if (flowInput.estimationType === 'calories_only' && output.macroBreakdown !== null) {
        console.warn(
          'AI returned macros when only calories were requested. Correcting. Output:',
          output,
        );
        output.macroBreakdown = null;
      }
      if (flowInput.estimationType === 'macros_only' && output.estimatedCalories !== null) {
        console.warn(
          'AI returned calories when only macros were requested. Correcting. Output:',
          output,
        );
        output.estimatedCalories = null;
      }
      if (
        flowInput.estimationType === 'calories_macros' &&
        (output.estimatedCalories === null || output.macroBreakdown === null) &&
        output.isMealDetected
      ) {
        console.warn(
          'AI failed to return both calories and macros when requested and meal detected. Output:',
          output,
        );
      }
      if (!output.isMealDetected && output.recognizedItems !== null) {
        console.warn(
          'AI returned recognized items when no meal was detected. Correcting. Output:',
          output,
        );
        output.recognizedItems = null;
      }

      return output;
    } catch (flowError: any) {
      console.error(
        'Critical error in estimateCaloriesMacrosFlow with input:',
        JSON.stringify(input),
        'Error:',
        flowError,
      );
      // Ensure a valid structure is returned even in critical failure, adhering to schema for nullable fields
      return {
        isMealDetected: false,
        estimatedCalories: null,
        macroBreakdown: null,
        recognizedItems: null,
      };
    }
  },
);
