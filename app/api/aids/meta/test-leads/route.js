import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get session and selected account
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
    
    const results = {
      accountId,
      tests: []
    };
    
    // Test 1: Get account info
    const accountUrl = `https://graph.facebook.com/v18.0/${accountId}?` +
      `fields=id,name,account_id,business_name&` +
      `access_token=${session.accessToken}`;
    
    const accountResponse = await fetch(accountUrl);
    const accountData = await accountResponse.json();
    results.tests.push({
      test: 'Account Info',
      data: accountData
    });
    
    // Test 2: Get user permissions
    const permissionsUrl = `https://graph.facebook.com/v18.0/me/permissions?` +
      `access_token=${session.accessToken}`;
    
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();
    results.tests.push({
      test: 'User Permissions',
      data: permissionsData
    });
    
    // Test 3: Get lead forms directly
    const formsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,leads_count,page{id,name}&` +
      `limit=10&` +
      `access_token=${session.accessToken}`;
    
    const formsResponse = await fetch(formsUrl);
    const formsData = await formsResponse.json();
    results.tests.push({
      test: 'Lead Forms',
      url: formsUrl.replace(session.accessToken, 'TOKEN'),
      data: formsData
    });
    
    // Test 4: Get ads with leads
    const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
      `fields=id,name,status,leads{id,created_time,field_data}&` +
      `limit=10&` +
      `access_token=${session.accessToken}`;
    
    const adsResponse = await fetch(adsUrl);
    const adsData = await adsResponse.json();
    results.tests.push({
      test: 'Ads with Leads',
      url: adsUrl.replace(session.accessToken, 'TOKEN'),
      data: adsData
    });
    
    // Test 5: Get pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?` +
      `access_token=${session.accessToken}`;
    
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    results.tests.push({
      test: 'User Pages',
      data: pagesData
    });
    
    // Test 6: If pages exist, get lead forms from first page
    if (pagesData.data && pagesData.data.length > 0) {
      const firstPage = pagesData.data[0];
      const pageFormsUrl = `https://graph.facebook.com/v18.0/${firstPage.id}/leadgen_forms?` +
        `fields=id,name,status,leads_count&` +
        `limit=10&` +
        `access_token=${firstPage.access_token || session.accessToken}`;
      
      const pageFormsResponse = await fetch(pageFormsUrl);
      const pageFormsData = await pageFormsResponse.json();
      results.tests.push({
        test: `Lead Forms from Page: ${firstPage.name}`,
        pageId: firstPage.id,
        data: pageFormsData
      });
      
      // Test 7: If forms exist, get leads from first form
      if (pageFormsData.data && pageFormsData.data.length > 0) {
        const firstForm = pageFormsData.data[0];
        const leadsUrl = `https://graph.facebook.com/v18.0/${firstForm.id}/leads?` +
          `fields=id,created_time,field_data&` +
          `limit=5&` +
          `access_token=${firstPage.access_token || session.accessToken}`;
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        results.tests.push({
          test: `Sample Leads from Form: ${firstForm.name}`,
          formId: firstForm.id,
          data: leadsData
        });
      }
    }
    
    // Test 8: Get campaigns with lead generation objective
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective,insights{actions}&` +
      `filtering=[{"field":"objective","operator":"IN","value":["LEAD_GENERATION","OUTCOME_LEADS"]}]&` +
      `limit=10&` +
      `access_token=${session.accessToken}`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    results.tests.push({
      test: 'Lead Generation Campaigns',
      url: campaignsUrl.replace(session.accessToken, 'TOKEN'),
      data: campaignsData
    });
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        accountId,
        totalTests: results.tests.length,
        hasLeadForms: results.tests.find(t => t.test === 'Lead Forms')?.data?.data?.length > 0,
        hasPages: results.tests.find(t => t.test === 'User Pages')?.data?.data?.length > 0,
        hasLeadCampaigns: results.tests.find(t => t.test === 'Lead Generation Campaigns')?.data?.data?.length > 0
      }
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message 
    }, { status: 500 });
  }
}