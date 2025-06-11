'use server';

import { db } from '@/lib/firebase-admin';
import type { UserAccount } from '@/types';
import { add } from 'date-fns';
import { Timestamp } from 'firebase-admin/firestore';

interface AddUserAccountDTO {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

/**
 * Server action to create a new user account in Firestore
 * @param input - User account creation data
 * @returns The created user account
 * @throws Error if there's a server error or if required fields are missing
 */
export async function addUserAccount(addUserAccountDTO: AddUserAccountDTO): Promise<UserAccount> {
  if (!addUserAccountDTO.userId) throw new Error('User ID is required');
  if (!addUserAccountDTO.email) throw new Error('Email is required');

  try {
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
