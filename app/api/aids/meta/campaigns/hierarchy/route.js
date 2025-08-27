import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

// Cache pour la hiérarchie
const hierarchyCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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
    
    // Vérifier le cache mémoire
    const cacheKey = startDate && endDate 
      ? `${accountId}_${startDate}_${endDate}`
      : `${accountId}_${timeRange}`;
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
    
    // Si pas de cache valide, récupérer depuis Meta API
    console.log('[Hierarchy] Fetching from Meta API');
    
    // Déterminer le paramètre de date à utiliser
    let dateParam = '';
    if (startDate && endDate) {
      console.log(`[Hierarchy] Using custom date range: ${startDate} to ${endDate}`);
      dateParam = `time_range={'since':'${startDate}','until':'${endDate}'}`;
    } else {
      // Mapper les time ranges
      const datePresetMap = {
        'today': 'today',
        'yesterday': 'yesterday',
        'last_7d': 'last_7d',
        'last_30d': 'last_30d',
        'last_90d': 'last_90d',
        'lifetime': 'maximum'  // Use maximum for lifetime
      };
      const datePreset = datePresetMap[timeRange] || 'last_30d';
      console.log('[Hierarchy] Using date_preset:', datePreset);
      dateParam = `date_preset=${datePreset}`;
    }
    
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
            `${dateParam}&` +
            `access_token=${accessToken}`;
          
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
                `${dateParam}&` +
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
                    `${dateParam}&` +
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