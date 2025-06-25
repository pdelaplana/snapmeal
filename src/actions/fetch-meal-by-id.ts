'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { Meal } from '@/types';
import * as Sentry from '@sentry/nextjs';

/**
 * Implementation of the fetchMealById server action
 * @param userId - The ID of the user who owns the meal
 * @param mealId - The ID of the meal to fetch
 * @returns The meal object with its ID
 * @throws Error if the meal is not found or if there's a server error
 */
async function fetchMealByIdImplementation(userId: string, mealId: string): Promise<Meal> {
  if (!userId) throw new Error('User ID is required');
  if (!mealId) throw new Error('Meal ID is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Set meal ID tag for filtering in Sentry dashboard
    Sentry.setTag('mealId', mealId);

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'meal.fetch',
      message: 'Fetching meal by ID',
      level: 'info',
      data: { mealId },
    });

    const mealDoc = await db.collection('users').doc(userId).collection('meals').doc(mealId).get();

    if (!mealDoc.exists) {
      Sentry.addBreadcrumb({
        category: 'meal.fetch',
        message: 'Meal not found',
        level: 'warning',
        data: { mealId },
      });
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

/**
 * Server action to fetch a single meal by ID from Firestore
 * Wrapped with Sentry monitoring
 */
export const fetchMealById = withSentryServerAction('fetchMealById', fetchMealByIdImplementation);
