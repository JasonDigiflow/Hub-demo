import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, admin } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'last_30d';
    
    // Get auth from cookies
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    if (!authCookie && !metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        revenues: []
      }, { status: 401 });
    }
    
    // Get userId from auth token or meta session
    let userId;
    if (authCookie) {
      try {
        const decoded = await admin.auth().verifyIdToken(authCookie.value);
        userId = decoded.uid;
      } catch (error) {
        console.error('Error verifying auth token:', error);
        // Try meta session as fallback
        if (metaSession) {
          const session = JSON.parse(metaSession.value);
          userId = session.userId;
        } else {
          return NextResponse.json({ 
            error: 'Invalid auth token',
            revenues: []
          }, { status: 401 });
        }
      }
    } else if (metaSession) {
      const session = JSON.parse(metaSession.value);
      userId = session.userId;
    }
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 1);
        now.setHours(23, 59, 59, 999);
        break;
      case 'last_7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last_30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'lifetime':
        startDate.setDate(startDate.getDate() - 90); // 90 days for "TOUT"
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    console.log(`[Revenues API] Fetching revenues for user ${userId} from ${startDate.toISOString()} to ${now.toISOString()}`);
    
    // Get revenues from Firestore
    const revenuesSnapshot = await db.collection('revenues')
      .where('userId', '==', userId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', now)
      .get();
    
    let totalRevenue = 0;
    let revenuesByDay = {};
    let revenuesByCampaign = {};
    let revenuesByAd = {};
    const revenues = [];
    
    revenuesSnapshot.forEach(doc => {
      const data = doc.data();
      const revenue = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      };
      
      revenues.push(revenue);
      
      // Calculate total
      totalRevenue += parseFloat(data.amount || 0);
      
      // Group by day
      const day = revenue.createdAt.toISOString().split('T')[0];
      if (!revenuesByDay[day]) {
        revenuesByDay[day] = 0;
      }
      revenuesByDay[day] += parseFloat(data.amount || 0);
      
      // Group by campaign (if we have campaign info from prospect)
      if (data.campaignId) {
        if (!revenuesByCampaign[data.campaignId]) {
          revenuesByCampaign[data.campaignId] = {
            amount: 0,
            count: 0,
            campaignName: data.campaignName || 'Unknown Campaign'
          };
        }
        revenuesByCampaign[data.campaignId].amount += parseFloat(data.amount || 0);
        revenuesByCampaign[data.campaignId].count++;
      }
      
      // Group by ad (if we have ad info)
      if (data.adId) {
        if (!revenuesByAd[data.adId]) {
          revenuesByAd[data.adId] = {
            amount: 0,
            count: 0,
            adName: data.adName || 'Unknown Ad'
          };
        }
        revenuesByAd[data.adId].amount += parseFloat(data.amount || 0);
        revenuesByAd[data.adId].count++;
      }
    });
    
    // Convert daily revenues to array for charting
    const dailyRevenues = Object.entries(revenuesByDay).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return NextResponse.json({
      success: true,
      revenues: {
        total: totalRevenue.toFixed(2),
        count: revenues.length,
        average: revenues.length > 0 ? (totalRevenue / revenues.length).toFixed(2) : '0',
        daily_data: dailyRevenues,
        by_campaign: revenuesByCampaign,
        by_ad: revenuesByAd,
        details: revenues.slice(0, 50) // Limit to 50 most recent
      },
      time_range: timeRange,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });
    
  } catch (error) {
    console.error('[Revenues API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch revenues',
      details: error.message
    }, { status: 500 });
  }
}