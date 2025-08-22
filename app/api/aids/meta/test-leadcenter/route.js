import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        sessionExists: !!sessionCookie,
        accountSelected: !!selectedAccountCookie
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    const tests = [];
    
    // Test 1: Check current account
    tests.push({
      test: 'Current Account',
      accountId: accountId,
      userToken: session.accessToken ? 'Present' : 'Missing'
    });
    
    // Test 2: Verify token validity
    try {
      const meUrl = `https://graph.facebook.com/v18.0/me?access_token=${session.accessToken}`;
      const meResponse = await fetch(meUrl);
      const meData = await meResponse.json();
      
      tests.push({
        test: 'Token Validity',
        valid: !meData.error,
        userId: meData.id,
        name: meData.name,
        error: meData.error
      });
    } catch (e) {
      tests.push({
        test: 'Token Validity',
        error: e.message
      });
    }
    
    // Test 3: Check permissions
    try {
      const permUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${session.accessToken}`;
      const permResponse = await fetch(permUrl);
      const permData = await permResponse.json();
      
      const permissions = {};
      if (permData.data) {
        permData.data.forEach(p => {
          permissions[p.permission] = p.status;
        });
      }
      
      tests.push({
        test: 'Permissions',
        hasLeadsRetrieval: permissions['leads_retrieval'] === 'granted',
        hasAdsManagement: permissions['ads_management'] === 'granted',
        hasPagesManageAds: permissions['pages_manage_ads'] === 'granted',
        allPermissions: permissions
      });
    } catch (e) {
      tests.push({
        test: 'Permissions',
        error: e.message
      });
    }
    
    // Test 4: Get ALL ad accounts
    try {
      const accountsUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status&access_token=${session.accessToken}`;
      const accountsResponse = await fetch(accountsUrl);
      const accountsData = await accountsResponse.json();
      
      tests.push({
        test: 'All Ad Accounts',
        count: accountsData.data?.length || 0,
        selectedAccount: accountId,
        accounts: accountsData.data?.map(a => ({
          id: a.id,
          name: a.name,
          status: a.account_status,
          isSelected: a.id === accountId
        })),
        error: accountsData.error
      });
    } catch (e) {
      tests.push({
        test: 'All Ad Accounts',
        error: e.message
      });
    }
    
    // Test 5: Get lead forms from selected account
    try {
      const formsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
        `fields=id,name,status,leads_count,page{id,name}&` +
        `limit=100&` +
        `access_token=${session.accessToken}`;
      
      const formsResponse = await fetch(formsUrl);
      const formsData = await formsResponse.json();
      
      let totalLeadsCount = 0;
      if (formsData.data) {
        formsData.data.forEach(form => {
          totalLeadsCount += form.leads_count || 0;
        });
      }
      
      tests.push({
        test: 'Lead Forms in Account',
        formsCount: formsData.data?.length || 0,
        totalLeadsAcrossForms: totalLeadsCount,
        forms: formsData.data?.map(f => ({
          id: f.id,
          name: f.name,
          status: f.status,
          leadsCount: f.leads_count,
          page: f.page?.name
        })),
        error: formsData.error
      });
      
      // Try to get leads from first form
      if (formsData.data && formsData.data.length > 0 && formsData.data[0].leads_count > 0) {
        const firstForm = formsData.data[0];
        const leadsUrl = `https://graph.facebook.com/v18.0/${firstForm.id}/leads?` +
          `fields=id,created_time&` +
          `limit=5&` +
          `access_token=${session.accessToken}`;
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        
        tests.push({
          test: `Sample Leads from "${firstForm.name}"`,
          count: leadsData.data?.length || 0,
          error: leadsData.error,
          hasData: !!leadsData.data
        });
      }
    } catch (e) {
      tests.push({
        test: 'Lead Forms in Account',
        error: e.message
      });
    }
    
    // Test 6: Get ALL pages and their forms
    try {
      const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${session.accessToken}`;
      const pagesResponse = await fetch(pagesUrl);
      const pagesData = await pagesResponse.json();
      
      let totalPageForms = 0;
      let totalPageLeads = 0;
      const pageDetails = [];
      
      if (pagesData.data) {
        for (const page of pagesData.data) {
          const pageToken = page.access_token || session.accessToken;
          
          // Get forms for this page
          const pageFormsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
            `fields=id,name,leads_count&` +
            `limit=50&` +
            `access_token=${pageToken}`;
          
          const pageFormsResponse = await fetch(pageFormsUrl);
          const pageFormsData = await pageFormsResponse.json();
          
          let pageLeadsCount = 0;
          if (pageFormsData.data) {
            totalPageForms += pageFormsData.data.length;
            pageFormsData.data.forEach(f => {
              pageLeadsCount += f.leads_count || 0;
              totalPageLeads += f.leads_count || 0;
            });
          }
          
          pageDetails.push({
            pageName: page.name,
            pageId: page.id,
            formsCount: pageFormsData.data?.length || 0,
            totalLeads: pageLeadsCount,
            hasToken: !!page.access_token
          });
        }
      }
      
      tests.push({
        test: 'Pages and Their Forms',
        pagesCount: pagesData.data?.length || 0,
        totalFormsAcrossPages: totalPageForms,
        totalLeadsAcrossPages: totalPageLeads,
        pages: pageDetails,
        error: pagesData.error
      });
    } catch (e) {
      tests.push({
        test: 'Pages and Their Forms',
        error: e.message
      });
    }
    
    // Test 7: Try alternative endpoint
    try {
      const altUrl = `https://graph.facebook.com/v18.0/${accountId}?` +
        `fields=id,name,leadgen_forms{id,name,leads_count}&` +
        `access_token=${session.accessToken}`;
      
      const altResponse = await fetch(altUrl);
      const altData = await altResponse.json();
      
      tests.push({
        test: 'Alternative Endpoint',
        accountName: altData.name,
        hasLeadgenForms: !!altData.leadgen_forms,
        formsCount: altData.leadgen_forms?.data?.length || 0,
        error: altData.error
      });
    } catch (e) {
      tests.push({
        test: 'Alternative Endpoint',
        error: e.message
      });
    }
    
    // Summary
    const summary = {
      timestamp: new Date().toISOString(),
      accountId: accountId,
      tests: tests,
      recommendations: []
    };
    
    // Add recommendations based on results
    const permsTest = tests.find(t => t.test === 'Permissions');
    if (permsTest && !permsTest.hasLeadsRetrieval) {
      summary.recommendations.push('❌ Permission "leads_retrieval" manquante - Demandez l\'accès dans App Review');
    }
    
    const formsTest = tests.find(t => t.test === 'Lead Forms in Account');
    if (formsTest && formsTest.totalLeadsAcrossForms === 0) {
      const pagesTest = tests.find(t => t.test === 'Pages and Their Forms');
      if (pagesTest && pagesTest.totalLeadsAcrossPages > 0) {
        summary.recommendations.push('💡 Les leads sont dans les pages, pas dans le compte publicitaire');
      } else {
        summary.recommendations.push('⚠️ Aucun lead trouvé - Vérifiez que vous utilisez le bon compte');
      }
    }
    
    const accountsTest = tests.find(t => t.test === 'All Ad Accounts');
    if (accountsTest && accountsTest.accounts) {
      const otherAccounts = accountsTest.accounts.filter(a => !a.isSelected);
      if (otherAccounts.length > 0) {
        summary.recommendations.push(`💡 Vous avez ${otherAccounts.length} autres comptes publicitaires - essayez de changer de compte`);
      }
    }
    
    return NextResponse.json(summary);
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test error',
      details: error.message
    }, { status: 500 });
  }
}