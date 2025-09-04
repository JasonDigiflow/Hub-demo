import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
let app;

if (!getApps().length) {
  // En production, utiliser les variables d'environnement
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // En développement, utiliser l'émulateur ou les credentials par défaut
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'digiflow-hub',
    });
  }
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const db = getFirestore(app);

export default app;