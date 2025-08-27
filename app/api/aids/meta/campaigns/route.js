import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cache pour éviter les limites de rate
const campaignCache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 secondes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInsights = searchParams.get('include_insights') === 'true';
    const level = searchParams.get('level') || 'campaign'; // campaign, adset, ad
    const timeRange = searchParams.get('time_range') || 'last_30d'; // Accepter la période depuis le frontend
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Vérifier l'authentification Meta
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
    
    // Vérifier le cache
    const cacheKey = startDate && endDate 
      ? `${accountId}_${level}_${includeInsights}_${startDate}_${endDate}`
      : `${accountId}_${level}_${includeInsights}_${timeRange}`;
    const cached = campaignCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached campaigns data');
      return NextResponse.json(cached.data);
    }
    
    // Récupérer les campagnes depuis l'API Meta
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective,configured_status,effective_status,daily_budget,lifetime_budget,created_time,updated_time&` +
      `limit=50&` +
      `access_token=${accessToken}`;
    
    console.log('Fetching campaigns from Meta API');
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    if (campaignsData.error) {
      console.error('Meta API error:', campaignsData.error);
      return NextResponse.json({
        error: campaignsData.error.message,
        campaigns: []
      });
    }
    
    let campaigns = campaignsData.data || [];
    
    // Si demandé, récupérer les insights pour chaque campagne
    if (includeInsights && campaigns.length > 0) {
      const insightsPromises = campaigns.map(async (campaign) => {
        try {
          // Déterminer le paramètre de date à utiliser
          let dateParam = '';
          if (startDate && endDate) {
            console.log(`[Campaigns API] Using custom date range: ${startDate} to ${endDate}`);
            dateParam = `time_range={'since':'${startDate}','until':'${endDate}'}`;
          } else {
            // Mapper les time ranges pour Meta API
            const datePresetMap = {
              'today': 'today',
              'yesterday': 'yesterday',
              'last_7d': 'last_7d',
              'last_30d': 'last_30d',
              'last_90d': 'last_90d',
              'lifetime': 'last_90d'
            };
            const datePreset = datePresetMap[timeRange] || 'last_30d';
            dateParam = `date_preset=${datePreset}`;
          }
          
          // Récupérer les insights pour la période spécifiée
          const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?` +
            `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,action_values,conversions,cost_per_result&` +
            `${dateParam}&` +
            `access_token=${accessToken}`;
          
          const insightsResponse = await fetch(insightsUrl);
          const insightsData = await insightsResponse.json();
          
          if (insightsData.data && insightsData.data[0]) {
            const insights = insightsData.data[0];
            
            // Extraire les conversions
            let conversions = 0;
            let conversionValue = 0;
            if (insights.actions) {
              const conversionActions = insights.actions.filter(a => 
                ['lead', 'purchase', 'complete_registration'].includes(a.action_type)
              );
              conversions = conversionActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
            }
            
            if (insights.action_values) {
              const purchaseValues = insights.action_values.filter(a => 
                a.action_type === 'purchase'
              );
              conversionValue = purchaseValues.reduce((sum, a) => sum + parseFloat(a.value || 0), 0);
            }
            
            return {
              ...campaign,
              insights: {
                spend: parseFloat(insights.spend || 0),
                impressions: parseInt(insights.impressions || 0),
                clicks: parseInt(insights.clicks || 0),
                ctr: parseFloat(insights.ctr || 0),
                cpc: parseFloat(insights.cpc || 0),
                cpm: parseFloat(insights.cpm || 0),
                reach: parseInt(insights.reach || 0),
                frequency: parseFloat(insights.frequency || 0),
                conversions: conversions,
                conversionValue: conversionValue,
                cost_per_result: parseFloat(insights.cost_per_result || 0)
              }
            };
          }
          
          return {
            ...campaign,
            insights: null
          };
        } catch (error) {
          console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
          return {
            ...campaign,
            insights: null
          };
        }
      });
      
      campaigns = await Promise.all(insightsPromises);
    }
    
    // Si level = adset ou ad, récupérer les niveaux inférieurs
    if (level === 'adset' || level === 'ad') {
      const detailedCampaigns = [];
      
      for (const campaign of campaigns) {
        const campaignDetails = {
          ...campaign,
          adsets: []
        };
        
        // Récupérer les ad sets de la campagne
        try {
          const adsetsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/adsets?` +
            `fields=id,name,status,targeting,daily_budget,lifetime_budget,bid_amount&` +
            `limit=50&` +
            `access_token=${accessToken}`;
          
          const adsetsResponse = await fetch(adsetsUrl);
          const adsetsData = await adsetsResponse.json();
          
          if (adsetsData.data) {
            campaignDetails.adsets = adsetsData.data;
            
            // Si level = ad, récupérer aussi les ads
            if (level === 'ad') {
              for (const adset of campaignDetails.adsets) {
                try {
                  const adsUrl = `https://graph.facebook.com/v18.0/${adset.id}/ads?` +
                    `fields=id,name,status,creative,effective_status&` +
                    `limit=50&` +
                    `access_token=${accessToken}`;
                  
                  const adsResponse = await fetch(adsUrl);
                  const adsData = await adsResponse.json();
                  
                  adset.ads = adsData.data || [];
                } catch (error) {
                  console.error(`Error fetching ads for adset ${adset.id}:`, error);
                  adset.ads = [];
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching adsets for campaign ${campaign.id}:`, error);
        }
        
        detailedCampaigns.push(campaignDetails);
      }
      
      campaigns = detailedCampaigns;
    }
    
    const responseData = {
      success: true,
      campaigns: campaigns,
      timestamp: new Date().toISOString(),
      accountId: accountId,
      level: level
    };
    
    // Mettre en cache
    campaignCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({
      error: error.message,
      campaigns: []
    }, { status: 500 });
  }
}