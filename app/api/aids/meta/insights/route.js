import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

// Cache pour éviter les limites de rate
const insightsCache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 secondes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || searchParams.get('range') || 'last_7d';
    const breakdowns = searchParams.get('breakdowns'); // age,gender,publisher_platform,etc.
    const timeIncrement = searchParams.get('time_increment') || '1'; // Pour les séries temporelles
    
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
      'last_90d': 'last_90d',
      'lifetime': 'last_90d'  // Use last_90d instead of lifetime
    };
    
    const datePreset = datePresetMap[timeRange] || 'last_7d';
    console.log(`[Insights API] timeRange: ${timeRange}, datePreset: ${datePreset}`);
    
    // Clé de cache unique
    const cacheKey = `${accountId}_${timeRange}_${breakdowns || 'none'}_${timeIncrement}`;
    const cached = insightsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached insights data for:', cacheKey);
      return NextResponse.json(cached.data);
    }
    
    // Construire l'URL des insights avec ou sans breakdowns
    let insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=spend,impressions,clicks,ctr,cpc,cpm,cpp,reach,frequency,conversions,conversion_values,cost_per_conversion,actions,action_values,cost_per_result,results&` +
      `date_preset=${datePreset}&`;
    
    // Ajouter breakdowns si demandé
    if (breakdowns) {
      insightsUrl += `breakdowns=${breakdowns}&`;
    }
    
    // Ajouter time_increment pour les séries temporelles
    if (timeIncrement && timeRange !== 'lifetime' && timeRange !== 'today') {
      insightsUrl += `time_increment=${timeIncrement}&`;
    }
    
    insightsUrl += `access_token=${accessToken}`;
    
    console.log(`[Insights API] Fetching URL: ${insightsUrl.replace(accessToken, 'TOKEN_HIDDEN')}`);
    console.log(`[Insights API] Date preset: ${datePreset}, Time range: ${timeRange}`);
    console.log(`[Insights API] Account ID: ${accountId}`);
    
    const response = await fetch(insightsUrl);
    const data = await response.json();
    
    console.log(`[Insights API] Response data length: ${data.data?.length || 0}, Time range: ${timeRange}`);
    if (data.data && data.data.length > 0) {
      console.log(`[Insights API] Date range in response: ${data.data[0].date_start} to ${data.data[data.data.length - 1].date_stop || data.data[0].date_stop}`);
      // Log the raw spend to debug the discrepancy
      const rawTotalSpend = data.data.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
      console.log(`[Insights API] Raw total spend from API: ${rawTotalSpend.toFixed(2)}€`);
    }
    
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
    
    // Traiter les données récupérées
    let processedData = data.data || [];
    
    // Si nous avons des breakdowns, organiser les données par breakdown
    let breakdownData = null;
    if (breakdowns && processedData.length > 0) {
      breakdownData = processedData.map(item => {
        // Extraire les valeurs des breakdowns
        const breakdownValues = {};
        if (breakdowns.includes('age')) breakdownValues.age = item.age;
        if (breakdowns.includes('gender')) breakdownValues.gender = item.gender;
        if (breakdowns.includes('publisher_platform')) breakdownValues.publisher_platform = item.publisher_platform;
        if (breakdowns.includes('platform_position')) breakdownValues.platform_position = item.platform_position;
        if (breakdowns.includes('impression_device')) breakdownValues.impression_device = item.impression_device;
        if (breakdowns.includes('region')) breakdownValues.region = item.region;
        
        // Extraire les conversions et valeurs
        let conversions = 0;
        let conversionValue = 0;
        
        if (item.actions) {
          const conversionActions = item.actions.filter(a => 
            ['lead', 'purchase', 'complete_registration'].includes(a.action_type)
          );
          conversions = conversionActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
        }
        
        if (item.action_values) {
          const purchaseValues = item.action_values.filter(a => 
            a.action_type === 'purchase'
          );
          conversionValue = purchaseValues.reduce((sum, a) => sum + parseFloat(a.value || 0), 0);
        }
        
        return {
          ...breakdownValues,
          metrics: {
            spend: parseFloat(item.spend || 0),
            impressions: parseInt(item.impressions || 0),
            clicks: parseInt(item.clicks || 0),
            ctr: parseFloat(item.ctr || 0),
            cpc: parseFloat(item.cpc || 0),
            cpm: parseFloat(item.cpm || 0),
            reach: parseInt(item.reach || 0),
            conversions: conversions,
            conversionValue: conversionValue,
            cost_per_result: parseFloat(item.cost_per_result || 0)
          },
          date_start: item.date_start,
          date_stop: item.date_stop
        };
      });
    }
    
    // Récupérer les données par jour si nécessaire
    let dailyData = [];
    if (timeIncrement === '1' && processedData.length > 0) {
      dailyData = processedData.map(day => ({
        date: day.date_start,
        spend: parseFloat(day.spend || 0),
        impressions: parseInt(day.impressions || 0),
        clicks: parseInt(day.clicks || 0),
        ctr: parseFloat(day.ctr || 0),
        actions: day.actions,
        action_values: day.action_values
      }));
    }
    
    // Calculer les totaux - TOUJOURS agréger toutes les données
    let totalConversions = 0;
    let totalConversionValue = 0;
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalReach = 0;
    let totalLeads = 0;
    
    console.log(`[Insights API] Processing ${processedData.length} data items for aggregation`);
    
    // Toujours agréger les données, même s'il n'y en a qu'une
    if (!breakdowns && processedData.length > 0) {
      processedData.forEach(item => {
        totalSpend += parseFloat(item.spend || 0);
        totalImpressions += parseInt(item.impressions || 0);
        totalClicks += parseInt(item.clicks || 0);
        // Sum reach across all days (not max) for proper aggregation
        totalReach += parseInt(item.reach || 0);
        
        // Priorité aux results pour les leads (objectif LEAD_GENERATION)
        if (item.results) {
          totalLeads += parseInt(item.results || 0);
        } else if (item.actions) {
          // Fallback : compter les leads depuis les actions
          const leadActions = item.actions.filter(a => 
            a.action_type === 'lead' || 
            a.action_type === 'leadgen_grouped' ||
            a.action_type === 'offsite_conversion.fb_pixel_lead'
          );
          const leadCount = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
          totalLeads += leadCount;
          
          // Compter les purchases pour les conversions
          const purchaseActions = item.actions.filter(a => a.action_type === 'purchase');
          const purchaseCount = purchaseActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
          totalConversions += purchaseCount;
        }
        
        if (item.action_values) {
          const purchaseValues = item.action_values
            .filter(a => a.action_type === 'purchase')
            .reduce((sum, a) => sum + parseFloat(a.value || 0), 0);
          totalConversionValue += purchaseValues;
        }
      });
    }
    
    console.log(`[Insights API] Totals - Spend: ${totalSpend}, Impressions: ${totalImpressions}, Clicks: ${totalClicks}, Leads: ${totalLeads}, Conversions: ${totalConversions}`);
    
    // Calculer les métriques dérivées
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    const cpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0;
    const costPerConversion = totalConversions > 0 ? (totalSpend / totalConversions) : 0;
    const roas = totalSpend > 0 ? (totalConversionValue / totalSpend) : 0;
    
    // Calculate the date range based on the timeRange parameter
    let actualDateRange = null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(timeRange) {
      case 'today':
        actualDateRange = {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        actualDateRange = {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0]
        };
        break;
      case 'last_7d':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // -6 because today is included
        actualDateRange = {
          start: sevenDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
        break;
      case 'last_30d':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // -29 because today is included
        actualDateRange = {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
        break;
      case 'last_90d':
      case 'lifetime':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89); // -89 because today is included
        actualDateRange = {
          start: ninetyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
        break;
      default:
        // Fallback to data from API if available
        if (processedData.length > 0) {
          const firstItem = processedData[0];
          const lastItem = processedData[processedData.length - 1];
          actualDateRange = {
            start: firstItem.date_start || lastItem.date_start,
            end: firstItem.date_stop || lastItem.date_stop
          };
        }
    }
    
    const formattedInsights = {
      spend: totalSpend.toFixed(2),
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: ctr.toFixed(2),
      cpc: cpc.toFixed(2),
      cpm: cpm.toFixed(2),
      reach: totalReach,
      leads: totalLeads,
      conversions: totalConversions,
      conversion_value: totalConversionValue.toFixed(2),
      cost_per_conversion: costPerConversion.toFixed(2),
      roas: roas.toFixed(2),
      daily_data: dailyData,
      breakdown_data: breakdownData,
      time_range: timeRange,
      date_range: actualDateRange,
      has_revenue_data: totalConversionValue > 0
    };
    
    aidsLogger.success(LogCategories.ANALYTICS, 'Insights récupérés avec succès', {
      timeRange,
      hasData: totalSpend > 0
    });
    
    const responseData = {
      success: true,
      insights: formattedInsights,
      timestamp: new Date().toISOString(),
      accountId: accountId
    };
    
    // Mettre en cache
    insightsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Erreur critique API insights', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error.message,
      insights: null
    }, { status: 500 });
  }
}