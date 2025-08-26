import { NextResponse } from 'next/server';

export async function GET() {
  // Check Firebase config
  const config = {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    hasMeasurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    // Show partial project ID for debugging (safe to show)
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
      ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.substring(0, 5) + '...' 
      : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV
  };

  return NextResponse.json({ 
    message: 'Firebase config status',
    config,
    allConfigured: Object.entries(config)
      .filter(([key]) => key.startsWith('has'))
      .every(([, value]) => value === true)
  });
}