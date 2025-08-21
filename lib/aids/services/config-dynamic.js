/**
 * Service de configuration dynamique pour AIDs
 * Gère les tokens utilisateurs et les modes DEMO/LIVE
 */

export class DynamicConfigService {
  constructor(userSession = null) {
    this.userSession = userSession;
    this.mode = this.detectMode();
    this.keys = this.loadKeys();
  }

  detectMode() {
    // Mode LIVE si l'utilisateur a connecté son compte Meta
    if (this.userSession?.accessToken && this.userSession?.selectedAccount) {
      return 'LIVE';
    }
    
    // Fallback sur les variables d'environnement pour les tests
    const hasEnvKeys = process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID;
    
    return hasEnvKeys ? 'LIVE' : 'DEMO';
  }

  loadKeys() {
    return {
      meta: {
        appId: process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '1994469434647099',
        // Utilise le token de l'utilisateur en priorité
        accessToken: this.userSession?.accessToken || process.env.META_ACCESS_TOKEN,
        // Utilise le compte sélectionné par l'utilisateur
        adAccountId: this.userSession?.selectedAccount || process.env.META_AD_ACCOUNT_ID
      },
      llm: {
        provider: process.env.LLM_PROVIDER || 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
      },
      imageGeneration: {
        provider: process.env.IMAGE_GEN_PROVIDER || 'openai',
        apiKey: process.env.OPENAI_API_KEY || process.env.IMAGE_GENERATION_API_KEY
      },
      storage: {
        provider: process.env.STORAGE_PROVIDER || 'demo',
        accessKey: process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.STORAGE_SECRET_KEY,
        bucket: process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET || 'aids-creatives',
        region: process.env.AWS_REGION || 'us-east-1'
      }
    };
  }

  isLiveMode() {
    return this.mode === 'LIVE';
  }

  isDemoMode() {
    return this.mode === 'DEMO';
  }

  hasUserConnection() {
    return !!(this.userSession?.accessToken && this.userSession?.selectedAccount);
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

  getUserInfo() {
    if (!this.userSession) return null;
    
    return {
      id: this.userSession.userID,
      name: this.userSession.userName,
      email: this.userSession.userEmail,
      connectedAt: this.userSession.timestamp
    };
  }

  // Pour l'UI
  getStatus() {
    return {
      mode: this.mode,
      isLive: this.isLiveMode(),
      hasUserConnection: this.hasUserConnection(),
      user: this.getUserInfo(),
      selectedAccount: this.userSession?.selectedAccount,
      services: {
        meta: !!this.keys.meta.accessToken,
        llm: !!this.keys.llm.apiKey,
        imageGeneration: !!this.keys.imageGeneration.apiKey,
        storage: !!this.keys.storage.accessKey || this.isDemoMode()
      }
    };
  }

  // Helper pour obtenir la config depuis les cookies dans les API routes
  static async fromRequest(request) {
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => c.split('=').map(decodeURIComponent))
      );
      
      if (cookies.meta_session) {
        const session = JSON.parse(cookies.meta_session);
        session.selectedAccount = cookies.selected_ad_account || null;
        return new DynamicConfigService(session);
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    }
    
    // Fallback to environment variables
    return new DynamicConfigService();
  }
}