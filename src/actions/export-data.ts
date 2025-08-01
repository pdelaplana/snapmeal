'use server';

import { queueJob } from './queue-job';
import { withSentryServerAction } from '@/lib/sentry-server-action';

async function exportDataImplementation(userId: string): Promise<unknown> {
  if (!userId) throw new Error('User ID is required');

  return queueJob({
    jobType: 'exportData',
    userId,
    priority: 1,
  });
}

export const exportData = withSentryServerAction('exportData', exportDataImplementation);
