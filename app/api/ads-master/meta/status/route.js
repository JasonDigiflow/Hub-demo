import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const connectionCookie = cookieStore.get('meta_connection');
    
    if (!connectionCookie) {
      return NextResponse.json({
        connected: false,
        adAccounts: [],
        lastSync: null
      });
    }

    const connectionData = JSON.parse(connectionCookie.value);
    
    // Check if token is still valid
    const testResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${connectionData.accessToken}`
    );
    
    if (!testResponse.ok) {
      // Token expired, clear cookie
      const response = NextResponse.json({
        connected: false,
        adAccounts: [],
        lastSync: null
      });
      response.cookies.delete('meta_connection');
      return response;
    }

    // Get cache data if exists
    const cacheCookie = cookieStore.get('meta_cache');
    let lastSync = null;
    if (cacheCookie) {
      const cacheData = JSON.parse(cacheCookie.value);
      lastSync = cacheData.lastSync;
    }

    return NextResponse.json({
      connected: true,
      user: {
        id: connectionData.userId,
        name: connectionData.userName,
        email: connectionData.userEmail
      },
      adAccounts: connectionData.adAccounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        currency: acc.currency,
        status: acc.account_status
      })),
      lastSync: lastSync,
      connectedAt: connectionData.connectedAt
    });
  } catch (error) {
    console.error('Error checking Meta status:', error);
    return NextResponse.json({
      connected: false,
      adAccounts: [],
      lastSync: null,
      error: 'Failed to check connection status'
    });
  }
}