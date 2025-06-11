'use server';

import { db } from '@/lib/firebase-admin';
import type { Meal } from '@/types';

/**
 * Server action to fetch a single meal by ID from Firestore
 * @param userId - The ID of the user who owns the meal
 * @param mealId - The ID of the meal to fetch
 * @returns The meal object with its ID
 * @throws Error if the meal is not found or if there's a server error
 */
export async function fetchMealById(userId: string, mealId: string): Promise<Meal> {
  if (!userId) throw new Error('User ID is required');
  if (!mealId) throw new Error('Meal ID is required');

  try {
    const mealDoc = await db.collection('users').doc(userId).collection('meals').doc(mealId).get();

    if (!mealDoc.exists) {
      throw new Error(`Meal with ID ${mealId} not found`);
    }

    const mealData = mealDoc.data();

    // Convert Firestore Timestamps to JavaScript Date objects
    const meal: Meal = {
      id: mealDoc.id,
      ...mealData,
      date: mealData?.date?.toDate(),
      created: mealData?.created?.toDate(),
      updated: mealData?.updated?.toDate(),
    } as Meal;

    return meal;
  } catch (error) {
    console.error('Server error fetching meal:', error);
    throw new Error(
      `Failed to fetch meal: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
