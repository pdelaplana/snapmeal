'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { Meal, UpdateMealDTO } from '@/types/meal';
import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Implementation of the updateMeal server action
 * @param userId - The ID of the user who owns the meal
 * @param updateMealDto - The meal data to update
 * @returns The updated meal ID
 * @throws Error if there's a server error or if required fields are missing
 */
async function updateMealImplementation(
  userId: string,
  updateMealDto: UpdateMealDTO,
): Promise<string> {
  if (!userId) throw new Error('User ID is required');
  if (!updateMealDto.id) throw new Error('Meal ID is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Set identifying information about the meal
    Sentry.setTag('mealId', updateMealDto.id);
    Sentry.setTag('mealType', updateMealDto.mealType);

    const mealRef = db.collection('users').doc(userId).collection('meals').doc(updateMealDto.id);
    const mealDoc = await mealRef.get();

    if (!mealDoc.exists) {
      throw new Error(`Meal with ID ${updateMealDto.id} not found`);
    }

    // Remove id from the data to be updated
    const { id, ...updateData } = updateMealDto;

    // Update the document in Firestore
    await mealRef.update({
      ...updateData,
      date: updateData.date ? Timestamp.fromDate(updateData.date) : Timestamp.now(),
      updated: Timestamp.now(),
    });

    return id;
  } catch (error) {
    console.error('Server error updating meal:', error);
    throw new Error(
      `Failed to update meal: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Server action to update a meal in Firestore
 * Wrapped with Sentry monitoring
 */
export const updateMeal = withSentryServerAction('updateMeal', updateMealImplementation);
