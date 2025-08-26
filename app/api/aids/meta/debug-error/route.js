import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  const debug = {
    cookies: {},
    user: {},
    firebase: {},
    error: null
  };

  try {
    // Check cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    
    debug.cookies = {
      hasMetaSession: !!sessionCookie,
      hasSelectedAccount: !!selectedAccountCookie,
      hasAuthToken: !!authCookie,
      selectedAccount: selectedAccountCookie?.value
    };
    
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        debug.cookies.metaSessionData = {
          hasAccessToken: !!session.accessToken,
          userID: session.userID,
          userEmail: session.userEmail
        };
      } catch (e) {
        debug.cookies.metaSessionError = e.message;
      }
    }
    
    // Check user authentication
    let userId = null;
    
    if (authCookie) {
      try {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
        debug.user.fromJWT = userId;
      } catch (e) {
        debug.user.jwtError = e.message;
      }
    }
    
    if (!userId && sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        userId = session.userID || session.userId;
        debug.user.fromMeta = userId;
      } catch (e) {
        debug.user.metaError = e.message;
      }
    }
    
    debug.user.finalUserId = userId;
    
    // Check Firebase
    debug.firebase = {
      dbInitialized: !!db,
      dbIsWrapper: !db._firestore && !db._settings,
      hasCollectionMethod: typeof db?.collection === 'function'
    };
    
    // Try to get user document
    if (userId && db) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        debug.firebase.userDocExists = userDoc.exists;
        
        if (userDoc.exists) {
          // SAFELY get user data
          try {
            const userData = userDoc.data();
            debug.firebase.userData = {
              hasOrgId: !!userData?.primaryOrgId,
              orgId: userData?.primaryOrgId,
              email: userData?.email
            };
          } catch (e) {
            debug.firebase.userDataError = e.message;
          }
        }
      } catch (e) {
        debug.firebase.userDocError = e.message;
      }
    }
    
    // Test Meta API
    if (sessionCookie && selectedAccountCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        const accountId = selectedAccountCookie.value;
        const accessToken = session.accessToken;
        
        const testUrl = `https://graph.facebook.com/v18.0/${accountId}?fields=id,name,account_status&access_token=${accessToken}`;
        
        const response = await fetch(testUrl);
        const data = await response.json();
        
        debug.metaApi = {
          status: response.status,
          accountId: data.id,
          accountName: data.name,
          accountStatus: data.account_status,
          error: data.error
        };
      } catch (e) {
        debug.metaApiError = e.message;
      }
    }
    
    return NextResponse.json({
      success: true,
      debug,
      message: 'Debug info collected successfully'
    });
    
  } catch (error) {
    debug.error = {
      message: error.message,
      stack: error.stack
    };
    
    return NextResponse.json({
      success: false,
      debug,
      error: error.message
    });
  }
}