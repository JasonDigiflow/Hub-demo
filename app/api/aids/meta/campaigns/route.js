import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.CAMPAIGN, 'Récupération des campagnes Meta');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      aidsLogger.error(LogCategories.AUTH, 'Pas de session Meta ou compte publicitaire');
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        campaigns: []
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    // Récupérer les campagnes depuis Meta
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time,effective_status,buying_type&` +
      `limit=50&` +
      `access_token=${accessToken}`;
    
    const response = await fetch(campaignsUrl);
    const data = await response.json();
    
    if (data.error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur API Meta campagnes', {
        error: data.error,
        accountId
      });
      
      return NextResponse.json({
        error: data.error.message,
        campaigns: []
      });
    }
    
    // Récupérer les insights pour chaque campagne
    const campaignsWithInsights = [];
    
    for (const campaign of (data.data || [])) {
      try {
        const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?` +
          `fields=spend,impressions,clicks,ctr,cpc,cpp,cpm&` +
          `date_preset=lifetime&` +
          `access_token=${accessToken}`;
        
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();
        
        const insights = insightsData.data?.[0] || {};
        
        campaignsWithInsights.push({
          ...campaign,
          spend: insights.spend || '0',
          impressions: insights.impressions || '0',
          clicks: insights.clicks || '0',
          ctr: insights.ctr || '0',
          cpc: insights.cpc || '0',
          cpm: insights.cpm || '0'
        });
      } catch (error) {
        aidsLogger.warning(LogCategories.CAMPAIGN, `Erreur insights campagne ${campaign.id}`, error);
        campaignsWithInsights.push(campaign);
      }
    }
    
    aidsLogger.success(LogCategories.CAMPAIGN, `${campaignsWithInsights.length} campagnes récupérées`);
    
    return NextResponse.json({
      success: true,
      campaigns: campaignsWithInsights,
      total: campaignsWithInsights.length
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Erreur critique API campagnes', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch campaigns',
      details: error.message,
      campaigns: []
    }, { status: 500 });
  }
}