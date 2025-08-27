import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, admin } from '@/lib/firebase-admin';

// Cache pour stocker les données synchronisées
const syncCache = new Map();
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Stocker les timestamps de synchronisation
let lastSyncTime = null;
let nextSyncTime = null;
let syncInProgress = false;

// Fonction pour récupérer les insights depuis Meta
async function fetchMetaInsights(accountId, accessToken, timeRange = 'last_90d') {
  try {
    const datePresetMap = {
      'today': 'today',
      'yesterday': 'yesterday', 
      'last_7d': 'last_7d',
      'last_30d': 'last_30d',
      'last_90d': 'last_90d'
    };
    
    const datePreset = datePresetMap[timeRange] || 'last_90d';
    
    // Récupérer les insights avec time_increment=1 pour avoir les données journalières
    const insightsUrl = `https://graph.facebook.com/v18.0/${accountId}/insights?` +
      `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,action_values,conversions,cost_per_result&` +
      `date_preset=${datePreset}&` +
      `time_increment=1&` +
      `access_token=${accessToken}`;
    
    const response = await fetch(insightsUrl);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.data || [];
  } catch (error) {
    console.error('[Sync] Error fetching Meta insights:', error);
    throw error;
  }
}

// Fonction pour récupérer les campagnes avec leurs ad sets et ads
async function fetchCampaignHierarchy(accountId, accessToken) {
  try {
    // Récupérer toutes les campagnes
    const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective,daily_budget,lifetime_budget&` +
      `limit=50&` +
      `access_token=${accessToken}`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    if (campaignsData.error) {
      throw new Error(campaignsData.error.message);
    }
    
    const campaigns = campaignsData.data || [];
    
    // Pour chaque campagne, récupérer les ad sets et ads
    for (const campaign of campaigns) {
      // Récupérer les ad sets
      const adSetsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/adsets?` +
        `fields=id,name,status,daily_budget,lifetime_budget,targeting&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      const adSetsResponse = await fetch(adSetsUrl);
      const adSetsData = await adSetsResponse.json();
      campaign.adsets = adSetsData.data || [];
      
      // Pour chaque ad set, récupérer les ads
      for (const adSet of campaign.adsets) {
        const adsUrl = `https://graph.facebook.com/v18.0/${adSet.id}/ads?` +
          `fields=id,name,status,creative&` +
          `limit=50&` +
          `access_token=${accessToken}`;
        
        const adsResponse = await fetch(adsUrl);
        const adsData = await adsResponse.json();
        adSet.ads = adsData.data || [];
        
        // Récupérer les insights pour l'ad set
        const adSetInsightsUrl = `https://graph.facebook.com/v18.0/${adSet.id}/insights?` +
          `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_result&` +
          `date_preset=last_90d&` +
          `access_token=${accessToken}`;
        
        const adSetInsightsResponse = await fetch(adSetInsightsUrl);
        const adSetInsightsData = await adSetInsightsResponse.json();
        adSet.insights = adSetInsightsData.data?.[0] || {};
        
        // Récupérer les insights pour chaque ad
        for (const ad of adSet.ads) {
          const adInsightsUrl = `https://graph.facebook.com/v18.0/${ad.id}/insights?` +
            `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_result&` +
            `date_preset=last_90d&` +
            `access_token=${accessToken}`;
          
          const adInsightsResponse = await fetch(adInsightsUrl);
          const adInsightsData = await adInsightsResponse.json();
          ad.insights = adInsightsData.data?.[0] || {};
        }
      }
      
      // Récupérer les insights pour la campagne
      const campaignInsightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?` +
        `fields=spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_result&` +
        `date_preset=last_90d&` +
        `access_token=${accessToken}`;
      
      const campaignInsightsResponse = await fetch(campaignInsightsUrl);
      const campaignInsightsData = await campaignInsightsResponse.json();
      campaign.insights = campaignInsightsData.data?.[0] || {};
    }
    
    return campaigns;
  } catch (error) {
    console.error('[Sync] Error fetching campaign hierarchy:', error);
    throw error;
  }
}

// Fonction pour sauvegarder les données synchronisées
async function saveToFirestore(userId, accountId, data) {
  try {
    const docRef = db.collection('insights_cache').doc(`${userId}_${accountId}`);
    
    await docRef.set({
      userId,
      accountId,
      insights: data.insights,
      campaigns: data.campaigns,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + SYNC_INTERVAL)
    });
    
    console.log('[Sync] Data saved to Firestore');
  } catch (error) {
    console.error('[Sync] Error saving to Firestore:', error);
  }
}

// Fonction principale de synchronisation
async function performSync(accountId, accessToken, userId) {
  if (syncInProgress) {
    return { 
      success: false, 
      message: 'Synchronisation déjà en cours' 
    };
  }
  
  syncInProgress = true;
  
  try {
    console.log('[Sync] Starting synchronization for account:', accountId);
    
    // Récupérer les données depuis Meta
    const [insights, campaigns] = await Promise.all([
      fetchMetaInsights(accountId, accessToken),
      fetchCampaignHierarchy(accountId, accessToken)
    ]);
    
    const syncData = {
      insights,
      campaigns,
      timestamp: new Date().toISOString()
    };
    
    // Sauvegarder en cache mémoire
    syncCache.set(accountId, {
      data: syncData,
      timestamp: Date.now()
    });
    
    // Sauvegarder en Firestore
    if (userId) {
      await saveToFirestore(userId, accountId, syncData);
    }
    
    // Mettre à jour les timestamps
    lastSyncTime = new Date();
    nextSyncTime = new Date(Date.now() + SYNC_INTERVAL);
    
    console.log('[Sync] Synchronization completed successfully');
    
    return {
      success: true,
      message: 'Synchronisation réussie',
      lastSync: lastSyncTime.toISOString(),
      nextSync: nextSyncTime.toISOString(),
      dataCount: {
        insights: insights.length,
        campaigns: campaigns.length
      }
    };
    
  } catch (error) {
    console.error('[Sync] Synchronization failed:', error);
    return {
      success: false,
      message: 'Erreur lors de la synchronisation',
      error: error.message
    };
  } finally {
    syncInProgress = false;
  }
}

// GET endpoint pour récupérer le statut de synchronisation
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected'
      }, { status: 401 });
    }
    
    const accountId = selectedAccountCookie.value;
    
    // Récupérer les données depuis le cache ou Firestore
    const cached = syncCache.get(accountId);
    
    return NextResponse.json({
      success: true,
      lastSync: lastSyncTime?.toISOString() || null,
      nextSync: nextSyncTime?.toISOString() || null,
      syncInProgress,
      hasCachedData: !!cached
    });
    
  } catch (error) {
    console.error('[Sync] Error getting sync status:', error);
    return NextResponse.json({ 
      error: 'Failed to get sync status',
      details: error.message
    }, { status: 500 });
  }
}

// POST endpoint pour déclencher une synchronisation manuelle
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected'
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    // Récupérer le userId si possible
    let userId = session.userId;
    if (!userId && authCookie) {
      try {
        const decoded = await admin.auth().verifyIdToken(authCookie.value);
        userId = decoded.uid;
      } catch (error) {
        console.error('Error decoding auth token:', error);
      }
    }
    
    // Déclencher la synchronisation
    const result = await performSync(accountId, accessToken, userId);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Sync] Error triggering sync:', error);
    return NextResponse.json({ 
      error: 'Failed to trigger sync',
      details: error.message
    }, { status: 500 });
  }
}

// Fonction pour initialiser le cron job (à appeler depuis un service worker ou une API route dédiée)
export async function initCronSync() {
  setInterval(async () => {
    try {
      console.log('[Cron] Checking for accounts to sync...');
      
      // Récupérer tous les comptes actifs depuis Firestore
      const accountsSnapshot = await db.collection('active_accounts').get();
      
      for (const doc of accountsSnapshot.docs) {
        const accountData = doc.data();
        if (accountData.accountId && accountData.accessToken) {
          await performSync(
            accountData.accountId, 
            accountData.accessToken,
            accountData.userId
          );
        }
      }
      
    } catch (error) {
      console.error('[Cron] Error in scheduled sync:', error);
    }
  }, SYNC_INTERVAL);
}