/**
 * Service de métriques pour AIDs
 * Ingère et agrège les données de performance
 */

export class MetricsService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * Ingère les métriques depuis Meta ou génère des données demo
   */
  async ingest(dateRange = 'last_7_days') {
    if (this.config.isLiveMode()) {
      return await this.ingestFromMeta(dateRange);
    } else {
      return this.generateDemoMetrics(dateRange);
    }
  }

  /**
   * Ingestion réelle depuis Meta Marketing API
   */
  async ingestFromMeta(dateRange) {
    const { accessToken, adAccountId } = this.config.getMetaConfig();
    
    try {
      // Meta Marketing API call
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${adAccountId}/insights?` +
        `fields=campaign_name,adset_name,ad_name,spend,impressions,clicks,` +
        `ctr,cpc,cpm,conversions,conversion_rate,purchase_roas&` +
        `date_preset=${dateRange}&` +
        `access_token=${accessToken}`
      );
      
      const data = await response.json();
      return this.processMetaData(data);
    } catch (error) {
      console.error('Meta API Error:', error);
      // Fallback to demo data
      return this.generateDemoMetrics(dateRange);
    }
  }

  /**
   * Génère des métriques demo réalistes
   */
  generateDemoMetrics(dateRange) {
    const days = dateRange === 'last_7_days' ? 7 : 
                 dateRange === 'last_30_days' ? 30 : 1;
    
    const campaigns = [];
    const campaignNames = ['Summer Sale 2024', 'Product Launch', 'Brand Awareness', 'Retargeting'];
    
    for (let i = 0; i < campaignNames.length; i++) {
      const campaign = {
        id: `demo_campaign_${i}`,
        name: campaignNames[i],
        status: Math.random() > 0.2 ? 'ACTIVE' : 'PAUSED',
        adSets: []
      };

      // Generate 2-3 ad sets per campaign
      const adSetCount = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < adSetCount; j++) {
        const adSet = {
          id: `demo_adset_${i}_${j}`,
          name: `AdSet ${j + 1}`,
          status: 'ACTIVE',
          ads: [],
          metrics: this.generateMetricsData(days)
        };

        // Generate 2-4 ads per ad set
        const adCount = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < adCount; k++) {
          const ad = {
            id: `demo_ad_${i}_${j}_${k}`,
            name: `Creative ${k + 1}`,
            status: Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED',
            creativeId: `demo_creative_${i}_${j}_${k}`,
            metrics: this.generateMetricsData(days)
          };
          adSet.ads.push(ad);
        }
        
        campaign.adSets.push(adSet);
      }
      
      campaigns.push(campaign);
    }

    return {
      campaigns: campaigns.length,
      adSets: campaigns.reduce((acc, c) => acc + c.adSets.length, 0),
      ads: campaigns.reduce((acc, c) => 
        acc + c.adSets.reduce((acc2, as) => acc2 + as.ads.length, 0), 0
      ),
      data: campaigns,
      dateRange,
      aggregated: this.aggregateMetrics(campaigns)
    };
  }

  /**
   * Génère des données de métriques pour une période
   */
  generateMetricsData(days) {
    const metrics = [];
    const baseSpend = Math.random() * 500 + 100;
    const baseCTR = Math.random() * 2 + 1;
    
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      
      const spend = baseSpend * (0.8 + Math.random() * 0.4);
      const impressions = Math.floor(spend * (Math.random() * 5000 + 10000));
      const ctr = baseCTR * (0.7 + Math.random() * 0.6);
      const clicks = Math.floor((impressions * ctr) / 100);
      const cpc = spend / clicks;
      const conversions = Math.floor(clicks * (Math.random() * 0.05 + 0.01));
      const revenue = conversions * (Math.random() * 100 + 50);
      
      metrics.push({
        date: date.toISOString().split('T')[0],
        spend: Number(spend.toFixed(2)),
        impressions,
        clicks,
        ctr: Number(ctr.toFixed(2)),
        cpc: Number(cpc.toFixed(2)),
        cpm: Number((spend / impressions * 1000).toFixed(2)),
        conversions,
        conversionRate: Number((conversions / clicks * 100).toFixed(2)),
        revenue: Number(revenue.toFixed(2)),
        roas: Number((revenue / spend).toFixed(2))
      });
    }
    
    return metrics;
  }

  /**
   * Agrège les métriques
   */
  aggregateMetrics(campaigns) {
    const totals = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0
    };

    campaigns.forEach(campaign => {
      campaign.adSets.forEach(adSet => {
        adSet.metrics.forEach(day => {
          totals.spend += day.spend;
          totals.impressions += day.impressions;
          totals.clicks += day.clicks;
          totals.conversions += day.conversions;
          totals.revenue += day.revenue;
        });
      });
    });

    return {
      totalSpend: totals.spend,
      totalRevenue: totals.revenue,
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalConversions: totals.conversions,
      avgCTR: (totals.clicks / totals.impressions * 100),
      avgCPC: (totals.spend / totals.clicks),
      avgCPM: (totals.spend / totals.impressions * 1000),
      conversionRate: (totals.conversions / totals.clicks * 100),
      roas: (totals.revenue / totals.spend)
    };
  }

  /**
   * Récupère un résumé des métriques
   */
  async getSummary() {
    const metrics = await this.ingest('last_7_days');
    return metrics.aggregated;
  }

  /**
   * Process Meta API data
   */
  processMetaData(data) {
    // Transform Meta API response to our format
    // Implementation depends on actual Meta API response structure
    return this.generateDemoMetrics('last_7_days'); // Fallback for now
  }
}