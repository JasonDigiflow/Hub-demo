import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';

export async function GET() {
  const config = {
    hasAuth: auth !== null,
    hasDb: db !== null,
    env: {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production'
  };

  return NextResponse.json({
    firebaseStatus: config,
    message: config.hasAuth && config.hasDb 
      ? 'Firebase is configured and ready' 
      : 'Firebase is NOT configured - check environment variables'
  });
}