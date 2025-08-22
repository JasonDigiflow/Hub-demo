import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// This endpoint can be called periodically (e.g., via cron job) to sync new leads
export async function POST(request) {
  try {
    // Optional: Add authentication for cron job
    const authHeader = request.headers.get('authorization');
    const CRON_SECRET = process.env.CRON_SECRET;
    
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔄 Starting automatic Meta leads sync...');
    
    // Get all users with Meta connected
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    let totalSynced = 0;
    let totalUsers = 0;
    const results = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user has Meta connected
      if (userData.metaSession && userData.selectedAdAccount) {
        totalUsers++;
        
        try {
          // Sync leads for this user
          const syncResult = await syncUserLeads(
            userDoc.id,
            userData.metaSession,
            userData.selectedAdAccount
          );
          
          totalSynced += syncResult.synced;
          results.push({
            userId: userDoc.id,
            synced: syncResult.synced,
            skipped: syncResult.skipped,
            error: syncResult.error
          });
          
        } catch (error) {
          console.error(`Error syncing for user ${userDoc.id}:`, error);
          results.push({
            userId: userDoc.id,
            error: error.message
          });
        }
      }
    }
    
    console.log(`✅ Auto-sync completed: ${totalSynced} new leads for ${totalUsers} users`);
    
    return NextResponse.json({
      success: true,
      totalUsers,
      totalSynced,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auto-sync error:', error);
    return NextResponse.json({
      error: 'Auto-sync failed',
      details: error.message
    }, { status: 500 });
  }
}

// Sync leads for a specific user
async function syncUserLeads(userId, metaSession, accountId) {
  try {
    // Get pages and their lead forms
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${metaSession.accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return { synced: 0, skipped: 0 };
    }
    
    let allLeads = [];
    
    // Fetch leads from each page
    for (const page of pagesData.data) {
      const pageToken = page.access_token || metaSession.accessToken;
      
      // Get lead forms for this page
      const formsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
        `fields=id,name,leads_count&limit=100&access_token=${pageToken}`;
      
      const formsResponse = await fetch(formsUrl);
      const formsData = await formsResponse.json();
      
      if (formsData.data) {
        for (const form of formsData.data) {
          if (form.leads_count > 0) {
            // Get leads from this form
            const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
              `fields=id,created_time,field_data&limit=200&access_token=${pageToken}`;
            
            const leadsResponse = await fetch(leadsUrl);
            const leadsData = await leadsResponse.json();
            
            if (leadsData.data) {
              allLeads.push(...leadsData.data.map(lead => ({
                ...lead,
                form_id: form.id,
                form_name: form.name,
                page_id: page.id,
                page_name: page.name
              })));
            }
          }
        }
      }
    }
    
    // Get existing Meta IDs to avoid duplicates
    const prospectsRef = db.collection('aids_prospects');
    const existingSnapshot = await prospectsRef
      .where('userId', '==', userId)
      .where('syncedFromMeta', '==', true)
      .get();
    
    const existingMetaIds = new Set();
    existingSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.metaId) {
        existingMetaIds.add(data.metaId);
      }
    });
    
    // Process and save new leads
    let syncedCount = 0;
    let skippedCount = 0;
    const batch = db.batch();
    
    for (const lead of allLeads) {
      const metaId = `LEAD_${lead.id}`;
      
      // Skip if already exists
      if (existingMetaIds.has(metaId)) {
        skippedCount++;
        continue;
      }
      
      // Process field data
      const fieldData = {};
      if (lead.field_data) {
        lead.field_data.forEach(field => {
          fieldData[field.name] = field.values?.[0] || '';
        });
      }
      
      // Extract prospect information
      const firstName = fieldData['FIRST_NAME'] || fieldData['first_name'] || '';
      const lastName = fieldData['LAST_NAME'] || fieldData['last_name'] || '';
      const fullName = `${firstName} ${lastName}`.trim() || 
                      fieldData['full_name'] || 
                      'Prospect sans nom';
      
      const prospectData = {
        metaId,
        name: fullName,
        email: fieldData['EMAIL'] || fieldData['email'] || '',
        phone: fieldData['PHONE'] || fieldData['phone'] || '',
        company: fieldData['COMPANY_NAME'] || fieldData['company_name'] || '',
        source: 'Facebook Auto-Sync',
        formId: lead.form_id,
        formName: lead.form_name,
        pageId: lead.page_id,
        pageName: lead.page_name,
        userId,
        syncedFromMeta: true,
        createdAt: lead.created_time || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
        status: 'new',
        rawData: fieldData,
        autoSynced: true
      };
      
      const docRef = prospectsRef.doc();
      batch.set(docRef, prospectData);
      syncedCount++;
    }
    
    // Commit batch if there are new prospects
    if (syncedCount > 0) {
      await batch.commit();
      console.log(`✅ Synced ${syncedCount} new prospects for user ${userId}`);
    }
    
    return { synced: syncedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error(`Sync error for user ${userId}:`, error);
    return { synced: 0, skipped: 0, error: error.message };
  }
}

// GET endpoint to check sync status
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get last sync info from database (you might want to store this)
    // For now, return a simple status
    return NextResponse.json({
      success: true,
      message: 'Auto-sync endpoint is active',
      lastSync: null, // You could store and retrieve this from DB
      nextSync: null, // Could calculate based on cron schedule
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/aids/meta/webhook`
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get sync status',
      details: error.message
    }, { status: 500 });
  }
}