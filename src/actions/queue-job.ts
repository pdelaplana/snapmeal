'use server';

import https from 'node:https';
import { auth } from '@/lib/firebase-admin';
import { withSentryServerAction } from '@/lib/sentry-server-action';
import * as Sentry from '@sentry/nextjs';

export interface QueueJobParams {
  jobType: string;
  userId: string;
  priority?: number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  additionalData?: Record<string, any>;
}

async function queueJobImplementation(params: QueueJobParams): Promise<unknown> {
  const { jobType, userId, priority = 1, additionalData = {} } = params;

  if (!jobType) throw new Error('Job type is required');
  if (!userId) throw new Error('User ID is required');

  try {
    Sentry.setUser({ id: userId });

    Sentry.addBreadcrumb({
      category: 'job.queue',
      message: `Queueing ${jobType} job`,
      level: 'info',
      data: { jobType, userId, priority },
    });

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const region = process.env.FIREBASE_FUNCTIONS_REGION || 'us-central1';
    const functionName = 'queueJob';

    if (!projectId) {
      throw new Error('Firebase project ID not configured');
    }

    const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase Web API key not configured');
    }

    const customToken = await auth.createCustomToken(userId);
    const idToken = await exchangeCustomTokenForIdToken(customToken, apiKey);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },

      body: JSON.stringify({
        data: {
          jobType,
          userId,
          priority,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Function call failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`Server error queueing ${jobType} job:`, error);
    throw new Error(
      `Failed to queue ${jobType} job: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function exchangeCustomTokenForIdToken(customToken: string, apiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const authData = {
      token: customToken,
      returnSecureToken: true,
    };

    const postData = JSON.stringify(authData);

    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.idToken) {
            resolve(response.idToken);
          } else {
            reject(new Error(response.error?.message || 'Failed to get ID token'));
          }
        } catch (error) {
          reject(new Error('Invalid response from Firebase Auth'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

export const queueJob = withSentryServerAction('queueJob', queueJobImplementation);
