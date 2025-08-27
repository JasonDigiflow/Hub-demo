import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected'
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    const userId = session.userId;
    
    console.log(`[Sync Leads] Starting sync for account ${accountId}`);
    
    // Get the time range from request
    const { timeRange = 'last_30d' } = await request.json();
    
    // Fetch all forms associated with the account
    const formsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,leads_count,created_time&` +
      `access_token=${accessToken}`;
    
    console.log('[Sync Leads] Fetching lead forms...');
    const formsResponse = await fetch(formsUrl);
    const formsData = await formsResponse.json();
    
    if (formsData.error) {
      console.error('[Sync Leads] Error fetching forms:', formsData.error);
      return NextResponse.json({
        error: 'Failed to fetch lead forms',
        details: formsData.error
      });
    }
    
    const forms = formsData.data || [];
    console.log(`[Sync Leads] Found ${forms.length} lead forms`);
    
    let totalLeadsImported = 0;
    const leadsByForm = [];
    
    // For each form, get the leads
    for (const form of forms) {
      console.log(`[Sync Leads] Processing form: ${form.name} (${form.id})`);
      
      try {
        // Get leads from the form
        const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
          `fields=id,created_time,field_data,campaign_id,campaign_name,ad_id,ad_name&` +
          `access_token=${accessToken}`;
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        
        if (leadsData.data) {
          const leads = leadsData.data;
          console.log(`[Sync Leads] Found ${leads.length} leads in form ${form.name}`);
          
          for (const lead of leads) {
            // Parse field data
            const fieldData = {};
            if (lead.field_data) {
              lead.field_data.forEach(field => {
                fieldData[field.name] = field.values?.[0] || '';
              });
            }
            
            // Create prospect record
            const prospect = {
              userId,
              leadId: lead.id,
              formId: form.id,
              formName: form.name,
              name: fieldData.full_name || fieldData.first_name || 'Unknown',
              email: fieldData.email || null,
              phone: fieldData.phone_number || null,
              campaignId: lead.campaign_id || null,
              campaignName: lead.campaign_name || null,
              adId: lead.ad_id || null,
              adName: lead.ad_name || null,
              source: 'meta_leadgen',
              status: 'new',
              fieldData: fieldData,
              createdAt: new Date(lead.created_time),
              updatedAt: new Date(),
              syncedAt: new Date()
            };
            
            try {
              // Check if lead already exists
              const existingQuery = await db.collection('prospects')
                .where('leadId', '==', lead.id)
                .get();
              
              if (existingQuery.empty) {
                // Create new prospect
                const docRef = await db.collection('prospects').add(prospect);
                console.log(`[Sync Leads] Created prospect ${docRef.id}: ${prospect.name}`);
                totalLeadsImported++;
              } else {
                console.log(`[Sync Leads] Lead ${lead.id} already exists, skipping`);
              }
            } catch (error) {
              console.error('[Sync Leads] Error saving prospect:', error);
            }
          }
          
          leadsByForm.push({
            formId: form.id,
            formName: form.name,
            leadsCount: leads.length
          });
        }
      } catch (error) {
        console.error(`[Sync Leads] Error processing form ${form.id}:`, error);
      }
    }
    
    // Also get leads from campaign insights
    console.log('[Sync Leads] Fetching campaign insights for leads data...');
    
    const insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=actions,results&` +
      `date_preset=${timeRange}&` +
      `access_token=${accessToken}`;
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    let totalLeadsFromInsights = 0;
    
    if (insightsData.data && insightsData.data[0]) {
      const insights = insightsData.data[0];
      
      // Extract leads from results
      if (insights.results && Array.isArray(insights.results)) {
        insights.results.forEach(result => {
          if (result.indicator && result.indicator.includes('lead')) {
            const count = parseInt(result.values?.[0]?.value || 0);
            totalLeadsFromInsights += count;
          }
        });
      }
      
      // Extract leads from actions
      if (insights.actions) {
        const leadAction = insights.actions.find(a => a.action_type === 'lead');
        if (leadAction) {
          totalLeadsFromInsights = Math.max(totalLeadsFromInsights, parseInt(leadAction.value || 0));
        }
      }
    }
    
    console.log(`[Sync Leads] Total leads from insights: ${totalLeadsFromInsights}`);
    console.log(`[Sync Leads] Total leads imported: ${totalLeadsImported}`);
    
    return NextResponse.json({
      success: true,
      totalLeadsImported,
      totalLeadsFromInsights,
      forms: forms.length,
      leadsByForm,
      message: `Synchronisé ${totalLeadsImported} nouveaux leads depuis ${forms.length} formulaires`
    });
    
  } catch (error) {
    console.error('[Sync Leads] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync leads',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check lead sync status
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    
    if (!metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    const session = JSON.parse(metaSession.value);
    const userId = session.userId;
    
    // Get count of synced prospects
    const prospectsQuery = await db.collection('prospects')
      .where('userId', '==', userId)
      .where('source', '==', 'meta_leadgen')
      .get();
    
    const prospects = [];
    prospectsQuery.forEach(doc => {
      prospects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Group by status
    const statusCounts = {};
    prospects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      totalProspects: prospects.length,
      statusCounts,
      lastSync: prospects.length > 0 ? prospects[0].syncedAt : null
    });
    
  } catch (error) {
    console.error('[Sync Leads] Error checking status:', error);
    return NextResponse.json({ 
      error: 'Failed to check lead sync status',
      details: error.message 
    }, { status: 500 });
  }
}