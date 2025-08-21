/**
 * Service de configuration pour AIDs
 * Gère les modes DEMO/LIVE et les clés API
 */

export class ConfigService {
  constructor() {
    this.mode = this.detectMode();
    this.keys = this.loadKeys();
  }

  detectMode() {
    // Vérifie si toutes les clés nécessaires sont présentes pour le mode LIVE
    const requiredKeys = [
      'META_APP_ID',
      'META_ACCESS_TOKEN',
      'OPENAI_API_KEY', // ou ANTHROPIC_API_KEY
      'IMAGE_GENERATION_API_KEY',
      'STORAGE_ACCESS_KEY'
    ];

    const hasAllKeys = requiredKeys.every(key => 
      process.env[key] || process.env[`NEXT_PUBLIC_${key}`]
    );

    return hasAllKeys ? 'LIVE' : 'DEMO';
  }

  loadKeys() {
    return {
      meta: {
        appId: process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID,
        accessToken: process.env.META_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_ACCESS_TOKEN,
        adAccountId: process.env.META_AD_ACCOUNT_ID || process.env.NEXT_PUBLIC_META_AD_ACCOUNT_ID
      },
      llm: {
        provider: process.env.LLM_PROVIDER || 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
      },
      imageGeneration: {
        provider: process.env.IMAGE_GEN_PROVIDER || 'openai',
        apiKey: process.env.IMAGE_GENERATION_API_KEY || process.env.OPENAI_API_KEY
      },
      storage: {
        provider: process.env.STORAGE_PROVIDER || 'demo',
        accessKey: process.env.STORAGE_ACCESS_KEY,
        secretKey: process.env.STORAGE_SECRET_KEY,
        bucket: process.env.STORAGE_BUCKET || 'aids-creatives'
      }
    };
  }

  isLiveMode() {
    return this.mode === 'LIVE';
  }

  isDemoMode() {
    return this.mode === 'DEMO';
  }

  getMetaConfig() {
    return this.keys.meta;
  }

  getLLMConfig() {
    return this.keys.llm;
  }

  getImageConfig() {
    return this.keys.imageGeneration;
  }

  getStorageConfig() {
    return this.keys.storage;
  }

  // Pour l'UI
  getStatus() {
    return {
      mode: this.mode,
      isLive: this.isLiveMode(),
      services: {
        meta: !!this.keys.meta.accessToken,
        llm: !!this.keys.llm.apiKey,
        imageGeneration: !!this.keys.imageGeneration.apiKey,
        storage: !!this.keys.storage.accessKey || this.isDemoMode()
      }
    };
  }
}