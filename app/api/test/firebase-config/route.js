import { NextResponse } from 'next/server';

export async function GET() {
  // Retourner la configuration Firebase utilisée par l'application
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Masquer partiellement les clés sensibles pour la sécurité
  const maskedConfig = {
    apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...${config.apiKey.substring(config.apiKey.length - 4)}` : 'NOT SET',
    authDomain: config.authDomain || 'NOT SET',
    projectId: config.projectId || 'NOT SET',
    storageBucket: config.storageBucket || 'NOT SET',
    messagingSenderId: config.messagingSenderId || 'NOT SET',
    appId: config.appId || 'NOT SET',
  };

  return NextResponse.json({
    status: 'Configuration Firebase',
    config: maskedConfig,
    hasAllKeys: !!(config.apiKey && config.authDomain && config.projectId && config.appId),
    timestamp: new Date().toISOString()
  });
}