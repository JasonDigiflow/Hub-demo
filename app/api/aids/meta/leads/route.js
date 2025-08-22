import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get session and selected account
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        leads: []
      }, { status: 401 });
    }
    
    if (!selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'No account selected',
        leads: []
      }, { status: 400 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    console.log('=== FETCHING LEADS FOR ACCOUNT ===');
    console.log('Account ID:', accountId);
    
    // Get all lead forms for this account
    const leadFormsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,created_time,leads_count,page,questions&` +
      `limit=100&` +
      `access_token=${session.accessToken}`;
    
    console.log('Lead Forms URL:', leadFormsUrl.replace(session.accessToken, 'TOKEN'));
    
    const formsResponse = await fetch(leadFormsUrl);
    const formsData = await formsResponse.json();
    
    console.log('=== LEAD FORMS RESPONSE ===');
    console.log('Forms found:', formsData.data?.length || 0);
    if (formsData.data?.length > 0) {
      console.log('Form names:', formsData.data.map(f => f.name));
    }
    
    if (formsData.error) {
      console.error('Error fetching lead forms:', formsData.error);
      // Try alternative: get leads from ads
      return await getLeadsFromAds(accountId, session.accessToken);
    }
    
    const allLeads = [];
    
    // For each form, get the leads
    if (formsData.data && formsData.data.length > 0) {
      for (const form of formsData.data) {
        const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
          `fields=id,created_time,field_data,campaign_name,campaign_id,ad_id,ad_name,adset_id,adset_name,form_id,is_organic,platform&` +
          `limit=100&` +
          `access_token=${session.accessToken}`;
        
        console.log(`\n=== FETCHING LEADS FOR FORM: ${form.name} ===`);
        console.log('Leads URL:', leadsUrl.replace(session.accessToken, 'TOKEN'));
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        
        console.log(`Leads found in form ${form.name}:`, leadsData.data?.length || 0);
        
        if (leadsData.data && leadsData.data.length > 0) {
          console.log('\n=== SAMPLE LEAD DATA (First Lead) ===');
          const sampleLead = leadsData.data[0];
          console.log('Lead ID:', sampleLead.id);
          console.log('Created Time:', sampleLead.created_time);
          console.log('Campaign:', sampleLead.campaign_name);
          console.log('Ad:', sampleLead.ad_name);
          
          if (sampleLead.field_data) {
            console.log('\n=== FIELD DATA ===');
            sampleLead.field_data.forEach(field => {
              console.log(`Field "${field.name}":`, field.values?.[0] || 'empty');
            });
          }
          
          // Process each lead
          const processedLeads = leadsData.data.map((lead, index) => {
            const fieldData = {};
            if (lead.field_data) {
              lead.field_data.forEach(field => {
                fieldData[field.name] = field.values?.[0] || '';
              });
            }
            
            if (index === 0) {
              console.log('\n=== PROCESSED FIELD DATA (First Lead) ===');
              console.log('All fields:', Object.keys(fieldData));
              console.log('Field values:', fieldData);
            }
            
            // Try many possible field names
            const possibleName = 
              fieldData.full_name || 
              fieldData['full_name'] ||
              fieldData.first_name || 
              fieldData['first_name'] ||
              fieldData.last_name || 
              fieldData['last_name'] ||
              (fieldData.first_name && fieldData.last_name ? `${fieldData.first_name} ${fieldData.last_name}` : '') ||
              fieldData.name || 
              fieldData.nom || 
              fieldData.prenom || 
              fieldData['nom_complet'] ||
              fieldData['nom_prenom'] ||
              Object.keys(fieldData).find(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('nom')) ?
                fieldData[Object.keys(fieldData).find(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('nom'))] : null ||
              fieldData.email?.split('@')[0] || 
              'Prospect sans nom';
            
            if (index === 0) {
              console.log('\n=== NAME EXTRACTION (First Lead) ===');
              console.log('Extracted name:', possibleName);
            }
            
            return {
              id: `LEAD_${lead.id}`,
              name: possibleName,
              email: fieldData.email || fieldData.e_mail || fieldData['e-mail'] || '',
              phone: fieldData.phone_number || fieldData.mobile_number || fieldData.telephone || fieldData.tel || '',
              company: fieldData.company_name || fieldData.company || fieldData.entreprise || fieldData.societe || '',
              source: lead.platform || 'Facebook',
              campaignId: lead.campaign_id || '',
              campaignName: lead.campaign_name || '',
              adId: lead.ad_id || '',
              adName: lead.ad_name || '',
              formId: form.id,
              formName: form.name,
              date: lead.created_time,
              status: 'new',
              notes: `Lead form: ${form.name}`,
              rawData: fieldData
            };
          });
          
          allLeads.push(...processedLeads);
        }
      }
    }
    
    // If no leads from forms, try to get from ads/campaigns
    if (allLeads.length === 0) {
      return await getLeadsFromAds(accountId, session.accessToken);
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Total leads found: ${allLeads.length}`);
    if (allLeads.length > 0) {
      console.log('First 3 leads:');
      allLeads.slice(0, 3).forEach(lead => {
        console.log(`- ${lead.id}: ${lead.name} (${lead.source})`);
      });
    }
    
    return NextResponse.json({
      success: true,
      leads: allLeads,
      totalCount: allLeads.length,
      source: 'lead_forms'
    });
    
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch leads',
      details: error.message,
      leads: []
    }, { status: 500 });
  }
}

