import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { aidsLogger, LogCategories } from '@/lib/aids-logger';

// Cache mémoire pour éviter les appels API répétés
const insightsCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Support both date presets and specific date ranges
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const timeRange = searchParams.get('time_range') || 'last_30d';
    const level = searchParams.get('level') || 'account'; // account, campaign, adset, ad
    const breakdowns = searchParams.get('breakdowns');
    const timeIncrement = searchParams.get('time_increment');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        success: false
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    console.log(`[Insights V2] Request params:`, { since, until, timeRange, level, breakdowns });
    
    // Cache key based on all parameters
    const cacheKey = since && until 
      ? `${accountId}_${since}_${until}_${level}_${breakdowns || 'none'}_${timeIncrement || 'none'}`
      : `${accountId}_${timeRange}_${level}_${breakdowns || 'none'}_${timeIncrement || 'none'}`;
    
    const cached = insightsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Insights V2] Returning cached data for:', cacheKey);
      return NextResponse.json(cached.data);
    }
    
    // Build insights URL based on level
    let insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?`;
    
    // Add fields based on level
    if (level === 'campaign') {
      insightsUrl += `level=campaign&fields=campaign_id,campaign_name,objective,spend,impressions,clicks,reach,ctr,cpm,cpc,actions,action_values,cost_per_result,results&`;
    } else if (level === 'adset') {
      insightsUrl += `level=adset&fields=adset_id,adset_name,campaign_id,spend,impressions,clicks,reach,ctr,cpm,cpc,actions,action_values,cost_per_result,results&`;
    } else if (level === 'ad') {
      insightsUrl += `level=ad&fields=ad_id,ad_name,adset_id,campaign_id,spend,impressions,clicks,reach,ctr,cpm,cpc,actions,action_values,cost_per_result,results&`;
    } else {
      insightsUrl += `fields=spend,impressions,clicks,reach,ctr,cpm,cpc,cpp,frequency,actions,action_values,cost_per_result,results,conversions,conversion_values&`;
    }
    
    // Use since/until if provided, otherwise use date_preset
    if (since && until) {
      insightsUrl += `time_range={'since':'${since}','until':'${until}'}&`;
      console.log(`[Insights V2] Using specific dates: ${since} to ${until}`);
    } else {
      // Map time ranges to Meta date presets
      const datePresetMap = {
        'today': 'today',
        'yesterday': 'yesterday',
        'last_7d': 'last_7d',
        'last_30d': 'last_30d',
        'last_90d': 'last_90d',
        'lifetime': 'last_90d'
      };
      const datePreset = datePresetMap[timeRange] || 'last_30d';
      insightsUrl += `date_preset=${datePreset}&`;
      console.log(`[Insights V2] Using date preset: ${datePreset}`);
    }
    
    // Add breakdowns if requested
    if (breakdowns) {
      insightsUrl += `breakdowns=${breakdowns}&`;
    }
    
    // Add time increment for time series (not for level queries)
    if (timeIncrement && level === 'account' && timeRange !== 'today') {
      insightsUrl += `time_increment=${timeIncrement}&`;
    }
    
    // Add limit for non-account level queries
    if (level !== 'account') {
      insightsUrl += `limit=100&`;
    }
    
    insightsUrl += `access_token=${accessToken}`;
    
    console.log(`[Insights V2] Fetching:`, insightsUrl.replace(accessToken, 'TOKEN_HIDDEN'));
    
    const response = await fetch(insightsUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('[Insights V2] Meta API Error:', data.error);
      return NextResponse.json({
        error: data.error.message,
        success: false
      }, { status: 400 });
    }
    
    console.log(`[Insights V2] Got ${data.data?.length || 0} records for level: ${level}`);
    
    // Process data based on level
    let processedData = null;
    
    if (level === 'campaign') {
      // Process campaign-level data
      processedData = (data.data || []).map(item => {
        // Extract leads from actions
        let leads = 0;
        let conversions = 0;
        let conversionValue = 0;
        
        if (item.results) {
          // Use results field for leads when available (LEAD_GENERATION objective)
          leads = parseInt(item.results || 0);
        } else if (item.actions) {
          // Fallback to actions
          const leadActions = item.actions.filter(a => 
            ['lead', 'omni_complete_registration', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
          );
          leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
          
          const purchaseActions = item.actions.filter(a => a.action_type === 'purchase');
          conversions = purchaseActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
        }
        
        if (item.action_values) {
          const purchaseValues = item.action_values.filter(a => a.action_type === 'purchase');
          conversionValue = purchaseValues.reduce((sum, a) => sum + parseFloat(a.value || 0), 0);
        }
        
        return {
          id: item.campaign_id,
          name: item.campaign_name,
          objective: item.objective,
          spend: parseFloat(item.spend || 0),
          impressions: parseInt(item.impressions || 0),
          clicks: parseInt(item.clicks || 0),
          reach: parseInt(item.reach || 0),
          ctr: parseFloat(item.ctr || 0),
          cpm: parseFloat(item.cpm || 0),
          cpc: parseFloat(item.cpc || 0),
          leads: leads,
          costPerLead: leads > 0 ? parseFloat(item.spend || 0) / leads : null,
          conversions: conversions,
          conversionValue: conversionValue,
          costPerResult: parseFloat(item.cost_per_result || 0)
        };
      });
    } else if (level === 'account') {
      // Process account-level data (aggregate)
      let totalSpend = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalReach = 0;
      let totalLeads = 0;
      let totalConversions = 0;
      let totalConversionValue = 0;
      
      // Process each data item
      (data.data || []).forEach(item => {
        totalSpend += parseFloat(item.spend || 0);
        totalImpressions += parseInt(item.impressions || 0);
        totalClicks += parseInt(item.clicks || 0);
        totalReach += parseInt(item.reach || 0);
        
        if (item.results) {
          totalLeads += parseInt(item.results || 0);
        } else if (item.actions) {
          const leadActions = item.actions.filter(a => 
            ['lead', 'omni_complete_registration', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
          );
          totalLeads += leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
          
          const purchaseActions = item.actions.filter(a => a.action_type === 'purchase');
          totalConversions += purchaseActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
        }
        
        if (item.action_values) {
          const purchaseValues = item.action_values.filter(a => a.action_type === 'purchase');
          totalConversionValue += purchaseValues.reduce((sum, a) => sum + parseFloat(a.value || 0), 0);
        }
      });
      
      processedData = {
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        reach: totalReach,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0,
        cpm: totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0,
        cpc: totalClicks > 0 ? (totalSpend / totalClicks) : 0,
        leads: totalLeads,
        costPerLead: totalLeads > 0 ? totalSpend / totalLeads : null,
        conversions: totalConversions,
        conversionValue: totalConversionValue,
        daily_data: timeIncrement ? data.data : null,
        breakdown_data: breakdowns ? data.data : null
      };
    } else {
      // For adset and ad levels, return raw processed data
      processedData = data.data;
    }
    
    const responseData = {
      success: true,
      data: processedData,
      level: level,
      timestamp: new Date().toISOString(),
      dateRange: since && until ? { since, until } : null
    };
    
    // Cache the response
    insightsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('[Insights V2] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch insights',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}