// src/lib/config.ts

// Helper function to get boolean environment variables
const getBooleanEnv = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

// App version from package.json
const APP_VERSION = '0.1.0'; // Hardcoded from package.json for client-side use
// This could be updated by CI/CD pipeline or build script
const BUILD_NUMBER = '42'; // Increment this with each release

export const config = {
  version: APP_VERSION,
  build: BUILD_NUMBER,
  features: {
    enableSharing: getBooleanEnv('NEXT_PUBLIC_ENABLE_SHARING_FEATURE', false),
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  // Add other configurations as needed
};

// Validate essential Firebase config from here as well if desired, or rely on firebase.ts
if (!config.firebase.apiKey || !config.firebase.authDomain || !config.firebase.projectId) {
  console.warn(
    'Firebase configuration warning from config.ts: Potentially missing API Key, Auth Domain, or Project ID. ' +
      'This might affect Firebase services if not correctly set via environment variables.',
  );
}
