import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

// Helper pour calculer les dates de comparaison
function getComparisonDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Période précédente de même durée
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff + 1);
  
  return {
    prevStart: prevStart.toISOString().split('T')[0],
    prevEnd: prevEnd.toISOString().split('T')[0]
  };
}

// Helper pour parser les périodes prédéfinies
function parsePeriod(period) {
  const now = new Date();
  // Use UTC to avoid timezone issues
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  switch(period) {
    case 'today':
      return {
        startDate: todayStr,
        endDate: todayStr
      };
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      return {
        startDate: yesterdayStr,
        endDate: yesterdayStr
      };
    
    case 'last_7d':
      const week = new Date(now);
      week.setDate(week.getDate() - 6);
      const weekStr = `${week.getFullYear()}-${String(week.getMonth() + 1).padStart(2, '0')}-${String(week.getDate()).padStart(2, '0')}`;
      return {
        startDate: weekStr,
        endDate: todayStr
      };
    
    case 'last_15d':
      const twoWeeks = new Date(now);
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      const twoWeeksStr = `${twoWeeks.getFullYear()}-${String(twoWeeks.getMonth() + 1).padStart(2, '0')}-${String(twoWeeks.getDate()).padStart(2, '0')}`;
      return {
        startDate: twoWeeksStr,
        endDate: todayStr
      };
    
    case 'last_30d':
      const thirtyDays = new Date(now);
      thirtyDays.setDate(thirtyDays.getDate() - 29);
      const thirtyDaysStr = `${thirtyDays.getFullYear()}-${String(thirtyDays.getMonth() + 1).padStart(2, '0')}-${String(thirtyDays.getDate()).padStart(2, '0')}`;
      return {
        startDate: thirtyDaysStr,
        endDate: todayStr
      };
    
    case 'last_90d':
      const ninetyDays = new Date(now);
      ninetyDays.setDate(ninetyDays.getDate() - 89);
      const ninetyDaysStr = `${ninetyDays.getFullYear()}-${String(ninetyDays.getMonth() + 1).padStart(2, '0')}-${String(ninetyDays.getDate()).padStart(2, '0')}`;
      return {
        startDate: ninetyDaysStr,
        endDate: todayStr
      };
    
    case 'current_month':
      const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      return {
        startDate: monthStartStr,
        endDate: todayStr
      };
    
    case 'last_month':
      const lastMonth = month === 0 ? 11 : month - 1;
      const lastMonthYear = month === 0 ? year - 1 : year;
      const lastMonthDays = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
      const lastMonthStartStr = `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`;
      const lastMonthEndStr = `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-${String(lastMonthDays).padStart(2, '0')}`;
      return {
        startDate: lastMonthStartStr,
        endDate: lastMonthEndStr
      };
    
    default:
      return null;
  }
}

