import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET() {
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
    
    console.log(`Checking prospects for org: ${orgId}`);
    
    const result = {
      orgId,
      userId,
      adAccounts: {},
      defaultAccount: null
    };
    
    // Check all ad accounts
    try {
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const prospectsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountDoc.id)
          .collection('prospects')
          .get();
        
        result.adAccounts[adAccountDoc.id] = {
          prospectCount: prospectsSnapshot.size,
          convertedCount: 0,
          prospects: []
        };
        
        prospectsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'converted') {
            result.adAccounts[adAccountDoc.id].convertedCount++;
          }
          result.adAccounts[adAccountDoc.id].prospects.push({
            id: doc.id,
            name: data.name,
            status: data.status,
            revenueAmount: data.revenueAmount
          });
        });
      }
    } catch (error) {
      console.error('Error checking ad accounts:', error);
    }
    
    // Check default account specifically
    try {
      const defaultProspectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc('default')
        .collection('prospects')
        .get();
      
      result.defaultAccount = {
        exists: !defaultProspectsSnapshot.empty,
        prospectCount: defaultProspectsSnapshot.size,
        prospects: []
      };
      
      defaultProspectsSnapshot.forEach(doc => {
        const data = doc.data();
        result.defaultAccount.prospects.push({
          id: doc.id,
          name: data.name,
          status: data.status,
          revenueAmount: data.revenueAmount,
          createdAt: data.createdAt
        });
      });
    } catch (error) {
      result.defaultAccount = {
        exists: false,
        error: error.message
      };
    }
    
    // Check if specific prospect exists
    const prospectIdToCheck = 'LEAD_30978976875026944';
    result.searchForProspect = {
      id: prospectIdToCheck,
      found: []
    };
    
    // Search in all locations
    for (const [adAccountId, data] of Object.entries(result.adAccounts)) {
      const found = data.prospects.find(p => p.id === prospectIdToCheck);
      if (found) {
        result.searchForProspect.found.push({
          location: `adAccount: ${adAccountId}`,
          data: found
        });
      }
    }
    
    if (result.defaultAccount && result.defaultAccount.prospects) {
      const found = result.defaultAccount.prospects.find(p => p.id === prospectIdToCheck);
      if (found) {
        result.searchForProspect.found.push({
          location: 'default account',
          data: found
        });
      }
    }
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}