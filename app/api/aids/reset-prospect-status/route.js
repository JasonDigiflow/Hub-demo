import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const resetLog = {
    checked: 0,
    reset: 0,
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
    
    console.log('=== RESET PROSPECT STATUS STARTED ===');
    console.log('User ID:', userId);
    
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
    
    console.log('Organization ID:', orgId);
    
    // Get all revenues to know which prospects should actually be converted
    const revenuesSnapshot = await db.collection('aids_revenues').get();
    const prospectsWithRevenue = new Set();
    
    revenuesSnapshot.forEach(doc => {
      const revenue = doc.data();
      if (revenue.prospectId) {
        prospectsWithRevenue.add(revenue.prospectId);
      }
    });
    
    console.log(`Found ${prospectsWithRevenue.size} prospects with active revenues`);
    
    // Get all ad accounts
    const adAccountsSnapshot = await db
      .collection('organizations').doc(orgId)
      .collection('adAccounts')
      .get();
    
    console.log(`Found ${adAccountsSnapshot.size} ad accounts`);
    
    // Process each ad account
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const adAccountId = adAccountDoc.id;
      console.log(`Processing ad account: ${adAccountId}`);
      
      const prospectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc(adAccountId)
        .collection('prospects')
        .get();
      
      console.log(`Found ${prospectsSnapshot.size} prospects in ${adAccountId}`);
      
      const batch = db.batch();
      let batchCount = 0;
      
      for (const prospectDoc of prospectsSnapshot.docs) {
        resetLog.checked++;
        const prospectData = prospectDoc.data();
        const prospectId = prospectDoc.id;
        
        // Determine what the status should be
        let newStatus = prospectData.status;
        let shouldUpdate = false;
        const updates = {
          updatedAt: new Date().toISOString()
        };
        
        // If prospect is marked as converted but has no revenue
        if (prospectData.status === 'converted' && !prospectsWithRevenue.has(prospectId)) {
          console.log(`Resetting ${prospectId} from converted to qualified (no revenue found)`);
          newStatus = 'qualified';
          shouldUpdate = true;
          updates.status = newStatus;
          // Remove revenue-related fields
          updates.revenueAmount = null;
          updates.revenueDate = null;
          updates.revenueService = null;
          updates.convertedAt = null;
        }
        
        // If prospect has revenue but is not marked as converted
        if (prospectsWithRevenue.has(prospectId) && prospectData.status !== 'converted') {
          console.log(`Setting ${prospectId} to converted (has revenue)`);
          newStatus = 'converted';
          shouldUpdate = true;
          updates.status = newStatus;
          updates.convertedAt = new Date().toISOString();
        }
        
        // Clean up any revenue data if status is not converted
        if (newStatus !== 'converted' && (prospectData.revenueAmount || prospectData.revenueDate)) {
          console.log(`Cleaning revenue data from ${prospectId} (status: ${newStatus})`);
          shouldUpdate = true;
          updates.revenueAmount = null;
          updates.revenueDate = null;
          updates.revenueService = null;
          updates.convertedAt = null;
        }
        
        if (shouldUpdate) {
          batch.update(prospectDoc.ref, updates);
          resetLog.reset++;
          batchCount++;
          
          // Commit batch every 400 operations (Firebase limit is 500)
          if (batchCount >= 400) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} updates`);
            batchCount = 0;
          }
        }
      }
      
      // Commit remaining updates
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} updates`);
      }
    }
    
    console.log('=== RESET COMPLETED ===');
    console.log('Reset log:', resetLog);
    
    return NextResponse.json({
      success: true,
      resetLog,
      message: `✅ Réinitialisation terminée: ${resetLog.checked} prospects vérifiés, ${resetLog.reset} statuts corrigés`
    });
    
  } catch (error) {
    console.error('Fatal error in reset:', error);
    return NextResponse.json({
      error: error.message,
      resetLog
    }, { status: 500 });
  }
}