async function fetchPeriodData(accountId, accessToken, userId, startDate, endDate) {
  // 1. Get Meta Ads insights for period
  let metaInsights = {};
  try {
    const metaUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=spend,impressions,clicks,reach,actions,results,cpm,cpc,ctr&` +
      `time_range={'since':'${startDate}','until':'${endDate}'}&` +
      `access_token=${accessToken}`;
    
    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();
    
    if (metaData.data && metaData.data[0]) {
      const insights = metaData.data[0];
      
      metaInsights = {
        spend: parseFloat(insights.spend || 0),
        impressions: parseInt(insights.impressions || 0),
        clicks: parseInt(insights.clicks || 0),
        reach: parseInt(insights.reach || 0),
        cpm: parseFloat(insights.cpm || 0),
        cpc: parseFloat(insights.cpc || 0),
        ctr: parseFloat(insights.ctr || 0)
      };
      
      // Parse leads
      let metaLeads = 0;
      if (insights.results && Array.isArray(insights.results)) {
        insights.results.forEach(result => {
          if (result.indicator && result.indicator.includes('lead')) {
            metaLeads += parseInt(result.values?.[0]?.value || 0);
          }
        });
      }
      
      if (insights.actions && Array.isArray(insights.actions)) {
        const leadAction = insights.actions.find(a => a.action_type === 'lead');
        if (leadAction) {
          metaLeads = Math.max(metaLeads, parseInt(leadAction.value || 0));
        }
      }
      
      metaInsights.metaLeads = metaLeads;
    }
  } catch (error) {
    console.error('[Combined Insights V2] Error fetching Meta data:', error);
  }
  
  // 2. Get Firebase prospects for period
  let firebaseProspects = 0;
  let convertedProspects = 0;
  
  try {
    const aidsProspectsQuery = await db.collection('aids_prospects').get();
    
    aidsProspectsQuery.forEach(doc => {
      const data = doc.data();
      const prospectDate = data.date ? new Date(data.date) : 
                          data.createdAt ? new Date(data.createdAt) : null;
      
      if (prospectDate) {
        const dateStr = prospectDate.toISOString().split('T')[0];
        if (dateStr >= startDate && dateStr <= endDate) {
          firebaseProspects++;
          if (data.status === 'converted') {
            convertedProspects++;
          }
        }
      }
    });
  } catch (error) {
    console.error('[Combined Insights V2] Error fetching prospects:', error);
  }
  
  // 3. Get revenues based on leadDate for period
  let totalRevenue = 0;
  let revenueCount = 0;
  let totalTTD = 0;
  let ttdCount = 0;
  
  try {
    const aidsRevenuesQuery = await db.collection('aids_revenues').get();
    
    aidsRevenuesQuery.forEach(doc => {
      const data = doc.data();
      const amount = parseFloat(data.amount || 0);
      
      // Use leadDate for cohort analysis
      const dateToCheck = data.leadDate ? new Date(data.leadDate) : 
                         data.date ? new Date(data.date) : 
                         data.createdAt ? new Date(data.createdAt) : null;
      
      if (dateToCheck) {
        const dateStr = dateToCheck.toISOString().split('T')[0];
        if (dateStr >= startDate && dateStr <= endDate) {
          totalRevenue += amount;
          revenueCount++;
          
          // Calculate TTD
          if (data.leadDate && (data.date || data.createdAt)) {
            const leadDate = new Date(data.leadDate);
            const closingDate = new Date(data.date || data.createdAt);
            const ttdDays = Math.floor((closingDate - leadDate) / (1000 * 60 * 60 * 24));
            
            if (ttdDays >= 0 && ttdDays < 365) {
              totalTTD += ttdDays;
              ttdCount++;
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('[Combined Insights V2] Error fetching revenues:', error);
  }
  
  // Calculate metrics
  const totalLeads = Math.max(metaInsights.metaLeads || 0, firebaseProspects);
  const actualConversions = revenueCount > 0 ? revenueCount : convertedProspects;
  const conversionRate = totalLeads > 0 ? (actualConversions / totalLeads * 100) : 0;
  const costPerLead = totalLeads > 0 ? (metaInsights.spend / totalLeads) : 0;
  const costPerConversion = actualConversions > 0 ? (metaInsights.spend / actualConversions) : 0;
  const roas = metaInsights.spend > 0 ? (totalRevenue / metaInsights.spend) : 0;
  const averageTTD = ttdCount > 0 ? Math.round(totalTTD / ttdCount) : 0;
  
  return {
    // Meta metrics
    spend: metaInsights.spend || 0,
    impressions: metaInsights.impressions || 0,
    clicks: metaInsights.clicks || 0,
    reach: metaInsights.reach || 0,
    cpm: metaInsights.cpm || 0,
    cpc: metaInsights.cpc || 0,
    ctr: metaInsights.ctr || 0,
    
    // Combined metrics
    leads: totalLeads,
    prospects: firebaseProspects,
    convertedProspects,
    revenues: totalRevenue,
    revenueCount,
    conversionRate: conversionRate.toFixed(2),
    costPerLead: costPerLead.toFixed(2),
    costPerConversion: costPerConversion.toFixed(2),
    roas: roas.toFixed(2),
    averageTTD,
    ttdCount
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Support both predefined periods and custom date ranges
    const period = searchParams.get('period');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const compare = searchParams.get('compare') === 'true';
    
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    const selectedAccount = cookieStore.get('selected_ad_account');
    
    if (!metaSession || !selectedAccount) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        requiresAuth: true 
      }, { status: 401 });
    }
    
    const session = JSON.parse(metaSession.value);
    const accountId = selectedAccount.value;
    const accessToken = session.accessToken;
    const userId = session.userId;
    
    // Determine date range
    let currentStart, currentEnd;
    
    if (period) {
      const parsed = parsePeriod(period);
      if (!parsed) {
        return NextResponse.json({ 
          error: 'Invalid period' 
        }, { status: 400 });
      }
      currentStart = parsed.startDate;
      currentEnd = parsed.endDate;
    } else if (startDate && endDate) {
      currentStart = startDate;
      currentEnd = endDate;
    } else {
      // Default to current month
      const parsed = parsePeriod('current_month');
      currentStart = parsed.startDate;
      currentEnd = parsed.endDate;
    }
    
    console.log(`[Combined Insights V2] Period: ${currentStart} to ${currentEnd}`);
    
    // Get current period data
    const currentData = await fetchPeriodData(
      accountId, 
      accessToken, 
      userId, 
      currentStart, 
      currentEnd
    );
    
    // Get comparison data if requested
    let comparisonData = null;
    let percentChanges = null;
    
    if (compare) {
      const { prevStart, prevEnd } = getComparisonDates(currentStart, currentEnd);
      console.log(`[Combined Insights V2] Comparison: ${prevStart} to ${prevEnd}`);
      
      comparisonData = await fetchPeriodData(
        accountId, 
        accessToken, 
        userId, 
        prevStart, 
        prevEnd
      );
      
      // Calculate percent changes
      percentChanges = {
        spend: comparisonData.spend > 0 
          ? ((currentData.spend - comparisonData.spend) / comparisonData.spend * 100).toFixed(1)
          : 0,
        impressions: comparisonData.impressions > 0
          ? ((currentData.impressions - comparisonData.impressions) / comparisonData.impressions * 100).toFixed(1)
          : 0,
        clicks: comparisonData.clicks > 0
          ? ((currentData.clicks - comparisonData.clicks) / comparisonData.clicks * 100).toFixed(1)
          : 0,
        leads: comparisonData.leads > 0
          ? ((currentData.leads - comparisonData.leads) / comparisonData.leads * 100).toFixed(1)
          : 0,
        revenues: comparisonData.revenues > 0
          ? ((currentData.revenues - comparisonData.revenues) / comparisonData.revenues * 100).toFixed(1)
          : 0,
        roas: comparisonData.roas > 0
          ? ((parseFloat(currentData.roas) - parseFloat(comparisonData.roas)) / parseFloat(comparisonData.roas) * 100).toFixed(1)
          : 0,
        conversionRate: comparisonData.conversionRate > 0
          ? ((parseFloat(currentData.conversionRate) - parseFloat(comparisonData.conversionRate)) / parseFloat(comparisonData.conversionRate) * 100).toFixed(1)
          : 0
      };
    }
    
    return NextResponse.json({
      success: true,
      period: {
        start: currentStart,
        end: currentEnd
      },
      current: currentData,
      comparison: comparisonData,
      percentChanges,
      compare
    });
    
  } catch (error) {
    console.error('[Combined Insights V2] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error.message 
    }, { status: 500 });
  }
}