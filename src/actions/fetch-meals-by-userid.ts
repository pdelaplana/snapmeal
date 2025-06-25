'use server';

import { db } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import type { Meal } from '@/types';
import * as Sentry from '@sentry/nextjs';

interface FetchMealsResult {
  meals: Meal[];
  lastDocId: string | null; // Document ID for cursor
  lastCursor: string | null; // Field value (date) for cursor
  hasMore: boolean;
}

/**
 * Implementation of the fetchMealsByUserId server action
 */
async function fetchMealsByUserIdImplementation(
  userId: string,
  limit = 10,
  cursorData: { docId: string | null; date: string | null } | null = null,
): Promise<FetchMealsResult> {
  if (!userId) throw new Error('User ID is required');

  try {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Set pagination tags for filtering in Sentry dashboard
    Sentry.setTag('limit', String(limit));
    Sentry.setTag('hasCursor', cursorData ? 'true' : 'false');

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'meals.fetch',
      message: 'Fetching meals for user',
      level: 'info',
      data: {
        limit,
        hasCursor: Boolean(cursorData),
        cursorDocId: cursorData?.docId || 'none',
      },
    });

    let query = db
      .collection('users')
      .doc(userId)
      .collection('meals')
      .orderBy('date', 'desc')
      .limit(limit + 1);

    // Apply cursor if provided (for pagination)
    if (cursorData?.docId && cursorData?.date) {
      // We need to get a reference to the actual document for startAfter
      //const docRef = db.collection('users').doc(userId).collection('meals').doc(cursorData.docId);
      //const cursorDoc = await docRef.get();

      //if (cursorDoc.exists) {
      //  query = query.startAfter(cursorDoc);
      //}
      query = query.startAfter(new Date(cursorData.date), cursorData.docId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      Sentry.addBreadcrumb({
        category: 'meals.fetch',
        message: 'No meals found',
        level: 'info',
      });
      return { meals: [], lastDocId: null, lastCursor: null, hasMore: false };
    }

    // Check if we have more results than the requested limit
    const hasMore = snapshot.docs.length > limit;

    // Only process up to 'limit' documents (discard the extra one we fetched)
    const docsToProcess = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    // Process meal documents
    const meals = docsToProcess.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        created: data.created?.toDate() || new Date(),
        updated: data.updated?.toDate() || new Date(),
      } as Meal;
    });

    // Get the last document for the next cursor
    const lastDoc = hasMore ? snapshot.docs[limit - 1] : snapshot.docs[snapshot.docs.length - 1];
    const lastDocId = lastDoc?.id || null;
    const lastDate = lastDoc?.data().date?.toDate().toISOString() || null;

    // Add success breadcrumb with result stats
    Sentry.addBreadcrumb({
      category: 'meals.fetch',
      message: 'Meals fetched successfully',
      level: 'info',
      data: {
        count: meals.length,
        hasMore,
      },
    });

    return {
      meals,
      lastDocId,
      lastCursor: lastDate,
      hasMore,
    };
  } catch (error) {
    console.error('Server error fetching meals:', error);
    throw new Error(
      `Failed to fetch meals: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Server action to fetch paginated meals for a specific user
 * Wrapped with Sentry monitoring
 */
export const fetchMealsByUserId = withSentryServerAction(
  'fetchMealsByUserId',
  fetchMealsByUserIdImplementation,
);
