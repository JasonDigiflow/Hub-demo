import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get session
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        message: 'Connectez-vous d\'abord à Meta'
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    
    console.log('=== TESTING READ_INSIGHTS PERMISSION ===');
    
    // Test 1: Get Page Insights (le plus simple)
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${session.accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    const results = [];
    
    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      const pageToken = page.access_token || session.accessToken;
      
      console.log(`Testing insights for page: ${page.name} (${page.id})`);
      
      // Test Page Insights
      const pageInsightsUrl = `https://graph.facebook.com/v18.0/${page.id}/insights?` +
        `metric=page_impressions,page_engaged_users,page_fans&` +
        `period=day&` +
        `access_token=${pageToken}`;
      
      const insightsResponse = await fetch(pageInsightsUrl);
      const insightsData = await insightsResponse.json();
      
      results.push({
        test: 'Page Insights',
        pageId: page.id,
        pageName: page.name,
        success: !insightsData.error,
        data: insightsData.data || insightsData.error
      });
    }
    
    // Test 2: Get Ad Account Insights
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    if (selectedAccountCookie) {
      const accountId = selectedAccountCookie.value;
      
      console.log(`Testing insights for ad account: ${accountId}`);
      
      const adInsightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=impressions,clicks,spend,ctr,cpc&` +
        `date_preset=last_7d&` +
        `access_token=${session.accessToken}`;
      
      const adInsightsResponse = await fetch(adInsightsUrl);
      const adInsightsData = await adInsightsResponse.json();
      
      results.push({
        test: 'Ad Account Insights',
        accountId: accountId,
        success: !adInsightsData.error,
        data: adInsightsData.data || adInsightsData.error
      });
    }
    
    // Test 3: App Insights (if you have an app)
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '1994469434647099';
    if (appId) {
      console.log(`Testing insights for app: ${appId}`);
      
      const appInsightsUrl = `https://graph.facebook.com/v18.0/${appId}/app_insights?` +
        `metric=app_impressions&` +
        `period=day&` +
        `access_token=${session.accessToken}`;
      
      const appInsightsResponse = await fetch(appInsightsUrl);
      const appInsightsData = await appInsightsResponse.json();
      
      results.push({
        test: 'App Insights',
        appId: appId,
        success: !appInsightsData.error,
        data: appInsightsData.data || appInsightsData.error
      });
    }
    
    // Check if at least one test succeeded
    const hasSuccess = results.some(r => r.success);
    
    return NextResponse.json({
      success: hasSuccess,
      message: hasSuccess 
        ? '✅ Test réussi! La permission read_insights devrait être débloquée dans 24h.'
        : '❌ Aucun test réussi. Vérifiez vos permissions.',
      results: results,
      instructions: [
        '1. Si au moins un test est réussi (success: true), attendez 24h',
        '2. Retournez dans App Review → Permissions → read_insights',
        '3. Le bouton "Request" devrait être actif',
        '4. Cliquez et demandez Advanced Access'
      ]
    });
    
  } catch (error) {
    console.error('Test insights error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Erreur lors du test. Vérifiez votre connexion Meta.'
    }, { status: 500 });
  }
}