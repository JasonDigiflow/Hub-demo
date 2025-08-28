import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

// Cache pour la hiérarchie
const hierarchyCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper pour calculer les dates selon la période (exclut aujourd'hui)
function parsePeriod(period) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  
  switch(period) {
    case 'today':
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return { startDate: todayStr, endDate: todayStr };
    
    case 'yesterday':
      return { startDate: yesterdayStr, endDate: yesterdayStr };
    
    case 'last_7d':
      const week = new Date(now);
      week.setDate(week.getDate() - 7);
      const weekStr = `${week.getFullYear()}-${String(week.getMonth() + 1).padStart(2, '0')}-${String(week.getDate()).padStart(2, '0')}`;
      return { startDate: weekStr, endDate: yesterdayStr };
    
    case 'last_30d':
      const thirtyDays = new Date(now);
      thirtyDays.setDate(thirtyDays.getDate() - 30);
      const thirtyDaysStr = `${thirtyDays.getFullYear()}-${String(thirtyDays.getMonth() + 1).padStart(2, '0')}-${String(thirtyDays.getDate()).padStart(2, '0')}`;
      return { startDate: thirtyDaysStr, endDate: yesterdayStr };
    
    case 'last_90d':
      const ninetyDays = new Date(now);
      ninetyDays.setDate(ninetyDays.getDate() - 90);
      const ninetyDaysStr = `${ninetyDays.getFullYear()}-${String(ninetyDays.getMonth() + 1).padStart(2, '0')}-${String(ninetyDays.getDate()).padStart(2, '0')}`;
      return { startDate: ninetyDaysStr, endDate: yesterdayStr };
    
    default:
      // Par défaut: last_30d
      const defaultDays = new Date(now);
      defaultDays.setDate(defaultDays.getDate() - 30);
      const defaultStr = `${defaultDays.getFullYear()}-${String(defaultDays.getMonth() + 1).padStart(2, '0')}-${String(defaultDays.getDate()).padStart(2, '0')}`;
      return { startDate: defaultStr, endDate: yesterdayStr };
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'last_30d';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected',
        campaigns: []
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    // Calculer les dates réelles à utiliser
    let actualStartDate, actualEndDate;
    if (startDate && endDate) {
      actualStartDate = startDate;
      actualEndDate = endDate;
    } else if (timeRange) {
      const periodDates = parsePeriod(timeRange);
      actualStartDate = periodDates.startDate;
      actualEndDate = periodDates.endDate;
    } else {
      const periodDates = parsePeriod('last_30d');
      actualStartDate = periodDates.startDate;
      actualEndDate = periodDates.endDate;
    }
    
    // Vérifier le cache mémoire avec les dates réelles
    const cacheKey = `${accountId}_${actualStartDate}_${actualEndDate}`;
    const cached = hierarchyCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Hierarchy] Returning cached data');
      return NextResponse.json({
        success: true,
        campaigns: cached.campaigns,
        fromCache: true,
        timestamp: cached.timestamp
      });
    }
    
    // Désactivé : Le cache Firestore ne prend pas en compte les différentes périodes
    // et retourne toujours les mêmes données peu importe la période sélectionnée
    /*
    // Vérifier le cache Firestore
    try {
      const userId = session.userId;
      if (userId) {
        const docRef = db.collection('insights_cache').doc(`${userId}_${accountId}`);
        const doc = await docRef.get();
        
        if (doc.exists) {
          const data = doc.data();
          const cacheAge = Date.now() - data.lastSync.toMillis();
          
          if (cacheAge < CACHE_DURATION) {
            console.log('[Hierarchy] Returning Firestore cached data');
            
            // Mettre en cache mémoire aussi
            hierarchyCache.set(cacheKey, {
              campaigns: data.campaigns,
              timestamp: data.lastSync.toMillis()
            });
            
            return NextResponse.json({
              success: true,
              campaigns: data.campaigns || [],
              fromCache: true,
              timestamp: data.lastSync.toMillis()
            });
          }
        }
      }
    } catch (error) {
      console.error('[Hierarchy] Error reading from Firestore:', error);
    }
    */
    
    // Si pas de cache valide, récupérer depuis Meta API
    console.log('[Hierarchy] Fetching from Meta API');
    
    // Utiliser les dates calculées plus haut
    console.log(`[Hierarchy] Using date range: ${actualStartDate} to ${actualEndDate}`);
    
    // Toujours utiliser des dates explicites pour un contrôle total
    const dateParam = `time_range={'since':'${actualStartDate}','until':'${actualEndDate}'}`;
    const dateForInsights = dateParam;
    
    // Récupérer les campagnes
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective,effective_status,daily_budget,lifetime_budget&` +
      `limit=50&` +
      `access_token=${accessToken}`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    if (campaignsData.error) {
      console.error('[Hierarchy] Meta API error:', campaignsData.error);
      return NextResponse.json({ 
        error: campaignsData.error.message,
        campaigns: []
      }, { status: 400 });
    }
    
    const campaigns = campaignsData.data || [];
    
    // Pour chaque campagne, récupérer les insights et la hiérarchie
    const campaignsWithHierarchy = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          // Récupérer les insights de la campagne
          const campaignInsightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?` +
            `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,action_values,cost_per_result,results&` +
            `${dateForInsights}&` +
            `access_token=${accessToken}`;
          
          // Debug log to check the date parameter
          console.log(`[Hierarchy Debug] Campaign ${campaign.id} - Date param: ${dateForInsights}`);
          
          const campaignInsightsResponse = await fetch(campaignInsightsUrl);
          const campaignInsightsData = await campaignInsightsResponse.json();
          
          // Extraire les métriques
          let campaignMetrics = {};
          if (campaignInsightsData.data && campaignInsightsData.data.length > 0) {
            const insights = campaignInsightsData.data[0];
            
            // Compter les leads - priorité aux results
            let leads = 0;
            if (insights.results) {
              leads = parseInt(insights.results || 0);
            } else if (insights.actions) {
              const leadActions = insights.actions.filter(a => 
                a.action_type === 'lead' || 
                a.action_type === 'leadgen_grouped' ||
                a.action_type === 'offsite_conversion.fb_pixel_lead'
              );
              leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
            }
            
            campaignMetrics = {
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              ctr: parseFloat(insights.ctr || 0),
              cpc: parseFloat(insights.cpc || 0),
              cpm: parseFloat(insights.cpm || 0),
              reach: parseInt(insights.reach || 0),
              leads: leads,
              cost_per_result: parseFloat(insights.cost_per_result || 0)
            };
          }
          
          // Récupérer les ad sets
          const adSetsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/adsets?` +
            `fields=id,name,status,effective_status,daily_budget,lifetime_budget,targeting&` +
            `limit=50&` +
            `access_token=${accessToken}`;
          
          const adSetsResponse = await fetch(adSetsUrl);
          const adSetsData = await adSetsResponse.json();
          
          const adSets = await Promise.all(
            (adSetsData.data || []).map(async (adSet) => {
              // Récupérer les insights de l'ad set
              const adSetInsightsUrl = `https://graph.facebook.com/v18.0/${adSet.id}/insights?` +
                `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_result&` +
                `${dateForInsights}&` +
                `access_token=${accessToken}`;
              
              const adSetInsightsResponse = await fetch(adSetInsightsUrl);
              const adSetInsightsData = await adSetInsightsResponse.json();
              
              let adSetMetrics = {};
              if (adSetInsightsData.data && adSetInsightsData.data.length > 0) {
                const insights = adSetInsightsData.data[0];
                
                let leads = 0;
                if (insights.results) {
                  leads = parseInt(insights.results || 0);
                } else if (insights.actions) {
                  const leadActions = insights.actions.filter(a => 
                    a.action_type === 'lead' || 
                    a.action_type === 'leadgen_grouped' ||
                    a.action_type === 'offsite_conversion.fb_pixel_lead'
                  );
                  leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
                }
                
                adSetMetrics = {
                  spend: parseFloat(insights.spend || 0),
                  impressions: parseInt(insights.impressions || 0),
                  clicks: parseInt(insights.clicks || 0),
                  ctr: parseFloat(insights.ctr || 0),
                  cpc: parseFloat(insights.cpc || 0),
                  cpm: parseFloat(insights.cpm || 0),
                  reach: parseInt(insights.reach || 0),
                  leads: leads,
                  cost_per_result: parseFloat(insights.cost_per_result || 0)
                };
              }
              
              // Récupérer les ads
              const adsUrl = `https://graph.facebook.com/v18.0/${adSet.id}/ads?` +
                `fields=id,name,status,effective_status,creative&` +
                `limit=50&` +
                `access_token=${accessToken}`;
              
              const adsResponse = await fetch(adsUrl);
              const adsData = await adsResponse.json();
              
              const ads = await Promise.all(
                (adsData.data || []).map(async (ad) => {
                  // Récupérer les insights de l'ad
                  const adInsightsUrl = `https://graph.facebook.com/v18.0/${ad.id}/insights?` +
                    `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_result&` +
                    `${dateForInsights}&` +
                    `access_token=${accessToken}`;
                  
                  const adInsightsResponse = await fetch(adInsightsUrl);
                  const adInsightsData = await adInsightsResponse.json();
                  
                  let adMetrics = {};
                  if (adInsightsData.data && adInsightsData.data.length > 0) {
                    const insights = adInsightsData.data[0];
                    
                    let leads = 0;
                    if (insights.actions) {
                      const leadActions = insights.actions.filter(a => a.action_type === 'lead');
                      leads = leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
                    }
                    
                    adMetrics = {
                      spend: parseFloat(insights.spend || 0),
                      impressions: parseInt(insights.impressions || 0),
                      clicks: parseInt(insights.clicks || 0),
                      ctr: parseFloat(insights.ctr || 0),
                      cpc: parseFloat(insights.cpc || 0),
                      cpm: parseFloat(insights.cpm || 0),
                      reach: parseInt(insights.reach || 0),
                      leads: leads,
                      cost_per_result: parseFloat(insights.cost_per_result || 0)
                    };
                  }
                  
                  return {
                    ...ad,
                    insights: adMetrics
                  };
                })
              );
              
              return {
                ...adSet,
                insights: adSetMetrics,
                ads: ads
              };
            })
          );
          
          return {
            ...campaign,
            insights: campaignMetrics,
            adsets: adSets
          };
          
        } catch (error) {
          console.error(`[Hierarchy] Error fetching data for campaign ${campaign.id}:`, error);
          return {
            ...campaign,
            insights: {},
            adsets: []
          };
        }
      })
    );
    
    // Mettre en cache
    hierarchyCache.set(cacheKey, {
      campaigns: campaignsWithHierarchy,
      timestamp: Date.now()
    });
    
    // Désactivé : Le cache Firestore ne prend pas en compte les différentes périodes
    /*
    // Sauvegarder en Firestore si on a un userId
    try {
      const userId = session.userId;
      if (userId) {
        const docRef = db.collection('insights_cache').doc(`${userId}_${accountId}`);
        await docRef.set({
          userId,
          accountId,
          campaigns: campaignsWithHierarchy,
          lastSync: new Date(),
          nextSync: new Date(Date.now() + CACHE_DURATION)
        }, { merge: true });
      }
    } catch (error) {
      console.error('[Hierarchy] Error saving to Firestore:', error);
    }
    */
    
    return NextResponse.json({
      success: true,
      campaigns: campaignsWithHierarchy,
      fromCache: false,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[Hierarchy] Error fetching campaign hierarchy:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch campaign hierarchy',
      details: error.message,
      campaigns: []
    }, { status: 500 });
  }
}