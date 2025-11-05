
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

/**
 * Initializes the Firebase Admin SDK, reusing the existing app if one exists.
 * This function is safe to call multiple times.
 * @returns The initialized Firebase Admin App.
 */
export function initializeAdminApp(): App {
  // If the app is already initialized, return it.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize the app with credentials.
  const app = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });

  return app;
}
