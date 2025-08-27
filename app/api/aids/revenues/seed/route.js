import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

// Route pour créer des données de test de revenues
export async function POST(request) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    if (!authCookie && !metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    // Get userId from meta session
    let userId = 'test-user';
    if (metaSession) {
      const session = JSON.parse(metaSession.value);
      userId = session.userId || 'test-user';
    }
    
    console.log(`[Seed Revenues] Creating test revenues for user: ${userId}`);
    
    // Check if Firebase is initialized
    if (!db.isInitialized()) {
      console.log('[Seed Revenues] Firebase not initialized, creating in-memory data');
      
      // Return mock data structure
      return NextResponse.json({
        success: true,
        message: 'Mock revenues created (in-memory only)',
        revenues: [
          {
            id: 'mock-1',
            userId,
            amount: 150.50,
            createdAt: new Date('2025-08-01'),
            campaignId: 'campaign_1',
            campaignName: 'Lead Generation Summer',
            source: 'meta_ads'
          },
          {
            id: 'mock-2',
            userId,
            amount: 225.00,
            createdAt: new Date('2025-08-05'),
            campaignId: 'campaign_1',
            campaignName: 'Lead Generation Summer',
            source: 'meta_ads'
          },
          {
            id: 'mock-3',
            userId,
            amount: 175.75,
            createdAt: new Date('2025-08-10'),
            campaignId: 'campaign_2',
            campaignName: 'Back to School',
            source: 'meta_ads'
          },
          {
            id: 'mock-4',
            userId,
            amount: 320.00,
            createdAt: new Date('2025-08-15'),
            campaignId: 'campaign_1',
            campaignName: 'Lead Generation Summer',
            source: 'meta_ads'
          },
          {
            id: 'mock-5',
            userId,
            amount: 195.50,
            createdAt: new Date('2025-08-20'),
            campaignId: 'campaign_2',
            campaignName: 'Back to School',
            source: 'meta_ads'
          }
        ]
      });
    }
    
    // Create test revenues in Firestore
    const testRevenues = [
      {
        userId,
        amount: 150.50,
        createdAt: new Date('2025-08-01'),
        campaignId: 'campaign_1',
        campaignName: 'Lead Generation Summer',
        adId: 'ad_1',
        adName: 'Summer Special Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 225.00,
        createdAt: new Date('2025-08-05'),
        campaignId: 'campaign_1',
        campaignName: 'Lead Generation Summer',
        adId: 'ad_2',
        adName: 'Limited Offer Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 175.75,
        createdAt: new Date('2025-08-10'),
        campaignId: 'campaign_2',
        campaignName: 'Back to School',
        adId: 'ad_3',
        adName: 'School Prep Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 320.00,
        createdAt: new Date('2025-08-15'),
        campaignId: 'campaign_1',
        campaignName: 'Lead Generation Summer',
        adId: 'ad_1',
        adName: 'Summer Special Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 195.50,
        createdAt: new Date('2025-08-20'),
        campaignId: 'campaign_2',
        campaignName: 'Back to School',
        adId: 'ad_4',
        adName: 'Last Chance Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 280.00,
        createdAt: new Date('2025-08-22'),
        campaignId: 'campaign_1',
        campaignName: 'Lead Generation Summer',
        adId: 'ad_2',
        adName: 'Limited Offer Ad',
        source: 'meta_ads',
        currency: 'EUR'
      },
      {
        userId,
        amount: 410.00,
        createdAt: new Date('2025-08-25'),
        campaignId: 'campaign_3',
        campaignName: 'End of Summer Sale',
        adId: 'ad_5',
        adName: 'Final Sale Ad',
        source: 'meta_ads',
        currency: 'EUR'
      }
    ];
    
    // Try to add to Firestore
    const createdRevenues = [];
    
    for (const revenue of testRevenues) {
      try {
        const docRef = await db.collection('revenues').add(revenue);
        createdRevenues.push({
          ...revenue,
          id: docRef.id
        });
        console.log(`[Seed Revenues] Created revenue ${docRef.id}: €${revenue.amount}`);
      } catch (error) {
        console.error('[Seed Revenues] Error creating revenue:', error);
        // If Firestore fails, just add to the response
        createdRevenues.push({
          ...revenue,
          id: `mock-${Date.now()}-${Math.random()}`
        });
      }
    }
    
    // Calculate summary
    const total = createdRevenues.reduce((sum, r) => sum + r.amount, 0);
    const byCampaign = {};
    
    createdRevenues.forEach(r => {
      if (!byCampaign[r.campaignId]) {
        byCampaign[r.campaignId] = {
          name: r.campaignName,
          total: 0,
          count: 0
        };
      }
      byCampaign[r.campaignId].total += r.amount;
      byCampaign[r.campaignId].count++;
    });
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdRevenues.length} test revenues`,
      summary: {
        total: total.toFixed(2),
        count: createdRevenues.length,
        dateRange: {
          start: '2025-08-01',
          end: '2025-08-25'
        },
        byCampaign
      },
      revenues: createdRevenues
    });
    
  } catch (error) {
    console.error('[Seed Revenues] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed revenues',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check current revenues
export async function GET(request) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    if (!authCookie && !metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    // Get userId from meta session
    let userId = 'test-user';
    if (metaSession) {
      const session = JSON.parse(metaSession.value);
      userId = session.userId || 'test-user';
    }
    
    console.log(`[Seed Revenues] Checking revenues for user: ${userId}`);
    
    // Check if Firebase is initialized
    if (!db.isInitialized()) {
      return NextResponse.json({
        success: true,
        message: 'Firebase not initialized',
        revenues: [],
        total: 0
      });
    }
    
    // Query revenues
    const snapshot = await db.collection('revenues')
      .where('userId', '==', userId)
      .get();
    
    const revenues = [];
    snapshot.forEach(doc => {
      revenues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    return NextResponse.json({
      success: true,
      count: revenues.length,
      total: total.toFixed(2),
      revenues
    });
    
  } catch (error) {
    console.error('[Seed Revenues] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get revenues',
      details: error.message 
    }, { status: 500 });
  }
}