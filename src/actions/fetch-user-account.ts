'use server';

import { db } from '@/lib/firebase-admin';
import type { UserAccount } from '@/types';

/**
 * Server action to fetch a user document from Firestore
 * @param userId - The Firebase Auth user ID
 * @returns The user account document
 * @throws Error if the user is not found or if there's a server error
 */
export async function fetchUserAccount(userId: string): Promise<UserAccount | null> {
  if (!userId) throw new Error('User ID is required');

  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return null; // User document doesn't exist yet
    }

    const userData = userDoc.data();

    // Convert Firestore Timestamps to JavaScript Date objects and format the response
    return {
      id: userDoc.id,
      email: userData?.email,
      displayName: userData?.displayName,
      created: userData?.created.toDate() || null,
      updated: userData?.updated.toDate() || null,
    } as UserAccount;
  } catch (error) {
    console.error('Server error fetching user account:', error);
    throw new Error(
      `Failed to fetch user account: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
