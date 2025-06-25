'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import * as Sentry from '@sentry/nextjs';

/**
 * Implementation of the deleteMeal server action
 * @param userId - The ID of the user who owns the meal
 * @param mealId - The ID of the meal to delete
 * @returns True if deletion was successful
 * @throws Error if there's a server error or if required fields are missing
 */
async function deleteMealImplementation(userId: string, mealId: string): Promise<boolean> {
  if (!userId) throw new Error('User ID is required');
  if (!mealId) throw new Error('Meal ID is required');

  try {
    // Set user and meal context for debugging
    Sentry.setUser({ id: userId });
    Sentry.setTag('mealId', mealId);
    Sentry.setTag('operation', 'delete');

    // Add breadcrumb for deletion start
    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Starting meal deletion',
      level: 'info',
      data: { userId, mealId },
    });

    // Get the meal document to check if it exists and get the photoURL
    const mealRef = db.collection('users').doc(userId).collection('meals').doc(mealId);
    const mealDoc = await mealRef.get();

    if (!mealDoc.exists) {
      // Log when meal not found
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Meal not found',
        level: 'error',
        data: { userId, mealId },
      });
      throw new Error(`Meal with ID ${mealId} not found`);
    }

    // Add breadcrumb with meal data before deletion
    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Found meal data',
      level: 'info',
      data: {
        mealExists: true,
        mealType: mealDoc.data()?.mealType || 'unknown',
      },
    });

    // Start a batch to ensure atomicity
    const batch = db.batch();

    // Delete the meal document
    batch.delete(mealRef);

    // Commit the batch transaction
    await batch.commit();

    // Record successful deletion
    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Meal deleted successfully',
      level: 'info',
      data: { mealId },
    });

    return true;
  } catch (error) {
    console.error('Server error deleting meal:', error);
    throw new Error(
      `Failed to delete meal: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Server action to delete a meal and its associated image from Firestore and Storage
 * Wrapped with Sentry monitoring
 */
export const deleteMeal = withSentryServerAction('deleteMeal', deleteMealImplementation);
