import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'last_7d';
    
    aidsLogger.info(LogCategories.ANALYTICS, `Récupération insights Meta: ${timeRange}`);
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      aidsLogger.error(LogCategories.AUTH, 'Session Meta ou compte manquant pour insights');
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        insights: null
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    // Mapper les time ranges
    const datePresetMap = {
      'today': 'today',
      'yesterday': 'yesterday',
      'last_7d': 'last_7d',
      'last_30d': 'last_30d',
      'lifetime': 'lifetime'
    };
    
    const datePreset = datePresetMap[timeRange] || 'last_7d';
    
    // Récupérer les insights du compte publicitaire
    const insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=spend,impressions,clicks,ctr,cpc,cpm,cpp,reach,frequency,conversions,conversion_values,cost_per_conversion,actions,action_values&` +
      `date_preset=${datePreset}&` +
      `access_token=${accessToken}`;
    
    const response = await fetch(insightsUrl);
    const data = await response.json();
    
    if (data.error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur API Meta insights', {
        error: data.error,
        accountId,
        timeRange
      });
      
      return NextResponse.json({
        error: data.error.message,
        insights: null
      });
    }
    
    // Récupérer les données par jour si disponible
    let dailyData = [];
    if (timeRange !== 'lifetime' && timeRange !== 'today') {
      try {
        const dailyUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
          `fields=spend,impressions,clicks,ctr&` +
          `date_preset=${datePreset}&` +
          `time_increment=1&` + // Données quotidiennes
          `access_token=${accessToken}`;
        
        const dailyResponse = await fetch(dailyUrl);
        const dailyDataResponse = await dailyResponse.json();
        
        if (dailyDataResponse.data) {
          dailyData = dailyDataResponse.data.map(day => ({
            date: day.date_start,
            spend: parseFloat(day.spend || 0),
            impressions: parseInt(day.impressions || 0),
            clicks: parseInt(day.clicks || 0),
            ctr: parseFloat(day.ctr || 0)
          }));
        }
      } catch (error) {
        aidsLogger.warning(LogCategories.ANALYTICS, 'Erreur récupération données quotidiennes', error);
      }
    }
    
    const insights = data.data?.[0] || {};
    
    // Extraire les conversions depuis actions
    let conversions = 0;
    if (insights.actions) {
      const conversionActions = ['purchase', 'lead', 'complete_registration', 'add_to_cart'];
      conversions = insights.actions
        .filter(action => conversionActions.includes(action.action_type))
        .reduce((sum, action) => sum + parseInt(action.value || 0), 0);
    }
    
    const formattedInsights = {
      spend: parseFloat(insights.spend || 0).toFixed(2),
      impressions: parseInt(insights.impressions || 0),
      clicks: parseInt(insights.clicks || 0),
      ctr: parseFloat(insights.ctr || 0).toFixed(2),
      cpc: parseFloat(insights.cpc || 0).toFixed(2),
      cpm: parseFloat(insights.cpm || 0).toFixed(2),
      cpp: parseFloat(insights.cpp || 0).toFixed(2),
      reach: parseInt(insights.reach || 0),
      frequency: parseFloat(insights.frequency || 0).toFixed(2),
      conversions: conversions,
      conversion_value: parseFloat(insights.conversion_values?.value || 0).toFixed(2),
      cost_per_conversion: conversions > 0 
        ? (parseFloat(insights.spend || 0) / conversions).toFixed(2)
        : '0',
      daily_data: dailyData,
      time_range: timeRange
    };
    
    aidsLogger.success(LogCategories.ANALYTICS, 'Insights récupérés avec succès', {
      timeRange,
      hasData: !!insights.spend
    });
    
    return NextResponse.json({
      success: true,
      insights: formattedInsights
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Erreur critique API insights', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error.message,
      insights: null
    }, { status: 500 });
  }
}