import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'last_7_days';
    
    // Get session and selected account
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        fallback: true 
      }, { status: 401 });
    }
    
    if (!selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'No account selected',
        fallback: true 
      }, { status: 400 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    // Map our range to Facebook date preset
    const datePreset = {
      'daily': 'yesterday',
      'weekly': 'last_7_days',
      'monthly': 'last_30_days',
      'last_7_days': 'last_7_days',
      'last_30_days': 'last_30_days',
      'yesterday': 'yesterday'
    }[range] || 'last_7_days';
    
    // Fetch account insights from Facebook
    const fields = [
      'account_name',
      'account_id',
      'spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'frequency',
      'actions',
      'action_values',
      'cost_per_action_type',
      'purchase_roas'
    ].join(',');
    
    const insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset}&` +
      `level=account&` +
      `access_token=${session.accessToken}`;
    
    console.log('Fetching insights from:', insightsUrl.replace(session.accessToken, 'TOKEN'));
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    if (insightsData.error) {
      console.error('Facebook API error:', insightsData.error);
      return NextResponse.json({ 
        error: insightsData.error.message,
        fallback: true 
      }, { status: 400 });
    }
    
    // Process the data
    const data = insightsData.data?.[0] || {};
    
    // Extract conversions from actions
    let conversions = 0;
    let revenue = 0;
    
    if (data.actions) {
      const purchaseAction = data.actions.find(a => 
        a.action_type === 'purchase' || 
        a.action_type === 'omni_purchase' ||
        a.action_type === 'offsite_conversion.fb_pixel_purchase'
      );
      if (purchaseAction) {
        conversions = parseInt(purchaseAction.value) || 0;
      }
    }
    
    if (data.action_values) {
      const purchaseValue = data.action_values.find(a => 
        a.action_type === 'purchase' || 
        a.action_type === 'omni_purchase' ||
        a.action_type === 'offsite_conversion.fb_pixel_purchase'
      );
      if (purchaseValue) {
        revenue = parseFloat(purchaseValue.value) || 0;
      }
    }
    
    // Calculate ROAS
    const spend = parseFloat(data.spend) || 0;
    const roas = spend > 0 ? (revenue / spend) : 0;
    
    // Get campaigns data
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,daily_budget,lifetime_budget,insights{spend,impressions,clicks,ctr,actions}&` +
      `limit=50&` +
      `access_token=${session.accessToken}`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    const activeCampaigns = campaignsData.data?.filter(c => c.status === 'ACTIVE').length || 0;
    const totalCampaigns = campaignsData.data?.length || 0;
    
    // Get ad sets count
    const adsetsUrl = `https://graph.facebook.com/v18.0/${accountId}/adsets?` +
      `fields=id,status&` +
      `limit=100&` +
      `access_token=${session.accessToken}`;
    
    const adsetsResponse = await fetch(adsetsUrl);
    const adsetsData = await adsetsResponse.json();
    
    const activeAdSets = adsetsData.data?.filter(a => a.status === 'ACTIVE').length || 0;
    
    // Get ads count  
    const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
      `fields=id,status&` +
      `limit=100&` +
      `access_token=${session.accessToken}`;
    
    const adsResponse = await fetch(adsUrl);
    const adsData = await adsResponse.json();
    
    const activeAds = adsData.data?.filter(a => a.status === 'ACTIVE').length || 0;
    
    // Build response
    const metrics = {
      overview: {
        totalSpend: spend,
        totalRevenue: revenue,
        roas: roas,
        campaigns: totalCampaigns,
        activeCampaigns: activeCampaigns,
        activeAdSets: activeAdSets,
        activeAds: activeAds,
        impressions: parseInt(data.impressions) || 0,
        clicks: parseInt(data.clicks) || 0,
        ctr: parseFloat(data.ctr) || 0,
        cpc: parseFloat(data.cpc) || 0,
        cpm: parseFloat(data.cpm) || 0,
        reach: parseInt(data.reach) || 0,
        frequency: parseFloat(data.frequency) || 0,
        conversions: conversions,
        conversionRate: data.clicks > 0 ? ((conversions / data.clicks) * 100) : 0,
        costPerConversion: conversions > 0 ? (spend / conversions) : 0
      },
      accountInfo: {
        id: accountId,
        name: data.account_name || 'Unknown Account',
        currency: data.currency || 'EUR'
      },
      dateRange: datePreset,
      hasRealData: true
    };
    
    // Get trend data (last 7 days breakdown)
    const trendUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=spend,impressions,clicks,ctr,actions,action_values&` +
      `date_preset=last_7_days&` +
      `time_increment=1&` +
      `level=account&` +
      `access_token=${session.accessToken}`;
    
    const trendResponse = await fetch(trendUrl);
    const trendData = await trendResponse.json();
    
    if (trendData.data && trendData.data.length > 0) {
      const trend = {
        labels: [],
        spend: [],
        revenue: [],
        ctr: [],
        clicks: [],
        impressions: []
      };
      
      trendData.data.forEach(day => {
        const date = new Date(day.date_start);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        trend.labels.push(dayName);
        trend.spend.push(parseFloat(day.spend) || 0);
        trend.ctr.push(parseFloat(day.ctr) || 0);
        trend.clicks.push(parseInt(day.clicks) || 0);
        trend.impressions.push(parseInt(day.impressions) || 0);
        
        // Extract revenue for this day
        let dayRevenue = 0;
        if (day.action_values) {
          const purchaseValue = day.action_values.find(a => 
            a.action_type === 'purchase' || 
            a.action_type === 'omni_purchase'
          );
          if (purchaseValue) {
            dayRevenue = parseFloat(purchaseValue.value) || 0;
          }
        }
        trend.revenue.push(dayRevenue);
      });
      
      metrics.trend = trend;
    }
    
    // Get top campaigns performance
    if (campaignsData.data && campaignsData.data.length > 0) {
      const topCampaigns = campaignsData.data
        .filter(c => c.insights && c.insights.data && c.insights.data[0])
        .map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          spend: parseFloat(c.insights.data[0].spend) || 0,
          clicks: parseInt(c.insights.data[0].clicks) || 0,
          impressions: parseInt(c.insights.data[0].impressions) || 0,
          ctr: parseFloat(c.insights.data[0].ctr) || 0
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);
      
      metrics.topCampaigns = topCampaigns;
    }
    
    return NextResponse.json({
      success: true,
      metrics: metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error.message,
      fallback: true
    }, { status: 500 });
  }
}