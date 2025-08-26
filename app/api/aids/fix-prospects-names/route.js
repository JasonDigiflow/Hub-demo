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
      fixed: [],
      errors: []
    };
    
    // Get all revenues to match with prospects
    const revenuesSnapshot = await db.collection('aids_revenues').get();
    const revenuesByProspectId = {};
    
    revenuesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.prospectId) {
        revenuesByProspectId[data.prospectId] = data;
      }
    });
    
    // Fix prospects in default account
    try {
      const defaultProspectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc('default')
        .collection('prospects')
        .get();
      
      for (const doc of defaultProspectsSnapshot.docs) {
        const data = doc.data();
        const prospectId = doc.id;
        
        // If the prospect doesn't have a name, try to get it from the revenue
        if (!data.name || data.name === '') {
          const revenue = revenuesByProspectId[prospectId];
          const newName = revenue?.clientName || `Client ${prospectId.substring(0, 8)}`;
          
          try {
            await doc.ref.update({
              name: newName,
              company: data.company || newName,
              updatedAt: new Date().toISOString()
            });
            
            results.fixed.push({
              id: prospectId,
              oldName: data.name || '(vide)',
              newName: newName
            });
          } catch (error) {
            results.errors.push({
              id: prospectId,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fixing default prospects:', error);
    }
    
    return NextResponse.json({
      success: true,
      results
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}