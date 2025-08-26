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
      deleted: [],
      kept: [],
      errors: []
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
      
      // Group prospects by Meta ID
      const prospectsByMetaId = new Map();
      
      prospectsSnapshot.forEach(doc => {
        const data = doc.data();
        const metaId = data.metaId || data.id;
        
        // Only process if it has a Meta ID
        if (metaId && metaId.startsWith('LEAD_')) {
          if (!prospectsByMetaId.has(metaId)) {
            prospectsByMetaId.set(metaId, []);
          }
          prospectsByMetaId.get(metaId).push({
            docId: doc.id,
            data: data,
            ref: doc.ref
          });
        }
      });
      
      // Process duplicates
      for (const [metaId, prospects] of prospectsByMetaId.entries()) {
        if (prospects.length > 1) {
          console.log(`Found ${prospects.length} duplicates for Meta ID: ${metaId}`);
          
          // Sort by creation date (keep the oldest) or by whether it's already using Meta ID as doc ID
          prospects.sort((a, b) => {
            // Priorité 1: Garder celui qui utilise déjà le Meta ID comme doc ID
            if (a.docId === metaId) return -1;
            if (b.docId === metaId) return 1;
            
            // Priorité 2: Garder celui qui a le plus de données (status converted, revenue, etc.)
            const aHasRevenue = a.data.status === 'converted' || a.data.revenueAmount;
            const bHasRevenue = b.data.status === 'converted' || b.data.revenueAmount;
            if (aHasRevenue && !bHasRevenue) return -1;
            if (!aHasRevenue && bHasRevenue) return 1;
            
            // Priorité 3: Garder le plus ancien
            const aDate = new Date(a.data.createdAt || 0);
            const bDate = new Date(b.data.createdAt || 0);
            return aDate - bDate;
          });
          
          // Keep the first one, delete the rest
          const toKeep = prospects[0];
          results.kept.push({
            metaId,
            docId: toKeep.docId,
            name: toKeep.data.name,
            adAccountId
          });
          
          // Delete duplicates
          for (let i = 1; i < prospects.length; i++) {
            const toDelete = prospects[i];
            try {
              await toDelete.ref.delete();
              results.deleted.push({
                metaId,
                docId: toDelete.docId,
                name: toDelete.data.name,
                adAccountId
              });
              console.log(`Deleted duplicate: ${toDelete.docId} (Meta ID: ${metaId})`);
            } catch (error) {
              results.errors.push({
                metaId,
                docId: toDelete.docId,
                error: error.message
              });
            }
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        deleted: results.deleted.length,
        kept: results.kept.length,
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