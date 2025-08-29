import { NextResponse } from 'next/server';
import { getMetaAuth } from '@/lib/meta-auth-helper';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    // Get user authentication using the new helper
    const auth = await getMetaAuth();
    
    if (!auth.authenticated || !auth.userId) {
      console.log('[Dashboard Stats] Authentication failed:', auth);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const userId = auth.userId;
    
    console.log('=== DASHBOARD STATS FOR USER ===');
    console.log('User ID:', userId);
    
    // Get time range from query
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'last_30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
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
      case 'last_90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get user's organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
      }
    } catch (error) {
      console.log('Could not fetch user data, using userId as orgId');
    }
    
    // Initialize stats
    const stats = {
      totalProspects: 0,
      newProspects: 0,
      contactedProspects: 0,
      qualifiedProspects: 0,
      convertedProspects: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      conversionRate: 0,
      prospectsPerDay: [],
      revenuePerDay: [],
      prospectsPerStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0
      }
    };
    
    // Get all prospects
    const adAccountsSnapshot = await db
      .collection('organizations').doc(orgId)
      .collection('adAccounts')
      .get();
    
    console.log(`Found ${adAccountsSnapshot.size} ad accounts`);
    
    // Process each ad account
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const prospectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc(adAccountDoc.id)
        .collection('prospects')
        .get();
      
      console.log(`Processing ${prospectsSnapshot.size} prospects from ${adAccountDoc.id}`);
      
      prospectsSnapshot.forEach(doc => {
        const prospect = doc.data();
        const prospectDate = new Date(prospect.createdAt || prospect.date || prospect.createdTime);
        
        // Count total prospects
        stats.totalProspects++;
        
        // Count by status
        const status = prospect.status || 'new';
        stats.prospectsPerStatus[status] = (stats.prospectsPerStatus[status] || 0) + 1;
        
        // Count new prospects in time range
        if (prospectDate >= startDate && prospectDate <= now) {
          stats.newProspects++;
        }
        
        // Count special statuses
        if (status === 'contacted') stats.contactedProspects++;
        if (status === 'qualified') stats.qualifiedProspects++;
        if (status === 'converted') stats.convertedProspects++;
      });
    }
    
    // Get all revenues
    let revenuesSnapshot;
    try {
      revenuesSnapshot = await db.collection('aids_revenues').get();
      console.log(`Found ${revenuesSnapshot.size} revenues`);
      
      revenuesSnapshot.forEach(doc => {
        const revenue = doc.data();
        const revenueDate = new Date(revenue.date || revenue.createdAt);
        
        // Count revenues in time range
        if (revenueDate >= startDate && revenueDate <= now) {
          stats.totalRevenue += parseFloat(revenue.amount || 0);
        }
      });
    } catch (error) {
      console.log('Could not fetch revenues:', error.message);
    }
    
    // Calculate derived metrics
    if (stats.convertedProspects > 0) {
      stats.averageRevenue = stats.totalRevenue / stats.convertedProspects;
    }
    
    if (stats.totalProspects > 0) {
      stats.conversionRate = (stats.convertedProspects / stats.totalProspects) * 100;
    }
    
    // Generate daily data for charts (last 7 days)
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { prospects: 0, revenue: 0 };
    }
    
    // Count prospects by day
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const prospectsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc(adAccountDoc.id)
        .collection('prospects')
        .get();
      
      prospectsSnapshot.forEach(doc => {
        const prospect = doc.data();
        const prospectDate = new Date(prospect.createdAt || prospect.date || prospect.createdTime);
        const dateStr = prospectDate.toISOString().split('T')[0];
        
        if (dailyData[dateStr]) {
          dailyData[dateStr].prospects++;
        }
      });
    }
    
    // Count revenues by day
    if (revenuesSnapshot) {
      revenuesSnapshot.forEach(doc => {
        const revenue = doc.data();
        const revenueDate = new Date(revenue.date || revenue.createdAt);
        const dateStr = revenueDate.toISOString().split('T')[0];
        
        if (dailyData[dateStr]) {
          dailyData[dateStr].revenue += parseFloat(revenue.amount || 0);
        }
      });
    }
    
    // Convert daily data to arrays
    stats.prospectsPerDay = Object.entries(dailyData).map(([date, data]) => ({
      date,
      count: data.prospects
    }));
    
    stats.revenuePerDay = Object.entries(dailyData).map(([date, data]) => ({
      date,
      amount: data.revenue
    }));
    
    console.log('=== DASHBOARD STATS SUMMARY ===');
    console.log(`Total prospects: ${stats.totalProspects}`);
    console.log(`New prospects (${timeRange}): ${stats.newProspects}`);
    console.log(`Converted prospects: ${stats.convertedProspects}`);
    console.log(`Total revenue: ${stats.totalRevenue}€`);
    console.log(`Conversion rate: ${stats.conversionRate.toFixed(2)}%`);
    
    return NextResponse.json({
      success: true,
      stats,
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}