'use server';

import { db } from '@/lib/firebase-admin';

/**
 * Server action to delete a meal and its associated image from Firestore and Storage
 * @param userId - The ID of the user who owns the meal
 * @param mealId - The ID of the meal to delete
 * @returns True if deletion was successful
 * @throws Error if there's a server error or if required fields are missing
 */
export async function deleteMeal(userId: string, mealId: string): Promise<boolean> {
  if (!userId) throw new Error('User ID is required');
  if (!mealId) throw new Error('Meal ID is required');

  try {
    // Get the meal document to check if it exists and get the photoURL
    const mealRef = db.collection('users').doc(userId).collection('meals').doc(mealId);
    const mealDoc = await mealRef.get();

    if (!mealDoc.exists) {
      throw new Error(`Meal with ID ${mealId} not found`);
    }

    // Start a batch to ensure atomicity
    const batch = db.batch();

    // Delete the meal document
    batch.delete(mealRef);

    // Commit the batch transaction
    await batch.commit();

    return true;
  } catch (error) {
    console.error('Server error deleting meal:', error);
    throw new Error(
      `Failed to delete meal: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
