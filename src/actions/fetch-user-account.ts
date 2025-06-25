'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { UserAccount } from '@/types';
import * as Sentry from '@sentry/nextjs';

/**
 * Implementation of the fetchUserAccount server action
 * @param userId - The Firebase Auth user ID
 * @returns The user account document
 * @throws Error if the user is not found or if there's a server error
 */
async function fetchUserAccountImplementation(userId: string): Promise<UserAccount | null> {
  if (!userId) throw new Error('User ID is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'user.fetch',
      message: 'Fetching user account',
      level: 'info',
    });

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      Sentry.addBreadcrumb({
        category: 'user.fetch',
        message: 'User account not found',
        level: 'info',
      });
      return null; // User document doesn't exist yet
    }

    const userData = userDoc.data();

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'user.fetch',
      message: 'User account fetched successfully',
      level: 'info',
    });

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

/**
 * Server action to fetch a user document from Firestore
 * Wrapped with Sentry monitoring
 */
export const fetchUserAccount = withSentryServerAction(
  'fetchUserAccount',
  fetchUserAccountImplementation,
);
