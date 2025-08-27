import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Route pour importer les données de production depuis Firebase
export async function GET(request) {
  try {
    console.log('[Import Prod Data] Fetching production data from Firebase...');
    
    // Check if Firebase is initialized
    if (!db.isInitialized()) {
      return NextResponse.json({
        error: 'Firebase not initialized'
      }, { status: 500 });
    }
    
    // Fetch all data from production Firebase
    const data = {
      prospects: [],
      revenues: [],
      insights_cache: [],
      campaigns: []
    };
    
    // 1. Get ALL prospects (no filter)
    try {
      console.log('[Import Prod Data] Querying ALL prospects...');
      const prospectsSnapshot = await db.collection('prospects').get();
      
      prospectsSnapshot.forEach(doc => {
        const docData = doc.data();
        console.log(`[Import Prod Data] Prospect ${doc.id} userId: ${docData.userId}`);
        data.prospects.push({
          id: doc.id,
          ...docData
        });
      });
      console.log(`[Import Prod Data] Found ${data.prospects.length} prospects total`);
    } catch (error) {
      console.error('[Import Prod Data] Error fetching prospects:', error);
    }
    
    // 2. Get ALL revenues (no filter)  
    try {
      console.log('[Import Prod Data] Querying ALL revenues...');
      const revenuesSnapshot = await db.collection('revenues').get();
      
      revenuesSnapshot.forEach(doc => {
        const docData = doc.data();
        console.log(`[Import Prod Data] Revenue ${doc.id} userId: ${docData.userId}`);
        data.revenues.push({
          id: doc.id,
          ...docData
        });
      });
      console.log(`[Import Prod Data] Found ${data.revenues.length} revenues total`);
    } catch (error) {
      console.error('[Import Prod Data] Error fetching revenues:', error);
    }
    
    // Also check aids_prospects collection (possible alternate name)
    try {
      console.log('[Import Prod Data] Checking aids_prospects collection...');
      const aidsProspectsSnapshot = await db.collection('aids_prospects').get();
      
      if (aidsProspectsSnapshot.size > 0) {
        console.log(`[Import Prod Data] Found ${aidsProspectsSnapshot.size} in aids_prospects collection`);
        aidsProspectsSnapshot.forEach(doc => {
          data.prospects.push({
            id: doc.id,
            ...doc.data(),
            source: 'aids_prospects'
          });
        });
      }
    } catch (error) {
      console.log('[Import Prod Data] aids_prospects collection does not exist or error:', error.message);
    }
    
    // 3. Get insights cache
    try {
      const insightsSnapshot = await db.collection('insights_cache').get();
      insightsSnapshot.forEach(doc => {
        const docData = doc.data();
        console.log(`[Import Prod Data] Insights cache ${doc.id}:`, {
          userId: docData.userId,
          lastSync: docData.lastSync,
          hasProspects: docData.prospects?.length > 0,
          hasCampaigns: docData.campaigns?.length > 0
        });
        data.insights_cache.push({
          id: doc.id,
          ...docData
        });
      });
      console.log(`[Import Prod Data] Found ${data.insights_cache.length} insights cache entries`);
    } catch (error) {
      console.error('[Import Prod Data] Error fetching insights cache:', error);
    }
    
    // Extract prospects from insights cache if available
    if (data.insights_cache.length > 0 && data.prospects.length === 0) {
      data.insights_cache.forEach(cache => {
        if (cache.prospects && Array.isArray(cache.prospects)) {
          console.log(`[Import Prod Data] Found ${cache.prospects.length} prospects in cache ${cache.id}`);
          data.prospects.push(...cache.prospects);
        }
      });
    }
    
    // Calculate totals
    const totalRevenue = data.revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalProspects = data.prospects.length;
    
    // Group revenues by date for chart
    const revenuesByDate = {};
    data.revenues.forEach(r => {
      if (r.createdAt) {
        const date = new Date(r.createdAt).toISOString().split('T')[0];
        if (!revenuesByDate[date]) {
          revenuesByDate[date] = 0;
        }
        revenuesByDate[date] += r.amount || 0;
      }
    });
    
    return NextResponse.json({
      success: true,
      summary: {
        totalProspects,
        totalRevenues: data.revenues.length,
        totalRevenueAmount: totalRevenue.toFixed(2),
        hasInsightsCache: data.insights_cache.length > 0
      },
      data,
      chartData: {
        revenuesByDate: Object.entries(revenuesByDate).map(([date, amount]) => ({
          date,
          amount
        })).sort((a, b) => new Date(a.date) - new Date(b.date))
      },
      message: 'Production data fetched from Firebase'
    });
    
  } catch (error) {
    console.error('[Import Prod Data] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch production data',
      details: error.message 
    }, { status: 500 });
  }
}