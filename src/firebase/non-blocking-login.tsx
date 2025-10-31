'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '.';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, name: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      // Update profile
      return updateProfile(user, { displayName: name })
        .then(() => {
          // Create user document in Firestore
          const { firestore } = initializeFirebase(); // Make sure firestore is initialized
          const userDocRef = doc(firestore, 'users', user.uid);
          return setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            name: name,
          });
        });
    })
    .catch(error => {
      // Errors will be caught by onAuthStateChanged listener or you can handle them here
      console.error("Sign up error:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
