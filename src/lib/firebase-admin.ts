import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const apps = getApps();
const firebaseAdminApp =
  apps.length > 0
    ? apps[0]
    : initializeApp({
        credential: cert(`${process.cwd()}/secrets/snapmeal-firebase-adminsdk.json`),
      });

export const db = getFirestore(firebaseAdminApp, 'development');
