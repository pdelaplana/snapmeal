'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { UserAccount } from '@/types';
import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';

interface AddUserAccountDTO {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

/**
 * Implementation of the addUserAccount server action
 * @param input - User account creation data
 * @returns The created user account
 * @throws Error if there's a server error or if required fields are missing
 */
async function addUserAccountImplementation(
  addUserAccountDTO: AddUserAccountDTO,
): Promise<UserAccount> {
  if (!addUserAccountDTO.userId) throw new Error('User ID is required');
  if (!addUserAccountDTO.email) throw new Error('Email is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: addUserAccountDTO.userId });

    // Set custom tags for filtering in Sentry dashboard
    Sentry.setTag('email', addUserAccountDTO.email);

    // Check if user document already exists
    const userRef = db.collection('users').doc(addUserAccountDTO.userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      throw new Error(`User account already exists for ID: ${addUserAccountDTO.userId}`);
    }

    const now = new Date();

    // Create the user object
    const userAccount = {
      email: addUserAccountDTO.email,
      displayName: addUserAccountDTO.displayName || '',
      photoURL: addUserAccountDTO.photoURL || '',
      created: Timestamp.fromDate(now),
      updated: Timestamp.fromDate(now),
    };

    // Save to Firestore
    await userRef.set(userAccount);

    // Add breadcrumb for successful account creation
    Sentry.addBreadcrumb({
      category: 'user.account',
      message: 'User account created successfully',
      level: 'info',
      data: {
        userId: addUserAccountDTO.userId,
      },
    });

    // Return the created account with ID
    return {
      id: userRef.id,
      email: userAccount.email,
      displayName: userAccount.displayName,
      created: userAccount.created.toDate(),
      updated: userAccount.updated.toDate(),
    } as UserAccount;
  } catch (error) {
    console.error('Server error creating user account:', error);
    throw new Error(
      `Failed to create user account: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Server action to create a new user account in Firestore
 * Wrapped with Sentry monitoring
 */
export const addUserAccount = withSentryServerAction(
  'addUserAccount',
  addUserAccountImplementation,
);
