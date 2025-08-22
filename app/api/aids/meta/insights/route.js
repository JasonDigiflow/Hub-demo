import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'daily';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
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
    
    // Map our range to Facebook date preset or use custom dates
    let dateParams = '';
    let trendIncrement = '1'; // daily by default
    let trendDays = 7;
    
    if (range === 'custom' && startDate && endDate) {
      dateParams = `&since=${startDate}&until=${endDate}`;
      // Calculate days between dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      trendDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      trendIncrement = trendDays > 31 ? '7' : '1'; // Weekly if > 31 days
    } else {
      const datePreset = {
        'daily': 'yesterday',
        'weekly': 'last_7_days',
        'monthly': 'last_30_days',
        'quarterly': 'last_90_days'
      }[range] || 'last_7_days';
      dateParams = `&date_preset=${datePreset}`;
      
      // Set trend parameters based on range
      if (range === 'monthly') {
        trendDays = 30;
        trendIncrement = '1';
      } else if (range === 'quarterly') {
        trendDays = 90;
        trendIncrement = '7'; // Weekly increments for quarterly
      } else if (range === 'weekly') {
        trendDays = 7;
        trendIncrement = '1';
      } else {
        trendDays = 1;
        trendIncrement = '1';
      }
    }
    
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
      `fields=${fields}` +
      `${dateParams}&` +
      `level=account&` +
      `access_token=${session.accessToken}`;
    
    console.log('Fetching insights from:', insightsUrl.replace(session.accessToken, 'TOKEN'));
    console.log('Date params:', dateParams);
    console.log('Range:', range);
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    console.log('Insights data received:', JSON.stringify(insightsData).substring(0, 200));
    
    if (insightsData.error) {
      console.error('Facebook API error:', insightsData.error);
      return NextResponse.json({ 
        error: insightsData.error.message,
        fallback: true,
        details: insightsData.error
      }, { status: 400 });
    }
    
    // Process the data
    const data = insightsData.data?.[0] || {};
    
    console.log('Processing data:', Object.keys(data));
    
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
    
    console.log('Metrics extracted - Spend:', spend, 'Revenue:', revenue, 'ROAS:', roas);
    
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
    
    // Build response with default values
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
      dateRange: range === 'custom' ? `${startDate} - ${endDate}` : range,
      hasRealData: true
    };
    
    // Get trend data based on selected period
    let trendUrl = '';
    if (range === 'custom' && startDate && endDate) {
      trendUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=spend,impressions,clicks,ctr,actions,action_values&` +
        `since=${startDate}&until=${endDate}&` +
        `time_increment=${trendIncrement}&` +
        `level=account&` +
        `access_token=${session.accessToken}`;
    } else if (range === 'daily') {
      // For daily, get hourly breakdown of yesterday
      trendUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=spend,impressions,clicks,ctr,actions,action_values&` +
        `date_preset=yesterday&` +
        `breakdowns=hourly_stats_aggregated_by_advertiser_time_zone&` +
        `level=account&` +
        `access_token=${session.accessToken}`;
    } else {
      // For weekly/monthly, get daily breakdown
      const preset = range === 'monthly' ? 'last_30_days' : range === 'quarterly' ? 'last_90_days' : 'last_7_days';
      trendUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=spend,impressions,clicks,ctr,actions,action_values&` +
        `date_preset=${preset}&` +
        `time_increment=${trendIncrement}&` +
        `level=account&` +
        `access_token=${session.accessToken}`;
    }
    
    console.log('Fetching trend from:', trendUrl.replace(session.accessToken, 'TOKEN'));
    
    const trendResponse = await fetch(trendUrl);
    const trendData = await trendResponse.json();
    
    console.log('Trend data points:', trendData.data?.length || 0);
    
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
        let label = '';
        
        if (range === 'daily' && day.hourly_stats_aggregated_by_advertiser_time_zone) {
          // For hourly data
          label = day.hourly_stats_aggregated_by_advertiser_time_zone;
        } else if (day.date_start) {
          const date = new Date(day.date_start);
          
          if (range === 'monthly' || (range === 'custom' && trendDays > 14)) {
            // Show date for monthly view
            label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          } else if (range === 'quarterly') {
            // Show week number for quarterly
            label = `Sem ${Math.ceil(date.getDate() / 7)}`;
          } else {
            // Show day name for weekly
            label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          }
        }
        
        trend.labels.push(label);
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
    } else {
      // Provide default trend data if API call fails
      metrics.trend = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        spend: Array(7).fill(0),
        revenue: Array(7).fill(0),
        ctr: Array(7).fill(0),
        clicks: Array(7).fill(0),
        impressions: Array(7).fill(0)
      };
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
    } else {
      metrics.topCampaigns = [];
    }
    
    // Ensure trend always exists
    if (!metrics.trend) {
      metrics.trend = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        spend: Array(7).fill(0),
        revenue: Array(7).fill(0),
        ctr: Array(7).fill(0),
        clicks: Array(7).fill(0),
        impressions: Array(7).fill(0)
      };
    }
    
    const response = {
      success: true,
      metrics: metrics,
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning success with hasRealData:', metrics.hasRealData);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Insights API error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      fallback: true
    }, { status: 500 });
  }
}