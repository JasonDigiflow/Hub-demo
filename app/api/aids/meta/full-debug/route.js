import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const results = {
    timestamp: new Date().toISOString(),
    cookies: {},
    meta: {},
    leads: {},
    errors: []
  };
  
  try {
    const cookieStore = cookies();
    
    // 1. Vérifier les cookies
    const metaSession = cookieStore.get('meta_session');
    const selectedAccount = cookieStore.get('selected_ad_account');
    const authToken = cookieStore.get('auth-token');
    
    results.cookies = {
      hasMetaSession: !!metaSession,
      hasSelectedAccount: !!selectedAccount,
      selectedAccountId: selectedAccount?.value,
      hasAuthToken: !!authToken
    };
    
    if (!metaSession) {
      results.errors.push('❌ Pas de session Meta - Reconnectez-vous');
      return NextResponse.json(results);
    }
    
    const session = JSON.parse(metaSession.value);
    results.meta.hasAccessToken = !!session.accessToken;
    
    // 2. Tester le token
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${session.accessToken}`
    );
    const meData = await meResponse.json();
    
    if (meData.error) {
      results.errors.push(`❌ Token invalide: ${meData.error.message}`);
      return NextResponse.json(results);
    }
    
    results.meta.user = {
      id: meData.id,
      name: meData.name
    };
    
    // 3. Récupérer TOUS les ad accounts
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,amount_spent,currency&limit=100&access_token=${session.accessToken}`
    );
    const accountsData = await accountsResponse.json();
    
    results.meta.adAccounts = accountsData.data?.map(acc => ({
      id: acc.id,
      name: acc.name,
      status: acc.account_status,
      spent: acc.amount_spent,
      currency: acc.currency,
      isSelected: acc.id === selectedAccount?.value
    })) || [];
    
    // 4. Pour CHAQUE ad account, chercher les lead forms
    results.leads.byAccount = {};
    
    for (const account of (accountsData.data || [])) {
      console.log(`\n=== Checking account: ${account.name} (${account.id}) ===`);
      
      // Récupérer les lead forms de ce compte
      const formsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${account.id}/leadgen_forms?` +
        `fields=id,name,status,leads_count,page{id,name}&` +
        `limit=100&` +
        `access_token=${session.accessToken}`
      );
      const formsData = await formsResponse.json();
      
      let totalLeadsInAccount = 0;
      const forms = [];
      
      if (formsData.data) {
        for (const form of formsData.data) {
          totalLeadsInAccount += form.leads_count || 0;
          forms.push({
            id: form.id,
            name: form.name,
            status: form.status,
            leadsCount: form.leads_count || 0,
            page: form.page?.name
          });
        }
      }
      
      results.leads.byAccount[account.id] = {
        accountName: account.name,
        formsCount: forms.length,
        totalLeads: totalLeadsInAccount,
        forms: forms
      };
      
      if (totalLeadsInAccount > 0) {
        console.log(`✅ FOUND ${totalLeadsInAccount} leads in ${account.name}`);
      }
    }
    
    // 5. Chercher aussi dans toutes les pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${session.accessToken}`
    );
    const pagesData = await pagesResponse.json();
    
    results.leads.byPage = {};
    
    for (const page of (pagesData.data || [])) {
      const pageToken = page.access_token || session.accessToken;
      
      // Récupérer les forms de cette page
      const pageFormsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
        `fields=id,name,leads_count&` +
        `limit=100&` +
        `access_token=${pageToken}`
      );
      const pageFormsData = await pageFormsResponse.json();
      
      let totalLeadsInPage = 0;
      if (pageFormsData.data) {
        pageFormsData.data.forEach(form => {
          totalLeadsInPage += form.leads_count || 0;
        });
      }
      
      if (totalLeadsInPage > 0) {
        results.leads.byPage[page.id] = {
          pageName: page.name,
          totalLeads: totalLeadsInPage,
          formsCount: pageFormsData.data?.length || 0
        };
        console.log(`✅ FOUND ${totalLeadsInPage} leads in page ${page.name}`);
      }
    }
    
    // 6. Résumé et recommandations
    let totalLeadsFound = 0;
    let accountWithMostLeads = null;
    let maxLeads = 0;
    
    for (const [accountId, data] of Object.entries(results.leads.byAccount)) {
      totalLeadsFound += data.totalLeads;
      if (data.totalLeads > maxLeads) {
        maxLeads = data.totalLeads;
        accountWithMostLeads = {
          id: accountId,
          name: data.accountName,
          leads: data.totalLeads
        };
      }
    }
    
    results.summary = {
      totalLeadsFound,
      totalAdAccounts: results.meta.adAccounts?.length || 0,
      currentlySelected: selectedAccount?.value,
      accountWithMostLeads
    };
    
    // Recommandations
    results.recommendations = [];
    
    if (totalLeadsFound === 0) {
      results.recommendations.push('❌ AUCUN lead trouvé dans AUCUN compte');
      results.recommendations.push('Vérifiez que vous avez des Lead Forms configurés');
      results.recommendations.push('Vérifiez que les forms ont bien des leads');
    } else if (accountWithMostLeads && accountWithMostLeads.id !== selectedAccount?.value) {
      results.recommendations.push(`💡 CHANGEZ DE COMPTE!`);
      results.recommendations.push(`Le compte "${accountWithMostLeads.name}" a ${accountWithMostLeads.leads} leads`);
      results.recommendations.push(`ID à sélectionner: ${accountWithMostLeads.id}`);
    }
    
    if (Object.keys(results.leads.byPage).length > 0) {
      results.recommendations.push(`📄 Des leads sont aussi dans les pages (pas seulement les ad accounts)`);
    }
    
  } catch (error) {
    results.errors.push(`❌ Erreur fatale: ${error.message}`);
  }
  
  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}