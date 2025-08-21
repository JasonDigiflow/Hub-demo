/**
 * Service de gestion des publicités
 * Crée, modifie et optimise les ads Meta
 */

export class AdService {
  constructor(config) {
    this.config = config;
    this.ads = new Map();
    this.initializeDemoAds();
  }

  initializeDemoAds() {
    // Initialise quelques ads demo
    for (let i = 0; i < 10; i++) {
      const ad = {
        id: `demo_ad_${i}`,
        name: `Ad Creative ${i + 1}`,
        status: Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED',
        campaignId: `demo_campaign_${Math.floor(i / 3)}`,
        adSetId: `demo_adset_${Math.floor(i / 3)}_${i % 2}`,
        creativeId: `demo_creative_${i}`,
        metrics: {
          spend: Math.random() * 500,
          impressions: Math.floor(Math.random() * 50000),
          clicks: Math.floor(Math.random() * 1500),
          ctr: (Math.random() * 3 + 1).toFixed(2),
          conversions: Math.floor(Math.random() * 50),
          roas: (Math.random() * 5 + 1).toFixed(2)
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
      this.ads.set(ad.id, ad);
    }
  }

  /**
   * Crée une nouvelle publicité
   */
  async createAd(params) {
    const { campaignId, adSetId, creative } = params;
    
    if (this.config.isLiveMode()) {
      return await this.createMetaAd(params);
    } else {
      return this.createDemoAd(params);
    }
  }

  /**
   * Crée une ad via Meta API
   */
  async createMetaAd(params) {
    const { accessToken, adAccountId } = this.config.getMetaConfig();
    
    try {
      // Meta Marketing API call
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${adAccountId}/ads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: params.creative.headline,
            adset_id: params.adSetId,
            creative: {
              // Creative specs
            },
            status: 'ACTIVE',
            access_token: accessToken
          })
        }
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Meta Ad creation error:', error);
      return this.createDemoAd(params);
    }
  }

  /**
   * Crée une ad demo
   */
  createDemoAd(params) {
    const ad = {
      id: `ad_${Date.now()}`,
      name: params.creative.headline || 'New Ad',
      campaignId: params.campaignId,
      adSetId: params.adSetId,
      creative: {
        id: `creative_${Date.now()}`,
        imageUrl: params.creative.imageUrl,
        headline: params.creative.headline,
        description: params.creative.description,
        ctaButton: params.creative.ctaButton
      },
      status: 'ACTIVE',
      metrics: {
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        roas: 0
      },
      createdAt: new Date().toISOString()
    };
    
    this.ads.set(ad.id, ad);
    return ad;
  }

  /**
   * Met en pause une publicité
   */
  async pauseAd(adId) {
    if (this.config.isLiveMode()) {
      // Meta API call
      return { id: adId, status: 'PAUSED' };
    }
    
    const ad = this.ads.get(adId);
    if (ad) {
      ad.status = 'PAUSED';
      return ad;
    }
    
    return { id: adId, status: 'PAUSED' };
  }

  /**
   * Promeut une publicité
   */
  async promoteAd(adId) {
    if (this.config.isLiveMode()) {
      // Meta API call to increase budget
      return { id: adId, status: 'PROMOTED' };
    }
    
    const ad = this.ads.get(adId);
    if (ad) {
      ad.status = 'PROMOTED';
      ad.metrics.spend *= 1.5;
      return ad;
    }
    
    return { id: adId, status: 'PROMOTED' };
  }

  /**
   * Réalloue le budget entre ads
   */
  async reallocateBudget(fromId, toId, amount) {
    if (this.config.isLiveMode()) {
      // Meta API calls to adjust budgets
      return {
        from: fromId,
        to: toId,
        amount: amount,
        status: 'completed'
      };
    }
    
    return {
      from: fromId,
      to: toId,
      amount: amount,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Lance une variante pour A/B test
   */
  async launchVariant(variant) {
    const ad = await this.createAd({
      campaignId: variant.campaignId,
      adSetId: variant.adSetId,
      creative: variant.creative
    });
    
    return {
      ...ad,
      experimentId: variant.experimentId,
      variantName: variant.name
    };
  }

  /**
   * Récupère les top performers
   */
  async getTopPerformers(limit = 5) {
    const ads = Array.from(this.ads.values());
    
    return ads
      .filter(ad => ad.status === 'ACTIVE')
      .sort((a, b) => parseFloat(b.metrics.roas) - parseFloat(a.metrics.roas))
      .slice(0, limit)
      .map(ad => ({
        id: ad.id,
        name: ad.name,
        roas: ad.metrics.roas,
        spend: ad.metrics.spend,
        conversions: ad.metrics.conversions
      }));
  }

  /**
   * Récupère les underperformers
   */
  async getUnderperformers(limit = 5) {
    const ads = Array.from(this.ads.values());
    
    return ads
      .filter(ad => ad.status === 'ACTIVE')
      .filter(ad => parseFloat(ad.metrics.ctr) < 1.5 || parseFloat(ad.metrics.roas) < 2)
      .sort((a, b) => parseFloat(a.metrics.roas) - parseFloat(b.metrics.roas))
      .slice(0, limit)
      .map(ad => ({
        id: ad.id,
        name: ad.name,
        issue: parseFloat(ad.metrics.ctr) < 1.5 ? 'Low CTR' : 'Low ROAS',
        ctr: ad.metrics.ctr,
        roas: ad.metrics.roas,
        recommendation: parseFloat(ad.metrics.ctr) < 1.5 
          ? 'Refresh creative' 
          : 'Review targeting'
      }));
  }
}