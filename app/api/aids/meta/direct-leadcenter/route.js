import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected'
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    console.log('=== TRYING DIRECT LEAD CENTER ACCESS ===');
    console.log('Account ID:', accountId);
    
    const allLeads = [];
    const tests = [];
    
    // Test 1: Essayer l'endpoint direct du Lead Center
    try {
      // Endpoint non documenté mais utilisé par le Lead Center de Meta
      const leadCenterUrl = `https://graph.facebook.com/v18.0/${accountId}/leads?` +
        `fields=id,created_time,field_data,form_id,campaign_name,campaign_id,ad_id,ad_name,adset_id,adset_name,is_organic,retailer_item_id&` +
        `limit=500&` +
        `access_token=${session.accessToken}`;
      
      console.log('Trying direct Lead Center endpoint...');
      const response = await fetch(leadCenterUrl);
      const data = await response.json();
      
      tests.push({
        endpoint: 'Direct Lead Center',
        url: leadCenterUrl.replace(session.accessToken, 'TOKEN'),
        success: !data.error,
        count: data.data?.length || 0,
        error: data.error
      });
      
      if (data.data && data.data.length > 0) {
        allLeads.push(...data.data);
      }
    } catch (error) {
      tests.push({
        endpoint: 'Direct Lead Center',
        error: error.message
      });
    }
    
    // Test 2: Essayer via les campagnes
    try {
      const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
        `fields=id,name,leads{id,created_time,field_data}&` +
        `limit=100&` +
        `access_token=${session.accessToken}`;
      
      console.log('Trying via campaigns...');
      const response = await fetch(campaignsUrl);
      const data = await response.json();
      
      let campaignLeadsCount = 0;
      if (data.data) {
        data.data.forEach(campaign => {
          if (campaign.leads && campaign.leads.data) {
            campaignLeadsCount += campaign.leads.data.length;
            allLeads.push(...campaign.leads.data);
          }
        });
      }
      
      tests.push({
        endpoint: 'Via Campaigns',
        success: !data.error,
        campaignsCount: data.data?.length || 0,
        leadsCount: campaignLeadsCount,
        error: data.error
      });
    } catch (error) {
      tests.push({
        endpoint: 'Via Campaigns',
        error: error.message
      });
    }
    
    // Test 3: Essayer via les ads directement
    try {
      const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
        `fields=id,name,leads{id,created_time,field_data}&` +
        `limit=500&` +
        `access_token=${session.accessToken}`;
      
      console.log('Trying via ads...');
      const response = await fetch(adsUrl);
      const data = await response.json();
      
      let adLeadsCount = 0;
      if (data.data) {
        data.data.forEach(ad => {
          if (ad.leads && ad.leads.data) {
            adLeadsCount += ad.leads.data.length;
            // Éviter les doublons
            ad.leads.data.forEach(lead => {
              if (!allLeads.find(l => l.id === lead.id)) {
                allLeads.push(lead);
              }
            });
          }
        });
      }
      
      tests.push({
        endpoint: 'Via Ads',
        success: !data.error,
        adsCount: data.data?.length || 0,
        leadsCount: adLeadsCount,
        error: data.error
      });
    } catch (error) {
      tests.push({
        endpoint: 'Via Ads',
        error: error.message
      });
    }
    
    // Test 4: Essayer l'endpoint RTU (Real Time Updates)
    try {
      const rtuUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_context_cards?` +
        `fields=id,name,status,follow_up_action_url,context_card&` +
        `limit=100&` +
        `access_token=${session.accessToken}`;
      
      console.log('Trying RTU context cards...');
      const response = await fetch(rtuUrl);
      const data = await response.json();
      
      tests.push({
        endpoint: 'RTU Context Cards',
        success: !data.error,
        count: data.data?.length || 0,
        error: data.error
      });
    } catch (error) {
      tests.push({
        endpoint: 'RTU Context Cards',
        error: error.message
      });
    }
    
    // Test 5: Essayer les webhooks leads
    try {
      const webhooksUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_webhooks?` +
        `access_token=${session.accessToken}`;
      
      console.log('Checking webhooks...');
      const response = await fetch(webhooksUrl);
      const data = await response.json();
      
      tests.push({
        endpoint: 'Webhooks Status',
        success: !data.error,
        hasWebhooks: data.data?.length > 0,
        webhooks: data.data,
        error: data.error
      });
    } catch (error) {
      tests.push({
        endpoint: 'Webhooks Status',
        error: error.message
      });
    }
    
    // Test 6: Essayer via Business Manager
    try {
      const businessUrl = `https://graph.facebook.com/v18.0/me/businesses?` +
        `fields=id,name,owned_ad_accounts{id,name}&` +
        `access_token=${session.accessToken}`;
      
      console.log('Checking Business Manager...');
      const response = await fetch(businessUrl);
      const data = await response.json();
      
      let businessAccounts = [];
      if (data.data) {
        data.data.forEach(biz => {
          if (biz.owned_ad_accounts && biz.owned_ad_accounts.data) {
            businessAccounts.push(...biz.owned_ad_accounts.data);
          }
        });
      }
      
      tests.push({
        endpoint: 'Business Manager',
        success: !data.error,
        businessesCount: data.data?.length || 0,
        adAccountsFound: businessAccounts.length,
        accounts: businessAccounts,
        error: data.error
      });
    } catch (error) {
      tests.push({
        endpoint: 'Business Manager',
        error: error.message
      });
    }
    
    // Traiter les leads trouvés
    const processedLeads = [];
    const uniqueLeadIds = new Set();
    
    for (const lead of allLeads) {
      if (uniqueLeadIds.has(lead.id)) continue;
      uniqueLeadIds.add(lead.id);
      
      const fieldData = {};
      if (lead.field_data) {
        lead.field_data.forEach(field => {
          fieldData[field.name] = field.values?.[0] || '';
        });
      }
      
      const name = fieldData['full_name'] || 
                   fieldData['first_name'] || 
                   fieldData['last_name'] ||
                   fieldData['name'] ||
                   `Lead ${lead.id}`;
      
      processedLeads.push({
        id: lead.id,
        name: name,
        email: fieldData['email'] || '',
        phone: fieldData['phone_number'] || fieldData['phone'] || '',
        company: fieldData['company_name'] || '',
        createdTime: lead.created_time,
        campaignName: lead.campaign_name,
        adName: lead.ad_name,
        rawData: fieldData
      });
    }
    
    // Résumé et diagnostic
    const summary = {
      totalLeadsFound: processedLeads.length,
      uniqueLeads: uniqueLeadIds.size,
      tests: tests,
      recommendations: []
    };
    
    if (processedLeads.length === 0) {
      summary.recommendations.push('❌ AUCUN lead trouvé avec AUCUNE méthode');
      summary.recommendations.push('Vérifiez dans le Business Manager de Meta');
      summary.recommendations.push('Les leads sont peut-être dans un autre Business Manager');
      summary.recommendations.push('Ou utilisez l\'export CSV depuis le Lead Center Meta');
    } else {
      summary.recommendations.push(`✅ ${processedLeads.length} leads trouvés!`);
      summary.recommendations.push('Utilisez le bouton "Synchroniser" pour les importer');
    }
    
    // Vérifier si on a un Business Manager différent
    const bizTest = tests.find(t => t.endpoint === 'Business Manager');
    if (bizTest && bizTest.accounts) {
      const otherAccounts = bizTest.accounts.filter(acc => acc.id !== accountId);
      if (otherAccounts.length > 0) {
        summary.recommendations.push(`💡 Vous avez ${otherAccounts.length} autres comptes dans le Business Manager`);
        summary.recommendations.push(`Essayez de changer pour: ${otherAccounts[0].name} (${otherAccounts[0].id})`);
      }
    }
    
    return NextResponse.json({
      success: processedLeads.length > 0,
      leads: processedLeads,
      totalCount: processedLeads.length,
      summary: summary,
      accountId: accountId,
      message: processedLeads.length > 0 
        ? `✅ ${processedLeads.length} leads trouvés!`
        : '❌ Aucun lead trouvé - Vérifiez le Business Manager'
    });
    
  } catch (error) {
    console.error('Direct Lead Center error:', error);
    return NextResponse.json({ 
      error: 'Failed to access Lead Center',
      details: error.message
    }, { status: 500 });
  }
}