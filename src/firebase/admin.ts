
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

/**
 * Initializes the Firebase Admin SDK, reusing the existing app if one exists.
 * This function is safe to call multiple times. It attempts to use Google
 * Application Default Credentials, which is the standard for managed environments.
 * @returns The initialized Firebase Admin App.
 */
export function initializeAdminApp(): App {
  // If the app is already initialized, return it.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize the app. In a managed environment like App Hosting,
  // the SDK will automatically discover credentials. No need to pass them.
  const app = initializeApp();

  return app;
}
