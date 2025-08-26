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
    
    // Check all ad accounts including default
    const adAccountsToCheck = ['adacc_meta_1756199456471', 'default'];
    
    for (const adAccountId of adAccountsToCheck) {
      try {
        const prospectRef = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects').doc(prospectId);
        
        const prospectDoc = await prospectRef.get();
        
        if (prospectDoc.exists) {
          result.found = true;
          const data = prospectDoc.data();
          result.locations.push({
            adAccountId,
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