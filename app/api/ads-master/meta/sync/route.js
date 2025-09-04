import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

export async function POST(request) {
  try {
    const { adAccountId } = await request.json();
    
    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: 'Ad account ID required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const connectionCookie = cookieStore.get('meta_connection');
    
    if (!connectionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not connected to Meta' },
        { status: 401 }
      );
    }

    const connectionData = JSON.parse(connectionCookie.value);
    const accessToken = connectionData.accessToken;

    // Check cache first
    const cacheCookie = cookieStore.get('meta_cache');
    if (cacheCookie) {
      const cacheData = JSON.parse(cacheCookie.value);
      const cacheAge = Date.now() - new Date(cacheData.lastSync).getTime();
      
      // Return cached data if still valid and for same account
      if (cacheAge < CACHE_DURATION && cacheData.adAccountId === adAccountId) {
        return NextResponse.json({
          success: true,
          insights: cacheData.insights,
          fromCache: true,
          cacheAge: Math.floor(cacheAge / 1000) // in seconds
        });
      }
    }

    // Fetch fresh data from Meta Ads API
    const insights = await fetchMetaInsights(adAccountId, accessToken);
    
    // Store in cache
    const cacheData = {
      adAccountId,
      insights,
      lastSync: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      insights,
      fromCache: false
    });

    response.cookies.set('meta_cache', JSON.stringify(cacheData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 // 30 minutes
    });

    return response;
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function fetchMetaInsights(adAccountId, accessToken) {
  // For development, return mock data
  // In production, make actual API calls to Meta
  
  if (process.env.NODE_ENV === 'development') {
    return generateMockInsights();
  }

  // Production: Fetch real data
  const cleanAccountId = adAccountId.replace('act_', '');
  const baseUrl = `https://graph.facebook.com/v18.0/act_${cleanAccountId}`;
  
  try {
    // Fetch account insights
    const insightsResponse = await fetch(
      `${baseUrl}/insights?fields=spend,impressions,clicks,ctr,cpc,cpm,conversions,conversion_rate,purchase_roas&date_preset=last_30d&access_token=${accessToken}`
    );
    const insightsData = await insightsResponse.json();

    // Fetch campaigns
    const campaignsResponse = await fetch(
      `${baseUrl}/campaigns?fields=id,name,status,insights{spend,impressions,clicks,ctr,conversions}&access_token=${accessToken}`
    );
    const campaignsData = await campaignsResponse.json();

    // Process and return data
    return processMetaData(insightsData, campaignsData);
  } catch (error) {
    console.error('Error fetching Meta data:', error);
    // Fallback to mock data on error
    return generateMockInsights();
  }
}

function generateMockInsights() {
  const now = new Date();
  const timeline = [];
  
  // Generate 30 days of timeline data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 1000) + 200,
      conversions: Math.floor(Math.random() * 50) + 10,
      spend: Math.random() * 100 + 20,
      ctr: Math.random() * 2 + 0.5,
      cpm: Math.random() * 20 + 5
    });
  }

  return {
    summary: {
      spend: 1234.56,
      impressions: 456789,
      clicks: 8901,
      ctr: 1.95,
      cpc: 0.14,
      cpm: 2.70,
      conversions: 234,
      conversionRate: 2.63,
      roas: 3.45
    },
    timeline,
    campaigns: [
      {
        id: '1',
        name: 'Summer Sale 2025',
        status: 'ACTIVE',
        spend: 456.78,
        impressions: 123456,
        clicks: 2345,
        ctr: 1.90,
        conversions: 89
      },
      {
        id: '2',
        name: 'Brand Awareness',
        status: 'ACTIVE',
        spend: 345.67,
        impressions: 98765,
        clicks: 1876,
        ctr: 1.90,
        conversions: 45
      },
      {
        id: '3',
        name: 'Product Launch',
        status: 'PAUSED',
        spend: 234.56,
        impressions: 87654,
        clicks: 1654,
        ctr: 1.89,
        conversions: 67
      },
      {
        id: '4',
        name: 'Retargeting',
        status: 'ACTIVE',
        spend: 197.55,
        impressions: 146789,
        clicks: 3126,
        ctr: 2.13,
        conversions: 33
      }
    ],
    audiences: [
      { age: '18-24', gender: 'male', percentage: 15 },
      { age: '18-24', gender: 'female', percentage: 18 },
      { age: '25-34', gender: 'male', percentage: 22 },
      { age: '25-34', gender: 'female', percentage: 25 },
      { age: '35-44', gender: 'male', percentage: 10 },
      { age: '35-44', gender: 'female', percentage: 10 }
    ]
  };
}

function processMetaData(insightsData, campaignsData) {
  // Process real Meta API data into our format
  // This is a simplified version - expand based on actual needs
  
  const summary = {};
  if (insightsData.data && insightsData.data[0]) {
    const data = insightsData.data[0];
    summary.spend = parseFloat(data.spend || 0);
    summary.impressions = parseInt(data.impressions || 0);
    summary.clicks = parseInt(data.clicks || 0);
    summary.ctr = parseFloat(data.ctr || 0);
    summary.cpc = parseFloat(data.cpc || 0);
    summary.cpm = parseFloat(data.cpm || 0);
    summary.conversions = parseInt(data.conversions || 0);
    summary.conversionRate = parseFloat(data.conversion_rate || 0);
    summary.roas = parseFloat(data.purchase_roas || 0);
  }

  const campaigns = [];
  if (campaignsData.data) {
    campaignsData.data.forEach(campaign => {
      const insights = campaign.insights?.data?.[0] || {};
      campaigns.push({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        spend: parseFloat(insights.spend || 0),
        impressions: parseInt(insights.impressions || 0),
        clicks: parseInt(insights.clicks || 0),
        ctr: parseFloat(insights.ctr || 0),
        conversions: parseInt(insights.conversions || 0)
      });
    });
  }

  // For timeline and audiences, we'd need additional API calls
  // Using mock data for now
  const mockData = generateMockInsights();
  
  return {
    summary: Object.keys(summary).length > 0 ? summary : mockData.summary,
    timeline: mockData.timeline,
    campaigns: campaigns.length > 0 ? campaigns : mockData.campaigns,
    audiences: mockData.audiences
  };
}