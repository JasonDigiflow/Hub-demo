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
    
    const results = {
      accountId,
      tests: []
    };
    
    // Test 1: Get lead forms directly
    try {
      const formsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
        `fields=id,name,status,created_time,leads_count&` +
        `limit=10&` +
        `access_token=${session.accessToken}`;
      
      const formsResponse = await fetch(formsUrl);
      const formsData = await formsResponse.json();
      
      results.tests.push({
        name: 'Lead Forms from Ad Account',
        success: !formsData.error,
        data: formsData,
        count: formsData.data?.length || 0
      });
      
      // If we have forms, get leads from the first one
      if (formsData.data && formsData.data.length > 0) {
        const form = formsData.data[0];
        const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
          `fields=id,created_time,field_data&` +
          `limit=5&` +
          `access_token=${session.accessToken}`;
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        
        results.tests.push({
          name: `Leads from form: ${form.name}`,
          formId: form.id,
          success: !leadsData.error,
          data: leadsData,
          count: leadsData.data?.length || 0
        });
      }
    } catch (error) {
      results.tests.push({
        name: 'Lead Forms Error',
        error: error.message
      });
    }
    
    // Test 2: Get ads with leads
    try {
      const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
        `fields=id,name,leads{id,created_time,field_data}&` +
        `limit=10&` +
        `access_token=${session.accessToken}`;
      
      const adsResponse = await fetch(adsUrl);
      const adsData = await adsResponse.json();
      
      let totalLeadsFromAds = 0;
      if (adsData.data) {
        adsData.data.forEach(ad => {
          if (ad.leads && ad.leads.data) {
            totalLeadsFromAds += ad.leads.data.length;
          }
        });
      }
      
      results.tests.push({
        name: 'Ads with Leads',
        success: !adsData.error,
        adsCount: adsData.data?.length || 0,
        totalLeadsFromAds,
        sample: adsData.data?.[0]
      });
    } catch (error) {
      results.tests.push({
        name: 'Ads with Leads Error',
        error: error.message
      });
    }
    
    // Test 3: Get pages and their forms
    try {
      const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${session.accessToken}`;
      const pagesResponse = await fetch(pagesUrl);
      const pagesData = await pagesResponse.json();
      
      results.tests.push({
        name: 'Pages',
        success: !pagesData.error,
        count: pagesData.data?.length || 0,
        pages: pagesData.data?.map(p => ({ id: p.id, name: p.name }))
      });
      
      // Get forms from first page
      if (pagesData.data && pagesData.data.length > 0) {
        const page = pagesData.data[0];
        const pageToken = page.access_token || session.accessToken;
        
        const pageFormsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
          `fields=id,name,leads_count&` +
          `limit=10&` +
          `access_token=${pageToken}`;
        
        const pageFormsResponse = await fetch(pageFormsUrl);
        const pageFormsData = await pageFormsResponse.json();
        
        results.tests.push({
          name: `Forms from page: ${page.name}`,
          pageId: page.id,
          success: !pageFormsData.error,
          count: pageFormsData.data?.length || 0,
          forms: pageFormsData.data
        });
      }
    } catch (error) {
      results.tests.push({
        name: 'Pages Error',
        error: error.message
      });
    }
    
    // Test 4: Check permissions
    try {
      const permissionsUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${session.accessToken}`;
      const permissionsResponse = await fetch(permissionsUrl);
      const permissionsData = await permissionsResponse.json();
      
      results.tests.push({
        name: 'Permissions',
        success: !permissionsData.error,
        permissions: permissionsData.data
      });
    } catch (error) {
      results.tests.push({
        name: 'Permissions Error',
        error: error.message
      });
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug error',
      details: error.message
    }, { status: 500 });
  }
}