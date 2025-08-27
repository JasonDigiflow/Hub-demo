import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'last_30d';
    const endpoint = searchParams.get('endpoint') || 'insights';
    
    const cookieStore = await cookies();
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
    
    // Map time ranges
    const datePresetMap = {
      'today': 'today',
      'yesterday': 'yesterday', 
      'last_7d': 'last_7d',
      'last_30d': 'last_30d',
      'last_90d': 'last_90d',
      'lifetime': 'maximum'  // Try maximum instead of last_90d
    };
    
    const datePreset = datePresetMap[timeRange] || 'last_30d';
    
    let url = '';
    
    if (endpoint === 'insights') {
      // Test insights endpoint
      url = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=spend,impressions,clicks,ctr,cpc,cpm,cpp,reach,frequency,` +
        `conversions,conversion_values,cost_per_conversion,` +
        `actions,action_values,cost_per_result,results,` +
        `cost_per_action_type,website_purchase_roas,purchase_roas,` +
        `website_ctr,unique_clicks,unique_impressions&` +
        `date_preset=${datePreset}&` +
        `time_increment=all_days&` + // Get total for period
        `access_token=${accessToken}`;
    } else if (endpoint === 'campaigns') {
      // Test campaigns endpoint
      url = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
        `fields=id,name,status,objective,insights{spend,impressions,clicks,reach,actions,results}&` +
        `date_preset=${datePreset}&` +
        `limit=50&` +
        `access_token=${accessToken}`;
    }
    
    console.log('[DEBUG-META] Request URL:', url.replace(accessToken, 'TOKEN_HIDDEN'));
    console.log('[DEBUG-META] Time Range:', timeRange, '-> Date Preset:', datePreset);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Save response to file for analysis
    const debugDir = path.join(process.cwd(), 'debug-meta');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    const fileName = `meta-response-${endpoint}-${timeRange}-${Date.now()}.json`;
    const filePath = path.join(debugDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log('[DEBUG-META] Response saved to:', filePath);
    
    // Log key metrics
    if (data.data && data.data.length > 0) {
      const item = data.data[0];
      console.log('[DEBUG-META] Raw data sample:', {
        spend: item.spend,
        impressions: item.impressions,
        reach: item.reach,
        results: item.results,
        actions: item.actions?.slice(0, 3), // First 3 actions
        hasConversions: !!item.conversions,
        hasResults: !!item.results,
        dateStart: item.date_start,
        dateStop: item.date_stop
      });
    }
    
    // Return formatted response
    return NextResponse.json({
      success: true,
      request: {
        timeRange,
        datePreset,
        endpoint,
        accountId
      },
      response: data,
      debugFile: fileName,
      analysis: {
        hasData: data.data && data.data.length > 0,
        dataCount: data.data?.length || 0,
        totalSpend: data.data?.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0),
        totalImpressions: data.data?.reduce((sum, item) => sum + parseInt(item.impressions || 0), 0),
        totalClicks: data.data?.reduce((sum, item) => sum + parseInt(item.clicks || 0), 0),
        totalResults: data.data?.reduce((sum, item) => sum + parseInt(item.results || 0), 0),
        dateRange: data.data?.[0] ? {
          start: data.data[0].date_start,
          stop: data.data[0].date_stop
        } : null
      }
    });
    
  } catch (error) {
    console.error('[DEBUG-META] Error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}