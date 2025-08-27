import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'last_30d';
    
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
    
    console.log('[Combined Insights] Fetching for account:', accountId, 'timeRange:', timeRange);
    
    // 1. Get Meta Ads insights
    let metaInsights = {};
    try {
      const metaUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
        `fields=spend,impressions,clicks,reach,actions,results,cpm,cpc,ctr&` +
        `date_preset=${timeRange}&` +
        `access_token=${accessToken}`;
      
      const metaResponse = await fetch(metaUrl);
      const metaData = await metaResponse.json();
      
      if (metaData.data && metaData.data[0]) {
        const insights = metaData.data[0];
        
        // Parse basic metrics
        metaInsights = {
          spend: parseFloat(insights.spend || 0),
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          reach: parseInt(insights.reach || 0),
          cpm: parseFloat(insights.cpm || 0),
          cpc: parseFloat(insights.cpc || 0),
          ctr: parseFloat(insights.ctr || 0)
        };
        
        // Parse leads from results
        let metaLeads = 0;
        if (insights.results && Array.isArray(insights.results)) {
          insights.results.forEach(result => {
            if (result.indicator && result.indicator.includes('lead')) {
              metaLeads += parseInt(result.values?.[0]?.value || 0);
            }
          });
        }
        
        // Parse leads from actions
        if (insights.actions && Array.isArray(insights.actions)) {
          const leadAction = insights.actions.find(a => a.action_type === 'lead');
          if (leadAction) {
            metaLeads = Math.max(metaLeads, parseInt(leadAction.value || 0));
          }
        }
        
        metaInsights.metaLeads = metaLeads;
      }
    } catch (error) {
      console.error('[Combined Insights] Error fetching Meta data:', error);
    }
    
    // 2. Get Firebase prospects count
    let firebaseProspects = 0;
    let convertedProspects = 0;
    try {
      // Get all prospects for this user
      const prospectsQuery = await db.collection('prospects')
        .where('userId', '==', userId)
        .get();
      
      prospectsQuery.forEach(doc => {
        const data = doc.data();
        firebaseProspects++;
        
        if (data.status === 'converted') {
          convertedProspects++;
        }
        
        // Filter by time range if needed
        if (timeRange !== 'lifetime') {
          const createdAt = new Date(data.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
          
          // Check if within time range
          const days = timeRange === 'last_7d' ? 7 : 
                      timeRange === 'last_14d' ? 14 :
                      timeRange === 'last_30d' ? 30 :
                      timeRange === 'last_90d' ? 90 : 365;
          
          if (daysDiff > days) {
            firebaseProspects--;
            if (data.status === 'converted') {
              convertedProspects--;
            }
          }
        }
      });
      
      // Also check aids_prospects collection (old structure)
      const aidsProspectsQuery = await db.collection('aids_prospects')
        .where('userId', '==', userId)
        .get();
      
      aidsProspectsQuery.forEach(doc => {
        const data = doc.data();
        firebaseProspects++;
        
        if (data.status === 'converted') {
          convertedProspects++;
        }
      });
      
    } catch (error) {
      console.error('[Combined Insights] Error fetching prospects:', error);
    }
    
    // 3. Get Firebase revenues
    let totalRevenue = 0;
    let revenueCount = 0;
    try {
      // Get revenues from meta_ads_conversion source
      const revenuesQuery = await db.collection('revenues')
        .where('userId', '==', userId)
        .where('source', '==', 'meta_ads_conversion')
        .get();
      
      revenuesQuery.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        revenueCount++;
        
        // Filter by time range
        if (timeRange !== 'lifetime') {
          const createdAt = new Date(data.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
          
          const days = timeRange === 'last_7d' ? 7 : 
                      timeRange === 'last_14d' ? 14 :
                      timeRange === 'last_30d' ? 30 :
                      timeRange === 'last_90d' ? 90 : 365;
          
          if (daysDiff > days) {
            totalRevenue -= data.amount || 0;
            revenueCount--;
          }
        }
      });
      
      // Also check aids_revenues collection
      const aidsRevenuesQuery = await db.collection('aids_revenues')
        .where('userId', '==', userId)
        .get();
      
      aidsRevenuesQuery.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        revenueCount++;
      });
      
    } catch (error) {
      console.error('[Combined Insights] Error fetching revenues:', error);
    }
    
    // 4. Calculate combined metrics
    const totalLeads = Math.max(metaInsights.metaLeads || 0, firebaseProspects);
    const conversionRate = totalLeads > 0 ? (convertedProspects / totalLeads * 100) : 0;
    const costPerLead = totalLeads > 0 ? (metaInsights.spend / totalLeads) : 0;
    const costPerConversion = convertedProspects > 0 ? (metaInsights.spend / convertedProspects) : 0;
    const roas = metaInsights.spend > 0 ? (totalRevenue / metaInsights.spend) : 0;
    
    console.log('[Combined Insights] Results:', {
      metaLeads: metaInsights.metaLeads,
      firebaseProspects,
      totalLeads,
      convertedProspects,
      totalRevenue,
      roas
    });
    
    return NextResponse.json({
      success: true,
      // Meta Ads metrics
      spend: metaInsights.spend || 0,
      impressions: metaInsights.impressions || 0,
      clicks: metaInsights.clicks || 0,
      reach: metaInsights.reach || 0,
      cpm: metaInsights.cpm || 0,
      cpc: metaInsights.cpc || 0,
      ctr: metaInsights.ctr || 0,
      
      // Combined lead/revenue metrics
      leads: totalLeads,
      prospects: firebaseProspects,
      convertedProspects,
      revenues: totalRevenue,
      revenueCount,
      conversionRate: conversionRate.toFixed(2),
      costPerLead: costPerLead.toFixed(2),
      costPerConversion: costPerConversion.toFixed(2),
      roas: roas.toFixed(2),
      
      // Source breakdown
      sources: {
        metaLeads: metaInsights.metaLeads || 0,
        firebaseProspects,
        convertedProspects,
        totalRevenue
      }
    });
    
  } catch (error) {
    console.error('[Combined Insights] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch combined insights',
      details: error.message 
    }, { status: 500 });
  }
}