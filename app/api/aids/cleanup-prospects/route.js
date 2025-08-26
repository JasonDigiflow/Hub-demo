import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const stats = {
    checked: 0,
    cleaned: 0,
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
    
    console.log('=== CLEANUP PROSPECTS STARTED ===');
    console.log('OrgId:', orgId);
    
    // Get all revenues to know which prospects should be converted
    const revenuesSnapshot = await db
      .collection('aids_revenues')
      .where('userId', '==', userId)
      .get();
    
    const convertedProspectIds = new Set();
    revenuesSnapshot.forEach(doc => {
      const revenue = doc.data();
      if (revenue.prospectId) {
        convertedProspectIds.add(revenue.prospectId);
      }
    });
    
    console.log(`Found ${convertedProspectIds.size} prospects with revenues`);
    
    // Check all prospects in all ad accounts
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
      
      console.log(`Checking ${prospectsSnapshot.size} prospects in ad account ${adAccountDoc.id}`);
      
      for (const prospectDoc of prospectsSnapshot.docs) {
        stats.checked++;
        const prospectData = prospectDoc.data();
        
        // If prospect is marked as converted but has no revenue
        if (prospectData.status === 'converted' && !convertedProspectIds.has(prospectDoc.id)) {
          console.log(`Cleaning prospect ${prospectDoc.id} - status: converted but no revenue found`);
          
          try {
            await prospectDoc.ref.update({
              status: 'qualified',
              revenueAmount: null,
              revenueDate: null,
              revenueService: null,
              convertedAt: null,
              updatedAt: new Date().toISOString()
            });
            stats.cleaned++;
          } catch (error) {
            console.error(`Error cleaning prospect ${prospectDoc.id}:`, error);
            stats.errors.push(`${prospectDoc.id}: ${error.message}`);
          }
        }
        
        // Also ensure prospects with revenues are marked as converted
        if (prospectData.status !== 'converted' && convertedProspectIds.has(prospectDoc.id)) {
          console.log(`Fixing prospect ${prospectDoc.id} - has revenue but not marked as converted`);
          
          try {
            // Find the revenue amount
            const revenueDoc = revenuesSnapshot.docs.find(r => r.data().prospectId === prospectDoc.id);
            const revenueData = revenueDoc?.data();
            
            await prospectDoc.ref.update({
              status: 'converted',
              revenueAmount: revenueData?.amount || 0,
              revenueDate: revenueData?.date || new Date().toISOString(),
              convertedAt: revenueData?.date || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            stats.cleaned++;
          } catch (error) {
            console.error(`Error fixing prospect ${prospectDoc.id}:`, error);
            stats.errors.push(`${prospectDoc.id}: ${error.message}`);
          }
        }
      }
    }
    
    console.log('=== CLEANUP COMPLETED ===');
    console.log('Stats:', stats);
    
    return NextResponse.json({
      success: true,
      stats,
      message: `✅ Nettoyage terminé: ${stats.checked} prospects vérifiés, ${stats.cleaned} corrigés`
    });
    
  } catch (error) {
    console.error('Fatal error in cleanup:', error);
    return NextResponse.json({
      error: error.message,
      stats
    }, { status: 500 });
  }
}