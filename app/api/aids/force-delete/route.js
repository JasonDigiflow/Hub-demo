import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const results = {
    prospects: 0,
    revenues: 0,
    errors: []
  };

  try {
    // Get user authentication
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    let userId = null;
    
    if (authCookie) {
      try {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
      } catch (e) {
        console.error('JWT verification failed:', e.message);
      }
    }
    
    if (!userId && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userID || session.userId;
      } catch (e) {
        console.error('Meta session parse error:', e);
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Get user's organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
      }
    } catch (error) {
      console.log('Could not fetch user data');
    }
    
    console.log('=== FORCE DELETE STARTED ===');
    console.log('OrgId:', orgId);
    
    // 1. Delete prospects ONE BY ONE (no batch)
    try {
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      console.log(`Found ${adAccountsSnapshot.size} ad accounts`);
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        console.log(`Processing ad account: ${adAccountId}`);
        
        const prospectsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects')
          .get();
        
        console.log(`Found ${prospectsSnapshot.size} prospects to delete`);
        
        // Delete each one individually
        for (const doc of prospectsSnapshot.docs) {
          try {
            await doc.ref.delete();
            results.prospects++;
            if (results.prospects % 10 === 0) {
              console.log(`Deleted ${results.prospects} prospects...`);
            }
          } catch (error) {
            console.error(`Failed to delete prospect ${doc.id}:`, error.message);
            results.errors.push(`Prospect ${doc.id}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting prospects:', error);
      results.errors.push(`Prospects: ${error.message}`);
    }
    
    // 2. Delete revenues ONE BY ONE
    try {
      const revenuesSnapshot = await db
        .collection('aids_revenues')
        .get();
      
      console.log(`Found ${revenuesSnapshot.size} revenues to delete`);
      
      for (const doc of revenuesSnapshot.docs) {
        try {
          await doc.ref.delete();
          results.revenues++;
        } catch (error) {
          console.error(`Failed to delete revenue ${doc.id}:`, error.message);
          results.errors.push(`Revenue ${doc.id}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error deleting revenues:', error);
      results.errors.push(`Revenues: ${error.message}`);
    }
    
    // 3. Final verification
    let stillHasProspects = false;
    let stillHasRevenues = false;
    
    try {
      const finalCheckProspects = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc('adacc_meta_1756199456471')
        .collection('prospects')
        .get();
      
      stillHasProspects = finalCheckProspects.size > 0;
    } catch (e) {
      console.log('Could not verify prospects:', e.message);
    }
    
    try {
      const finalCheckRevenues = await db
        .collection('aids_revenues')
        .get();
      
      stillHasRevenues = finalCheckRevenues.size > 0;
    } catch (e) {
      console.log('Could not verify revenues:', e.message);
    }
    
    console.log('=== FORCE DELETE COMPLETED ===');
    console.log('Deleted:', results);
    console.log('Still has prospects:', stillHasProspects);
    console.log('Still has revenues:', stillHasRevenues);
    
    return NextResponse.json({
      success: true,
      deleted: results,
      stillHasData: {
        prospects: stillHasProspects,
        revenues: stillHasRevenues
      },
      message: `Force delete: ${results.prospects} prospects, ${results.revenues} revenus supprimés`
    });
    
  } catch (error) {
    console.error('Fatal error in force delete:', error);
    return NextResponse.json({
      error: error.message,
      results
    }, { status: 500 });
  }
}