import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.META_API, 'Lead Center Debug: Démarrage analyse complète');
    
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
    const accessToken = session.accessToken;
    
    const debugInfo = {
      accountId,
      timestamp: new Date().toISOString(),
      forms: [],
      pages: [],
      totalLeadsFound: 0,
      errors: [],
      apiCalls: []
    };
    
    // 1. Récupérer TOUS les formulaires (avec pagination)
    let allForms = [];
    let formsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,created_time,leads_count,page{id,name,access_token}&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    while (formsUrl) {
      debugInfo.apiCalls.push({ type: 'forms', url: formsUrl.replace(accessToken, 'TOKEN') });
      
      const response = await fetch(formsUrl);
      const data = await response.json();
      
      if (data.error) {
        debugInfo.errors.push({
          step: 'fetch_forms',
          error: data.error
        });
        break;
      }
      
      if (data.data) {
        allForms = allForms.concat(data.data);
      }
      
      formsUrl = data.paging?.next || null;
    }
    
    debugInfo.forms = allForms.map(f => ({
      id: f.id,
      name: f.name,
      status: f.status,
      leads_count: f.leads_count,
      page_id: f.page?.id,
      page_name: f.page?.name
    }));
    
    aidsLogger.info(LogCategories.META_API, `Lead Center Debug: ${allForms.length} formulaires trouvés`, {
      forms: debugInfo.forms
    });
    
    // 2. Récupérer toutes les pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?` +
      `fields=id,name,access_token&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    debugInfo.apiCalls.push({ type: 'pages', url: pagesUrl.replace(accessToken, 'TOKEN') });
    
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.data) {
      debugInfo.pages = pagesData.data.map(p => ({
        id: p.id,
        name: p.name,
        has_token: !!p.access_token
      }));
    }
    
    // 3. Pour chaque formulaire, compter les leads de manière détaillée
    for (const form of allForms) {
      const formToken = form.page?.access_token || accessToken;
      let formLeadsCount = 0;
      
      // Essayer différentes méthodes pour récupérer les leads
      
      // Méthode 1: API directe
      let leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
        `fields=id&` +
        `limit=500&` +
        `access_token=${formToken}`;
      
      debugInfo.apiCalls.push({ 
        type: 'leads_count', 
        form_id: form.id,
        form_name: form.name,
        url: leadsUrl.replace(formToken, 'TOKEN') 
      });
      
      const leadsResponse = await fetch(leadsUrl);
      const leadsData = await leadsResponse.json();
      
      if (leadsData.error) {
        debugInfo.errors.push({
          step: 'fetch_leads',
          form_id: form.id,
          form_name: form.name,
          error: leadsData.error
        });
        
        // Essayer avec un token différent si erreur
        if (form.page?.id) {
          // Récupérer le token de la page directement
          const pageTokenUrl = `https://graph.facebook.com/v18.0/${form.page.id}?` +
            `fields=access_token&` +
            `access_token=${accessToken}`;
          
          const pageTokenResponse = await fetch(pageTokenUrl);
          const pageTokenData = await pageTokenResponse.json();
          
          if (pageTokenData.access_token) {
            // Réessayer avec ce token
            leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
              `fields=id&` +
              `limit=500&` +
              `access_token=${pageTokenData.access_token}`;
            
            const retryResponse = await fetch(leadsUrl);
            const retryData = await retryResponse.json();
            
            if (retryData.data) {
              formLeadsCount = retryData.data.length;
              if (retryData.paging?.next) {
                formLeadsCount = 'Plus de ' + formLeadsCount;
              }
            }
          }
        }
      } else if (leadsData.data) {
        formLeadsCount = leadsData.data.length;
        
        // Vérifier s'il y a plus de leads
        if (leadsData.paging?.next) {
          // Compter toutes les pages
          let nextUrl = leadsData.paging.next;
          let pageCount = 1;
          
          while (nextUrl && pageCount < 10) {
            const nextResponse = await fetch(nextUrl);
            const nextData = await nextResponse.json();
            
            if (nextData.data) {
              formLeadsCount += nextData.data.length;
            }
            
            nextUrl = nextData.paging?.next;
            pageCount++;
          }
          
          if (nextUrl) {
            formLeadsCount = 'Plus de ' + formLeadsCount;
          }
        }
      }
      
      // Mettre à jour le formulaire avec le compte réel
      const formIndex = debugInfo.forms.findIndex(f => f.id === form.id);
      if (formIndex >= 0) {
        debugInfo.forms[formIndex].actual_leads_count = formLeadsCount;
        debugInfo.forms[formIndex].reported_leads_count = form.leads_count;
        debugInfo.forms[formIndex].discrepancy = form.leads_count !== formLeadsCount;
      }
      
      if (typeof formLeadsCount === 'number') {
        debugInfo.totalLeadsFound += formLeadsCount;
      }
    }
    
    // 4. Vérifier aussi les leads via les pages directement
    for (const page of debugInfo.pages) {
      try {
        const pageFormsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
          `fields=id,name,leads_count&` +
          `limit=100&` +
          `access_token=${accessToken}`;
        
        const pageFormsResponse = await fetch(pageFormsUrl);
        const pageFormsData = await pageFormsResponse.json();
        
        if (pageFormsData.data) {
          for (const pageForm of pageFormsData.data) {
            // Vérifier si on n'a pas déjà ce formulaire
            if (!debugInfo.forms.find(f => f.id === pageForm.id)) {
              debugInfo.forms.push({
                id: pageForm.id,
                name: pageForm.name + ' (VIA PAGE)',
                leads_count: pageForm.leads_count,
                page_id: page.id,
                page_name: page.name,
                source: 'page_direct'
              });
            }
          }
        }
      } catch (error) {
        debugInfo.errors.push({
          step: 'page_forms',
          page_id: page.id,
          error: error.message
        });
      }
    }
    
    // Log final
    aidsLogger.info(LogCategories.META_API, 'Lead Center Debug: Analyse terminée', debugInfo);
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      summary: {
        total_forms: debugInfo.forms.length,
        total_leads_found: debugInfo.totalLeadsFound,
        total_pages: debugInfo.pages.length,
        total_errors: debugInfo.errors.length,
        forms_with_leads: debugInfo.forms.filter(f => f.leads_count > 0 || f.actual_leads_count > 0),
        api_calls_made: debugInfo.apiCalls.length
      }
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Lead Center Debug: Erreur critique', error);
    
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}