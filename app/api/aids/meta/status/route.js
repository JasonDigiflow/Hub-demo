import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie) {
      return NextResponse.json({
        connected: false,
        accounts: [],
        selectedAccount: null,
        lastSync: null
      });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;
    const accountId = selectedAccountCookie?.value;
    
    // Get accounts from session
    const accounts = session.adAccounts || [];
    
    // Get last sync info from Firestore if we have userId and accountId
    let lastSyncTime = null;
    let nextSyncTime = null;
    
    if (userId && accountId) {
      try {
        const docRef = db.collection('insights_cache').doc(`${userId}_${accountId}`);
        const doc = await docRef.get();
        
        if (doc.exists) {
          const data = doc.data();
          if (data.lastSync) {
            lastSyncTime = data.lastSync.toMillis ? data.lastSync.toMillis() : data.lastSync;
          }
          if (data.nextSync) {
            nextSyncTime = data.nextSync.toMillis ? data.nextSync.toMillis() : data.nextSync;
          }
        }
      } catch (error) {
        console.error('[Status] Error fetching sync info from Firestore:', error);
      }
    }
    
    return NextResponse.json({
      connected: true,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name || acc.id,
        currency: acc.currency || 'EUR'
      })),
      selectedAccount: accountId,
      lastSync: lastSyncTime,
      nextSync: nextSyncTime,
      userId: userId
    });
    
  } catch (error) {
    console.error('[Status] Error:', error);
    return NextResponse.json({
      connected: false,
      accounts: [],
      selectedAccount: null,
      lastSync: null,
      error: error.message
    });
  }
}