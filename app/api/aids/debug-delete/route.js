import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  const debug = {
    auth: {},
    firebase: {},
    data: {},
    tests: []
  };

  try {
    // 1. Check authentication
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    debug.auth.hasAuthCookie = !!authCookie;
    debug.auth.hasMetaSession = !!metaSession;
    
    let userId = null;
    
    if (authCookie) {
      try {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
        debug.auth.userId = userId;
        debug.auth.jwtValid = true;
      } catch (e) {
        debug.auth.jwtError = e.message;
      }
    }
    
    if (!userId && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userID || session.userId;
        debug.auth.userIdFromMeta = userId;
      } catch (e) {
        debug.auth.metaError = e.message;
      }
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Non authentifié',
        debug 
      }, { status: 401 });
    }
    
    // 2. Check Firebase configuration
    debug.firebase.isInitialized = !!db;
    debug.firebase.hasCollectionMethod = typeof db?.collection === 'function';
    
    // 3. Get organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      debug.data.userExists = userDoc.exists;
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
        debug.data.orgId = orgId;
        debug.data.userData = userData;
      }
    } catch (error) {
      debug.data.userError = error.message;
    }
    
    // 4. Test reading prospects
    try {
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      debug.data.adAccounts = adAccountsSnapshot.size;
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        
        const prospectsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects')
          .get();
        
        debug.data[`prospects_${adAccountId}`] = prospectsSnapshot.size;
        
        // Try to get the first prospect
        if (prospectsSnapshot.size > 0) {
          const firstDoc = prospectsSnapshot.docs[0];
          debug.tests.push({
            test: 'Read first prospect',
            id: firstDoc.id,
            data: firstDoc.data(),
            exists: firstDoc.exists
          });
          
          // Try to delete it
          try {
            // First, try to read it again directly
            const directRead = await firstDoc.ref.get();
            debug.tests.push({
              test: 'Direct read',
              exists: directRead.exists,
              id: directRead.id
            });
            
            // Now try to delete
            await firstDoc.ref.delete();
            
            // Check if it's really deleted
            const afterDelete = await firstDoc.ref.get();
            debug.tests.push({
              test: 'After delete',
              exists: afterDelete.exists,
              deleted: !afterDelete.exists
            });
            
            // If it wasn't deleted, try again with the document reference
            if (afterDelete.exists) {
              const docRef = db
                .collection('organizations').doc(orgId)
                .collection('adAccounts').doc(adAccountId)
                .collection('prospects').doc(firstDoc.id);
              
              await docRef.delete();
              
              const afterSecondDelete = await docRef.get();
              debug.tests.push({
                test: 'After second delete attempt',
                exists: afterSecondDelete.exists,
                deleted: !afterSecondDelete.exists
              });
            }
            
          } catch (deleteError) {
            debug.tests.push({
              test: 'Delete error',
              error: deleteError.message,
              stack: deleteError.stack
            });
          }
        }
      }
    } catch (error) {
      debug.data.readError = error.message;
    }
    
    // 5. Test revenues
    try {
      const revenuesSnapshot = await db.collection('aids_revenues').get();
      debug.data.revenues = revenuesSnapshot.size;
      
      if (revenuesSnapshot.size > 0) {
        const firstRevenue = revenuesSnapshot.docs[0];
        
        try {
          await firstRevenue.ref.delete();
          const afterDelete = await firstRevenue.ref.get();
          debug.tests.push({
            test: 'Revenue delete',
            deleted: !afterDelete.exists
          });
        } catch (e) {
          debug.tests.push({
            test: 'Revenue delete error',
            error: e.message
          });
        }
      }
    } catch (error) {
      debug.data.revenueError = error.message;
    }
    
    // 6. Check Firebase Admin SDK
    debug.firebase.adminSDK = {
      hasFirestore: !!db._firestore,
      hasSettings: !!db._settings,
      isWrapper: !db._firestore && !db._settings
    };
    
    return NextResponse.json({
      success: true,
      debug,
      recommendation: getRecommendation(debug)
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      debug
    }, { status: 500 });
  }
}

function getRecommendation(debug) {
  if (debug.firebase.adminSDK.isWrapper) {
    return "Firebase utilise un wrapper personnalisé. Les suppressions peuvent ne pas fonctionner correctement.";
  }
  
  if (debug.tests.some(t => t.error)) {
    return "Erreurs de suppression détectées. Vérifiez les permissions Firebase.";
  }
  
  if (debug.tests.some(t => t.deleted === false)) {
    return "Les suppressions ne fonctionnent pas. Le wrapper Firebase peut être en mode lecture seule.";
  }
  
  return "Configuration semble correcte.";
}