// Alternative method: Get conversion/lead data from ads
async function getLeadsFromAds(accountId, accessToken) {
  try {
    // Get ads with conversions
    const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
      `fields=id,name,campaign{id,name},adset{id,name},insights{actions,conversions,clicks,impressions}&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    const adsResponse = await fetch(adsUrl);
    const adsData = await adsResponse.json();
    
    const prospects = [];
    
    if (adsData.data) {
      // Process ads that have conversions or actions
      adsData.data.forEach(ad => {
        if (ad.insights && ad.insights.data && ad.insights.data[0]) {
          const insight = ad.insights.data[0];
          
          // Check for lead-related actions
          const leadActions = insight.actions?.filter(action => 
            action.action_type.includes('lead') || 
            action.action_type.includes('contact') ||
            action.action_type.includes('submit') ||
            action.action_type.includes('complete_registration')
          ) || [];
          
          // Create prospect entries for ads with lead actions
          if (leadActions.length > 0 || insight.conversions) {
            const leadCount = leadActions.reduce((sum, action) => sum + parseInt(action.value || 0), 0);
            
            // Create aggregated prospect entry for this ad
            if (leadCount > 0 || insight.conversions) {
              prospects.push({
                id: `PROS_${ad.id}`,
                name: `[Données agrégées - ${leadCount || insight.clicks || 0} interactions]`,
                email: '',
                phone: '',
                company: ad.name || 'Publicité Facebook',
                source: 'Facebook Ads (Stats)',
                campaignId: ad.campaign?.id || '',
                campaignName: ad.campaign?.name || '',
                adId: ad.id,
                adName: ad.name,
                date: new Date().toISOString(),
                status: 'new',
                notes: `Publicité: "${ad.name}". ${leadCount || 0} conversions, ${insight.clicks || 0} clics, CTR: ${((insight.clicks/insight.impressions)*100).toFixed(2)}%. Pour avoir les noms individuels, utilisez les Facebook Lead Forms.`,
                isAggregated: true,
                leadCount: leadCount || 0
              });
            }
          }
        }
      });
    }
    
    // If still no prospects, get campaign level data
    if (prospects.length === 0) {
      const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
        `fields=id,name,status,insights{impressions,clicks,actions}&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      const campaignsResponse = await fetch(campaignsUrl);
      const campaignsData = await campaignsResponse.json();
      
      if (campaignsData.data) {
        campaignsData.data.forEach(campaign => {
          if (campaign.status === 'ACTIVE' && campaign.insights?.data?.[0]) {
            const insight = campaign.insights.data[0];
            if (parseInt(insight.clicks) > 0) {
              prospects.push({
                id: `CAMP_${campaign.id}`,
                name: `[Données campagne - ${insight.clicks} clics]`,
                email: '',
                phone: '',
                company: campaign.name || 'Campagne Facebook',
                source: 'Facebook Campaign (Stats)',
                campaignId: campaign.id,
                campaignName: campaign.name,
                adId: '',
                adName: '',
                date: new Date().toISOString(),
                status: 'new',
                notes: `Campagne: "${campaign.name}". ${insight.clicks} clics, ${insight.impressions} impressions, CTR: ${((insight.clicks/insight.impressions)*100).toFixed(2)}%. Configurez des Lead Forms pour capturer les informations individuelles.`,
                isAggregated: true,
                clickCount: parseInt(insight.clicks) || 0
              });
            }
          }
        });
      }
    }
    
    console.log(`Found ${prospects.length} prospects from ads/campaigns`);
    
    return NextResponse.json({
      success: true,
      leads: prospects,
      totalCount: prospects.length,
      source: 'ads_insights',
      message: prospects.length === 0 
        ? 'Aucun lead trouvé. Vérifiez que vous avez des formulaires de leads configurés sur vos campagnes.'
        : 'Données agrégées récupérées. Pour avoir les noms individuels des prospects, configurez des Facebook Lead Forms dans vos campagnes.'
    });
    
  } catch (error) {
    console.error('Error getting leads from ads:', error);
    return NextResponse.json({
      success: false,
      leads: [],
      error: error.message
    });
  }
}