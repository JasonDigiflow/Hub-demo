import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
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
    
    const results = {
      migrated: [],
      errors: [],
      skipped: []
    };
    
    // Get all ad accounts
    const adAccountsSnapshot = await db
      .collection('organizations').doc(orgId)
      .collection('adAccounts')
      .get();
    
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const adAccountId = adAccountDoc.id;
      console.log(`Processing ad account: ${adAccountId}`);
      
      // Get all prospects in this ad account
      const prospectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc(adAccountId)
        .collection('prospects')
        .get();
      
      console.log(`Found ${prospectsSnapshot.size} prospects in ${adAccountId}`);
      
      // Process each prospect
      for (const doc of prospectsSnapshot.docs) {
        const currentId = doc.id;
        const data = doc.data();
        
        // Check if this prospect has a metaId and needs migration
        if (data.metaId && !currentId.startsWith('LEAD_')) {
          try {
            // The new ID should be the metaId (which already has LEAD_ prefix)
            const newId = data.id || data.metaId; // data.id contains "LEAD_XXX"
            
            if (newId && newId.startsWith('LEAD_')) {
              console.log(`Migrating ${currentId} to ${newId}`);
              
              // Create new document with Meta ID
              const newDocRef = db
                .collection('organizations').doc(orgId)
                .collection('adAccounts').doc(adAccountId)
                .collection('prospects').doc(newId);
              
              // Copy all data to new document
              await newDocRef.set(data);
              
              // Delete old document
              await doc.ref.delete();
              
              results.migrated.push({
                oldId: currentId,
                newId: newId,
                name: data.name
              });
            } else {
              results.skipped.push({
                id: currentId,
                reason: 'No valid Meta ID found',
                data: { name: data.name, metaId: data.metaId }
              });
            }
          } catch (error) {
            results.errors.push({
              id: currentId,
              error: error.message
            });
          }
        } else if (currentId.startsWith('LEAD_')) {
          // Already has Meta ID format
          results.skipped.push({
            id: currentId,
            reason: 'Already using Meta ID'
          });
        } else {
          results.skipped.push({
            id: currentId,
            reason: 'No Meta ID available',
            name: data.name
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        migrated: results.migrated.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}