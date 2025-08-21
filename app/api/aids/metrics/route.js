import { NextResponse } from 'next/server';
import { ConfigService } from '@/lib/aids/services/config';
import { MetricsService } from '@/lib/aids/services/metrics';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'daily';
    
    const config = new ConfigService();
    const metricsService = new MetricsService(config);
    
    // Map range to date range
    const dateRange = range === 'monthly' ? 'last_30_days' : 
                     range === 'weekly' ? 'last_7_days' : 
                     'yesterday';
    
    const metrics = await metricsService.ingest(dateRange);
    
    // Generate demo recent actions
    const recentActions = [
      {
        id: Date.now(),
        type: 'GENERATE_CREATIVE',
        status: 'success',
        message: `Octavia generated new creative for ${metrics.data?.[0]?.name || 'Campaign'}`,
        time: '2 min ago'
      },
      {
        id: Date.now() - 1000,
        type: 'BUDGET_REALLOCATE',
        status: 'success',
        message: 'Moved $150 to top performing ad set',
        time: '1 hour ago'
      },
      {
        id: Date.now() - 2000,
        type: 'PAUSE_UNDERPERFORMER',
        status: 'warning',
        message: 'Paused 3 ads with CTR < 1%',
        time: '3 hours ago'
      }
    ];
    
    return NextResponse.json({
      metrics: {
        overview: {
          totalSpend: metrics.aggregated?.totalSpend || 4567.89,
          totalRevenue: metrics.aggregated?.totalRevenue || 18271.56,
          roas: metrics.aggregated?.roas || 4.0,
          campaigns: metrics.campaigns || 8,
          activeAds: metrics.ads || 24,
          impressions: metrics.aggregated?.totalImpressions || 456789,
          clicks: metrics.aggregated?.totalClicks || 12345,
          ctr: metrics.aggregated?.avgCTR || 2.7,
          cpc: metrics.aggregated?.avgCPC || 0.37,
          conversions: metrics.aggregated?.totalConversions || 234,
          conversionRate: metrics.aggregated?.conversionRate || 1.9
        },
        trend: generateTrendData(range)
      },
      recentActions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to load metrics' },
      { status: 500 }
    );
  }
}

function generateTrendData(range) {
  const labels = range === 'monthly' 
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    : range === 'weekly'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({length: 24}, (_, i) => `${i}:00`);
  
  const dataPoints = labels.length;
  const baseSpend = range === 'monthly' ? 5000 : range === 'weekly' ? 700 : 50;
  const baseRevenue = baseSpend * 4;
  
  return {
    labels,
    spend: Array.from({length: dataPoints}, () => 
      baseSpend * (0.8 + Math.random() * 0.4)
    ),
    revenue: Array.from({length: dataPoints}, () => 
      baseRevenue * (0.7 + Math.random() * 0.6)
    ),
    ctr: Array.from({length: dataPoints}, () => 
      2 + Math.random() * 2
    )
  };
}