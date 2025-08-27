import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        success: false
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accessToken = session.accessToken;
    
    console.log(`[AdSets API] Fetching adsets for campaign ${campaignId}`);
    
    // Fetch adsets for this campaign
    let adsetsUrl = `https://graph.facebook.com/v18.0/${campaignId}/adsets?` +
      `fields=id,name,status,effective_status,daily_budget,lifetime_budget,targeting&` +
      `limit=50&` +
      `access_token=${accessToken}`;
    
    const adsetsResponse = await fetch(adsetsUrl);
    const adsetsData = await adsetsResponse.json();
    
    if (adsetsData.error) {
      console.error('[AdSets API] Error:', adsetsData.error);
      return NextResponse.json({
        error: adsetsData.error.message,
        success: false
      }, { status: 400 });
    }
    
    // Now fetch insights for each adset if we have dates
    const adsets = [];
    
    for (const adset of (adsetsData.data || [])) {
      let adsetWithInsights = { ...adset };
      
      if (since && until) {
        // Fetch insights for this adset
        const insightsUrl = `https://graph.facebook.com/v18.0/${adset.id}/insights?` +
          `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,results&` +
          `time_range={'since':'${since}','until':'${until}'}&` +
          `access_token=${accessToken}`;
        
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();
        
        if (insightsData.data && insightsData.data.length > 0) {
          const insights = insightsData.data[0];
          
          // Extract leads
          let leads = 0;
          if (insights.results) {
            leads = parseInt(insights.results || 0);
          } else if (insights.actions) {
            const leadActions = insights.actions.filter(a => 
              ['lead', 'omni_complete_registration'].includes(a.action_type)
            );
            leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
          }
          
          adsetWithInsights.insights = {
            spend: parseFloat(insights.spend || 0),
            impressions: parseInt(insights.impressions || 0),
            clicks: parseInt(insights.clicks || 0),
            ctr: parseFloat(insights.ctr || 0),
            cpc: parseFloat(insights.cpc || 0),
            cpm: parseFloat(insights.cpm || 0),
            reach: parseInt(insights.reach || 0),
            leads: leads,
            cost_per_result: leads > 0 ? parseFloat(insights.spend || 0) / leads : null
          };
        }
      }
      
      // Fetch ads for this adset
      const adsUrl = `https://graph.facebook.com/v18.0/${adset.id}/ads?` +
        `fields=id,name,status,effective_status&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      const adsResponse = await fetch(adsUrl);
      const adsData = await adsResponse.json();
      
      const ads = [];
      for (const ad of (adsData.data || [])) {
        let adWithInsights = { ...ad };
        
        if (since && until) {
          // Fetch insights for this ad
          const adInsightsUrl = `https://graph.facebook.com/v18.0/${ad.id}/insights?` +
            `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,results&` +
            `time_range={'since':'${since}','until':'${until}'}&` +
            `access_token=${accessToken}`;
          
          const adInsightsResponse = await fetch(adInsightsUrl);
          const adInsightsData = await adInsightsResponse.json();
          
          if (adInsightsData.data && adInsightsData.data.length > 0) {
            const adInsights = adInsightsData.data[0];
            
            let leads = 0;
            if (adInsights.results) {
              leads = parseInt(adInsights.results || 0);
            } else if (adInsights.actions) {
              const leadActions = adInsights.actions.filter(a => 
                ['lead', 'omni_complete_registration'].includes(a.action_type)
              );
              leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
            }
            
            adWithInsights.insights = {
              spend: parseFloat(adInsights.spend || 0),
              impressions: parseInt(adInsights.impressions || 0),
              clicks: parseInt(adInsights.clicks || 0),
              ctr: parseFloat(adInsights.ctr || 0),
              cpc: parseFloat(adInsights.cpc || 0),
              cpm: parseFloat(adInsights.cpm || 0),
              reach: parseInt(adInsights.reach || 0),
              leads: leads,
              cost_per_result: leads > 0 ? parseFloat(adInsights.spend || 0) / leads : null
            };
          }
        }
        
        ads.push(adWithInsights);
      }
      
      adsetWithInsights.ads = ads;
      adsets.push(adsetWithInsights);
    }
    
    return NextResponse.json({
      success: true,
      adsets: adsets,
      campaignId: campaignId
    });
    
  } catch (error) {
    console.error('[AdSets API] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch adsets',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}