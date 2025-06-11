'use server';

import { db } from '@/lib/firebase-admin'; // Server-side Firebase Admin SDK
import type { AddMealDTO } from '@/types/meal';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Server action to add a meal to Firestore
 */
export async function addMeal(userId: string, addMealDto: AddMealDTO): Promise<string> {
  if (!userId) throw new Error('User ID is required');

  try {
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
