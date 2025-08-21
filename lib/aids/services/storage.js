/**
 * Service de stockage pour AIDs
 * Gère le stockage des créatifs et rapports
 */

export class StorageService {
  constructor(config) {
    this.config = config;
    this.storage = new Map();
    this.reports = new Map();
  }

  /**
   * Upload un créatif
   */
  async uploadCreative(image, metadata) {
    if (this.config.isLiveMode()) {
      return await this.uploadToCloud(image, metadata);
    } else {
      return this.uploadToDemo(image, metadata);
    }
  }

  /**
   * Upload vers le cloud (S3, etc.)
   */
  async uploadToCloud(image, metadata) {
    const { provider, bucket } = this.config.getStorageConfig();
    
    // Implementation would depend on the provider
    // For now, fallback to demo
    return this.uploadToDemo(image, metadata);
  }

  /**
   * Upload vers stockage demo
   */
  uploadToDemo(image, metadata) {
    const id = `creative_${Date.now()}`;
    const url = image.url || `https://picsum.photos/1080/1080?random=${Date.now()}`;
    
    const creative = {
      id,
      url,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        size: '245KB',
        dimensions: '1080x1080',
        format: 'jpg'
      }
    };
    
    this.storage.set(id, creative);
    
    return url;
  }

  /**
   * Sauvegarde un rapport
   */
  async saveReport(report) {
    const id = `report_${Date.now()}`;
    
    const savedReport = {
      id,
      ...report,
      savedAt: new Date().toISOString()
    };
    
    this.reports.set(id, savedReport);
    
    if (this.config.isLiveMode()) {
      // In production, would save to database
    }
    
    return savedReport;
  }

  /**
   * Récupère les créatifs
   */
  async getCreatives(filter = {}) {
    const creatives = Array.from(this.storage.values());
    
    if (filter.campaignId) {
      return creatives.filter(c => c.metadata?.campaignId === filter.campaignId);
    }
    
    if (filter.status) {
      return creatives.filter(c => c.metadata?.status === filter.status);
    }
    
    return creatives;
  }

  /**
   * Récupère les rapports
   */
  async getReports(period) {
    const reports = Array.from(this.reports.values());
    
    if (period) {
      const now = Date.now();
      const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 :
                      period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                      30 * 24 * 60 * 60 * 1000;
      
      return reports.filter(r => {
        const reportTime = new Date(r.timestamp).getTime();
        return now - reportTime <= periodMs;
      });
    }
    
    return reports;
  }

  /**
   * Nettoie les anciens fichiers
   */
  async cleanup(olderThanDays = 30) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clean creatives
    for (const [id, creative] of this.storage.entries()) {
      const createdTime = new Date(creative.metadata?.uploadedAt || 0).getTime();
      if (createdTime < cutoffTime) {
        this.storage.delete(id);
      }
    }
    
    // Clean reports
    for (const [id, report] of this.reports.entries()) {
      const reportTime = new Date(report.timestamp || 0).getTime();
      if (reportTime < cutoffTime) {
        this.reports.delete(id);
      }
    }
    
    return {
      creativesDeleted: this.storage.size,
      reportsDeleted: this.reports.size
    };
  }
}