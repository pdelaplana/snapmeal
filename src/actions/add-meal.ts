'use server';

import { db } from '@/lib/firebase-admin'; // Server-side Firebase Admin SDK
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { AddMealDTO } from '@/types/meal';
import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Implementation of the addMeal server action
 */
async function addMealImplementation(userId: string, addMealDto: AddMealDTO): Promise<string> {
  if (!userId) throw new Error('User ID is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Set custom tags for filtering in Sentry dashboard
    Sentry.setTag('mealType', addMealDto.mealType);

    // Make the Firestore call
    const user = db.collection('users').doc(userId);
    const mealsCollection = user.collection('meals');

    const docRef = await mealsCollection.add({
      ...addMealDto,
      date: Timestamp.fromDate(addMealDto.date),
      created: Timestamp.now(),
      updated: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Server error adding meal:', error);
    throw new Error('Failed to add meal');
  }
}

/**
 * Server action to add a meal to Firestore
 * Wrapped with Sentry monitoring
 */
export const addMeal = withSentryServerAction('addMeal', addMealImplementation);
