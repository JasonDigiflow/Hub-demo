import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { prospectId } = await request.json();
    
    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID requis' }, { status: 400 });
    }
    
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
    
    const result = {
      prospectId,
      found: false,
      locations: []
    };
    
    // Check all ad accounts
    const adAccountsSnapshot = await db
      .collection('organizations').doc(orgId)
      .collection('adAccounts')
      .get();
    
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const adAccountId = adAccountDoc.id;
      try {
        // Essayer d'abord avec l'ID direct (pour les nouveaux prospects avec ID Meta)
        let prospectRef = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects').doc(prospectId);
        
        let prospectDoc = await prospectRef.get();
        
        // Si pas trouvé et que l'ID commence par LEAD_, chercher par metaId dans les données
        if (!prospectDoc.exists && prospectId.startsWith('LEAD_')) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('metaId', '==', prospectId)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
          }
        }
        
        // Si toujours pas trouvé, chercher par id dans les données
        if (!prospectDoc.exists) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('id', '==', prospectId)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
          }
        }
        
        if (prospectDoc.exists) {
          result.found = true;
          const data = prospectDoc.data();
          result.locations.push({
            adAccountId,
            firebaseId: prospectDoc.id,
            data: {
              name: data.name,
              status: data.status,
              revenueAmount: data.revenueAmount,
              company: data.company
            }
          });
        }
      } catch (error) {
        console.error(`Error checking ${adAccountId}:`, error);
      }
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}