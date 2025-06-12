import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function getServiceAccountCredentials() {
  // For local development, you can still use the local file
  if (process.env.NODE_ENV === 'development') {
    try {
      return `${process.cwd()}/secrets/snapmeal-firebase-adminsdk.json`;
    } catch (e) {
      console.warn('Local credentials file not found, falling back to Secret Manager');
    }
  }

  // For production, fetch from Secret Manager
  try {
    // Import Secret Manager only when needed
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();

    const secretName = process.env.FIREBASE_ADMIN_SECRET_NAME || 'firebase-admin-sdk-credentials';
    const secretVersion = process.env.FIREBASE_ADMIN_SECRET_VERSION || 'latest';
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const name = `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`;

    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString();

    return JSON.parse(payload);
  } catch (error) {
    console.error('Error fetching credentials from Secret Manager:', error);
    throw new Error('Could not initialize Firebase Admin: credentials unavailable');
  }
}

// Initialize Firebase Admin SDK
async function initializeFirebaseAdmin() {
  const apps = getApps();

  if (apps.length > 0) {
    return apps[0];
  }

  const credentials = await getServiceAccountCredentials();

  return initializeApp({
    credential: cert(credentials),
  });
}

export const firebaseAdminApp = await initializeFirebaseAdmin();

export const db = getFirestore(firebaseAdminApp, 'development');
