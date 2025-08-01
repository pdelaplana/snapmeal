'use server';

import { queueJob } from './queue-job';
import { withSentryServerAction } from '@/lib/sentry-server-action';

async function deleteAccountImplementation(userId: string): Promise<unknown> {
  if (!userId) throw new Error('User ID is required');

  return queueJob({
    jobType: 'deleteAccount',
    userId,
    priority: 2,
  });
}

export const deleteAccount = withSentryServerAction('deleteAccount', deleteAccountImplementation);
