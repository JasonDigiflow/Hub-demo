# DigiFlow Hub - Next Steps Complet & Actionnable (29/08/2024)

## 🚨 PRIORITÉS IMMÉDIATES (À FAIRE CETTE SEMAINE)

### 1. Obtenir l'Approbation Meta Business (CRITIQUE)
```bash
# URL Dashboard Meta
https://developers.facebook.com/apps/{APP_ID}/app-review/permissions

# Permissions à demander
- ads_read
- ads_management 
- leads_retrieval
- pages_read_engagement
- pages_manage_ads
```

**Actions concrètes :**
1. Aller sur Meta App Dashboard
2. Cliquer sur "App Review" → "Permissions and Features"
3. Pour chaque permission, cliquer "Request"
4. Remplir le formulaire avec :
   - Use case détaillé
   - Screencast vidéo (utiliser Loom)
   - Test user credentials
5. Soumettre pour review

**Texte à utiliser pour la description :**
```
DigiFlow AIDs is a comprehensive Meta Ads management platform that helps businesses optimize their advertising campaigns. We need these permissions to:
- ads_read: Display campaign performance metrics
- ads_management: Create and optimize campaigns
- leads_retrieval: Import and manage leads from Lead Forms
- pages_read_engagement: Analyze page engagement
- pages_manage_ads: Manage ads through pages
```

### 2. Implémenter les Webhooks Meta (URGENT)
```javascript
// Créer le fichier : /app/api/aids/meta/webhook/route.js

import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';

// Vérifier la signature Meta
function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(payload)
    .digest('hex');
  return `sha256=${expectedSignature}` === signature;
}

export async function GET(request) {
  // Webhook verification
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_TOKEN) {
    return new Response(challenge);
  }
  
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request) {
  const signature = request.headers.get('x-hub-signature-256');
  const body = await request.text();
  
  if (!verifySignature(body, signature)) {
    return new Response('Invalid signature', { status: 403 });
  }
  
  const data = JSON.parse(body);
  
  // Process lead in background
  for (const entry of data.entry) {
    for (const change of entry.changes) {
      if (change.field === 'leadgen') {
        const leadId = change.value.leadgen_id;
        const formId = change.value.form_id;
        
        // Queue for processing
        await db.collection('webhook_queue').add({
          type: 'lead',
          leadId,
          formId,
          timestamp: new Date(),
          processed: false
        });
      }
    }
  }
  
  return new Response('OK');
}
```

### 3. Fix Token Refresh Automatique
```javascript
// Créer : /lib/token-manager.js

class TokenManager {
  constructor() {
    this.checkInterval = 60 * 60 * 1000; // Check every hour
  }
  
  async checkAndRefreshToken(session) {
    const tokenAge = Date.now() - session.timestamp;
    const maxAge = 60 * 60 * 24 * 1000; // 24 hours
    
    if (tokenAge > maxAge * 0.8) { // Refresh at 80% of lifetime
      return await this.refreshToken(session);
    }
    
    return session;
  }
  
  async refreshToken(session) {
    // Exchange for long-lived token
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&` +
      `fb_exchange_token=${session.accessToken}`
    );
    
    const data = await response.json();
    
    if (data.access_token) {
      return {
        ...session,
        accessToken: data.access_token,
        timestamp: Date.now(),
        expiresIn: data.expires_in
      };
    }
    
    throw new Error('Failed to refresh token');
  }
}

export default new TokenManager();
```

## 📋 PHASE 1 : FONDATIONS (SEPTEMBRE 2024)

### Semaine 1 (2-8 Sept) : Meta Approval & Security

#### Lundi-Mardi : Documentation Meta
- [ ] Créer Privacy Policy complète
  ```markdown
  # Privacy Policy Template
  1. Information We Collect
  2. How We Use Information
  3. Data Sharing
  4. Data Security
  5. User Rights (GDPR)
  6. Contact Information
  ```
- [ ] Créer Terms of Service
- [ ] Préparer screencast de 3-5 minutes
- [ ] Soumettre pour App Review

#### Mercredi-Jeudi : Sécurité
- [ ] Implémenter 2FA avec Firebase Auth
  ```javascript
  // Enable MFA in Firebase Console
  // Then implement in app:
  import { multiFactor } from 'firebase/auth';
  
  async function enrollMFA(user) {
    const multiFactorSession = await multiFactor(user).getSession();
    // Generate and verify phone number
  }
  ```

- [ ] Ajouter rate limiting robuste
  ```javascript
  // Install: npm install express-rate-limit
  import rateLimit from 'express-rate-limit';
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    message: 'Too many requests'
  });
  ```

#### Vendredi : Monitoring
- [ ] Setup Sentry
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Configurer les alertes
- [ ] Ajouter custom metrics

### Semaine 2 (9-15 Sept) : Optimisation Performance

#### Cache Intelligent
```javascript
// Créer : /lib/cache-manager.js
class CacheManager {
  constructor() {
    this.memory = new Map();
    this.ttl = {
      insights: 30 * 60 * 1000,    // 30 min
      campaigns: 60 * 60 * 1000,   // 1 hour
      leads: 5 * 60 * 1000         // 5 min
    };
  }
  
  getCacheKey(type, accountId, period, params = {}) {
    return `${type}_${accountId}_${period}_${JSON.stringify(params)}`;
  }
  
  async get(key) {
    const cached = this.memory.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }
  
  set(key, data, type) {
    this.memory.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.ttl[type] || 30 * 60 * 1000
    });
  }
  
  invalidate(pattern) {
    for (const key of this.memory.keys()) {
      if (key.includes(pattern)) {
        this.memory.delete(key);
      }
    }
  }
}
```

#### Queue System
```javascript
// Install: npm install bull
import Bull from 'bull';
import Redis from 'ioredis';

const metaQueue = new Bull('meta-api', {
  redis: process.env.REDIS_URL
});

// Producer
await metaQueue.add('fetch-insights', {
  accountId: 'act_123',
  period: 'last_30d'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Consumer
metaQueue.process('fetch-insights', async (job) => {
  const { accountId, period } = job.data;
  // Fetch from Meta API
  return await fetchMetaInsights(accountId, period);
});
```

### Semaine 3 (16-22 Sept) : Modèle SaaS

#### Intégration Stripe
```bash
# Installation
npm install stripe @stripe/stripe-js
```

```javascript
// /app/api/billing/create-checkout/route.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { priceId, userId } = await request.json();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/app/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/app/billing`,
    metadata: {
      userId
    }
  });
  
  return NextResponse.json({ sessionId: session.id });
}
```

#### Plans & Pricing
```javascript
// /lib/pricing.js
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 99,
    priceId: 'price_xxx',
    features: [
      '1 compte publicitaire',
      '1000 leads/mois',
      'Dashboard basique',
      'Export CSV'
    ],
    limits: {
      adAccounts: 1,
      leads: 1000,
      users: 1
    }
  },
  pro: {
    name: 'Pro',
    price: 299,
    priceId: 'price_yyy',
    features: [
      '5 comptes publicitaires',
      '10000 leads/mois',
      'Analytics avancés',
      'API access',
      'Support prioritaire'
    ],
    limits: {
      adAccounts: 5,
      leads: 10000,
      users: 5
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    priceId: 'price_zzz',
    features: [
      'Comptes illimités',
      'Leads illimités',
      'White label',
      'SLA 99.9%',
      'Account manager'
    ],
    limits: {
      adAccounts: -1,
      leads: -1,
      users: -1
    }
  }
};
```

### Semaine 4 (23-29 Sept) : Tests & Validation

#### Tests E2E avec Playwright
```bash
npm install -D @playwright/test
```

```javascript
// tests/aids-workflow.spec.js
import { test, expect } from '@playwright/test';

test.describe('AIDs Complete Workflow', () => {
  test('Connect Meta and import leads', async ({ page }) => {
    await page.goto('/app/aids');
    
    // Connect Meta
    await page.click('text=Connect with Meta');
    // ... OAuth flow
    
    // Select account
    await page.selectOption('#ad-account', 'act_123456');
    
    // Import leads
    await page.click('text=Import Leads');
    await expect(page.locator('.lead-count')).toContainText('25 leads');
    
    // Add revenue
    await page.click('text=Add Revenue');
    await page.fill('#amount', '1000');
    await page.click('text=Save');
    
    // Check ROAS
    await expect(page.locator('.roas')).toContainText('5.2x');
  });
});
```

## 📋 PHASE 2 : BUSINESS MODELS (OCTOBRE 2024)

### E-commerce Integration Blueprint

#### Shopify App Creation
```javascript
// 1. Create Shopify App
// https://partners.shopify.com

// 2. Install packages
npm install @shopify/shopify-api @shopify/app-bridge-react

// 3. OAuth flow
import { Shopify } from '@shopify/shopify-api';

const shopify = new Shopify.Context({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET: process.env.SHOPIFY_API_SECRET,
  SCOPES: ['read_products', 'read_orders', 'read_customers'],
  HOST_NAME: process.env.HOST
});

// 4. Webhook registration
const webhook = {
  topic: 'ORDERS_CREATE',
  address: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/shopify/order`,
  format: 'JSON'
};

// 5. Data sync
export async function syncShopifyOrders(shop, accessToken) {
  const orders = await fetch(`https://${shop}/admin/api/2024-01/orders.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken
    }
  });
  
  // Process orders
  for (const order of orders.data) {
    await processOrder(order);
  }
}
```

#### WooCommerce Integration
```javascript
// Install: npm install @woocommerce/woocommerce-rest-api

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const WooCommerce = new WooCommerceRestApi({
  url: 'https://example.com',
  consumerKey: process.env.WOO_CONSUMER_KEY,
  consumerSecret: process.env.WOO_CONSUMER_SECRET,
  version: 'wc/v3'
});

// Get orders
const orders = await WooCommerce.get('orders', {
  per_page: 100,
  status: 'completed'
});

// Match with leads
for (const order of orders.data) {
  const lead = await findLeadByEmail(order.billing.email);
  if (lead) {
    await linkOrderToLead(order, lead);
  }
}
```

### SaaS Metrics Implementation

#### MRR Calculation
```javascript
// /lib/metrics/mrr.js
export class MRRCalculator {
  async calculate(date = new Date()) {
    const subscriptions = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .where('startDate', '<=', date)
      .get();
    
    let mrr = 0;
    let arr = 0;
    let customers = new Set();
    
    subscriptions.forEach(doc => {
      const sub = doc.data();
      const monthly = this.getMonthlyValue(sub);
      mrr += monthly;
      customers.add(sub.customerId);
    });
    
    arr = mrr * 12;
    
    // Calculate growth
    const lastMonth = new Date(date);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMRR = await this.calculate(lastMonth);
    
    const growth = mrr - lastMRR.mrr;
    const growthRate = (growth / lastMRR.mrr) * 100;
    
    // Churn calculation
    const churnedCustomers = await this.getChurnedCustomers(date);
    const churnRate = (churnedCustomers.length / customers.size) * 100;
    
    return {
      mrr,
      arr,
      customers: customers.size,
      growth,
      growthRate,
      churnRate,
      ltv: mrr / (churnRate / 100) // Simple LTV
    };
  }
  
  getMonthlyValue(subscription) {
    switch(subscription.interval) {
      case 'month':
        return subscription.amount;
      case 'year':
        return subscription.amount / 12;
      case 'week':
        return subscription.amount * 4.33;
      default:
        return 0;
    }
  }
}
```

## 📋 PHASE 3 : IA INTEGRATION (NOVEMBRE 2024)

### Octavia AI - Architecture Complète

#### 1. Core AI Engine
```javascript
// /lib/ai/octavia.js
import { Anthropic } from '@anthropic/sdk';
import { OpenAI } from 'openai';

export class OctaviaAI {
  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.context = this.loadContext();
  }
  
  async analyzePerformance(accountData) {
    const prompt = `
    Analyze this Meta Ads account performance:
    ${JSON.stringify(accountData)}
    
    Provide:
    1. Performance summary
    2. Top 3 issues
    3. Optimization recommendations
    4. Budget reallocation suggestions
    5. Creative recommendations
    `;
    
    const response = await this.claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return this.parseResponse(response);
  }
  
  async generateAdCopy(product, audience, objective) {
    const prompt = `
    Generate Facebook ad copy:
    Product: ${product}
    Target Audience: ${audience}
    Objective: ${objective}
    
    Provide 3 variations with:
    - Headline (25 chars)
    - Primary text (125 chars)
    - Description (30 chars)
    - CTA button text
    `;
    
    return await this.claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  }
  
  async predictPerformance(campaignData) {
    // Use historical data to predict
    const similar = await this.findSimilarCampaigns(campaignData);
    
    // Simple prediction model
    const avgCTR = similar.reduce((acc, c) => acc + c.ctr, 0) / similar.length;
    const avgCPC = similar.reduce((acc, c) => acc + c.cpc, 0) / similar.length;
    const avgCVR = similar.reduce((acc, c) => acc + c.cvr, 0) / similar.length;
    
    return {
      predictedCTR: avgCTR * this.getSeasonalMultiplier(),
      predictedCPC: avgCPC * this.getCompetitionMultiplier(),
      predictedCVR: avgCVR * this.getAudienceMultiplier(campaignData),
      confidence: this.calculateConfidence(similar.length)
    };
  }
}
```

#### 2. Creative Generation
```javascript
// /lib/ai/creative-generator.js
export class CreativeGenerator {
  async generateImage(prompt, style = 'photorealistic') {
    // DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${style} ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "hd"
    });
    
    return response.data[0].url;
  }
  
  async generateVideo(script, assets) {
    // Use Replicate for video generation
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'stability-ai/stable-video-diffusion',
        input: {
          script,
          assets,
          duration: 15
        }
      })
    });
    
    return response.json();
  }
  
  async generateVariations(original) {
    // Generate A/B test variations
    const variations = [];
    
    // Color variations
    variations.push(await this.adjustColors(original));
    
    // Text variations
    variations.push(await this.adjustText(original));
    
    // Layout variations
    variations.push(await this.adjustLayout(original));
    
    return variations;
  }
}
```

### Automation Workflows

#### Campaign Automation
```javascript
// /lib/automation/campaign-automator.js
export class CampaignAutomator {
  constructor() {
    this.rules = this.loadRules();
    this.checkInterval = 60 * 60 * 1000; // 1 hour
  }
  
  async runAutomation() {
    const campaigns = await this.getActiveCampaigns();
    
    for (const campaign of campaigns) {
      const metrics = await this.getCampaignMetrics(campaign);
      const actions = this.evaluateRules(campaign, metrics);
      
      for (const action of actions) {
        await this.executeAction(action, campaign);
      }
    }
  }
  
  evaluateRules(campaign, metrics) {
    const actions = [];
    
    // Rule: Pause underperforming
    if (metrics.roas < 1 && metrics.spend > 100) {
      actions.push({
        type: 'pause',
        reason: 'ROAS below threshold'
      });
    }
    
    // Rule: Increase budget for winners
    if (metrics.roas > 3 && metrics.spend < campaign.dailyBudget * 0.8) {
      actions.push({
        type: 'increase_budget',
        amount: campaign.dailyBudget * 0.2,
        reason: 'High ROAS with budget headroom'
      });
    }
    
    // Rule: Refresh creative
    if (metrics.frequency > 3) {
      actions.push({
        type: 'refresh_creative',
        reason: 'Ad fatigue detected'
      });
    }
    
    return actions;
  }
  
  async executeAction(action, campaign) {
    switch(action.type) {
      case 'pause':
        await this.pauseCampaign(campaign.id);
        await this.notifyUser(campaign, action);
        break;
        
      case 'increase_budget':
        await this.updateBudget(campaign.id, action.amount);
        await this.logAction(campaign, action);
        break;
        
      case 'refresh_creative':
        await this.generateNewCreative(campaign);
        await this.createAdVariation(campaign);
        break;
    }
  }
}
```

## 📋 PHASE 4 : MULTI-CHANNEL (DÉCEMBRE 2024)

### Google Ads Integration

#### Setup & Authentication
```javascript
// Install: npm install google-ads-api

import { GoogleAdsApi } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_DEVELOPER_TOKEN
});

const customer = client.Customer({
  customer_id: '123-456-7890',
  refresh_token: refreshToken
});

// Get campaigns
const campaigns = await customer.query(`
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions
  FROM campaign
  WHERE segments.date DURING LAST_30_DAYS
`);
```

### TikTok Ads Integration
```javascript
// TikTok Business API
const TikTokAds = {
  async authenticate(authCode) {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.TIKTOK_APP_ID,
        secret: process.env.TIKTOK_SECRET,
        auth_code: authCode
      })
    });
    
    return response.json();
  },
  
  async getCampaigns(accessToken, advertiserId) {
    const response = await fetch(`https://business-api.tiktok.com/open_api/v1.3/campaign/get/`, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      params: {
        advertiser_id: advertiserId
      }
    });
    
    return response.json();
  }
};
```

### Unified Dashboard
```javascript
// /app/app/dashboard/unified/page.js
export default function UnifiedDashboard() {
  const [channels, setChannels] = useState([]);
  
  useEffect(() => {
    loadAllChannels();
  }, []);
  
  async function loadAllChannels() {
    const [meta, google, tiktok] = await Promise.all([
      fetch('/api/aids/meta/insights'),
      fetch('/api/google-ads/insights'),
      fetch('/api/tiktok-ads/insights')
    ]);
    
    setChannels([
      { name: 'Meta', data: await meta.json() },
      { name: 'Google', data: await google.json() },
      { name: 'TikTok', data: await tiktok.json() }
    ]);
  }
  
  const totalSpend = channels.reduce((acc, ch) => acc + ch.data.spend, 0);
  const totalRevenue = channels.reduce((acc, ch) => acc + ch.data.revenue, 0);
  const globalROAS = totalRevenue / totalSpend;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {channels.map(channel => (
        <ChannelCard key={channel.name} {...channel} />
      ))}
      
      <div className="col-span-3">
        <h2>Global Performance</h2>
        <div className="stats">
          <Stat label="Total Spend" value={totalSpend} />
          <Stat label="Total Revenue" value={totalRevenue} />
          <Stat label="Global ROAS" value={globalROAS} />
        </div>
      </div>
    </div>
  );
}
```

## 📋 PHASE 5 : ENTERPRISE (Q1 2025)

### White Label Architecture

#### Multi-Tenant Setup
```javascript
// /lib/multi-tenant.js
export class TenantManager {
  constructor() {
    this.tenants = new Map();
  }
  
  async getTenant(domain) {
    // Check cache
    if (this.tenants.has(domain)) {
      return this.tenants.get(domain);
    }
    
    // Load from DB
    const tenant = await db.collection('tenants')
      .where('domain', '==', domain)
      .get();
    
    if (tenant.empty) {
      return this.getDefaultTenant();
    }
    
    const config = tenant.docs[0].data();
    this.tenants.set(domain, config);
    
    return config;
  }
  
  async createTenant(data) {
    const tenant = {
      id: generateId(),
      name: data.name,
      domain: data.domain,
      branding: {
        logo: data.logo,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor
      },
      features: data.plan.features,
      limits: data.plan.limits,
      createdAt: new Date()
    };
    
    await db.collection('tenants').doc(tenant.id).set(tenant);
    
    // Setup subdomain
    await this.setupDomain(tenant.domain);
    
    return tenant;
  }
}
```

#### Dynamic Theming
```javascript
// /app/app/layout.js
export default async function RootLayout({ children }) {
  const tenant = await getTenant();
  
  return (
    <html>
      <head>
        <style>{`
          :root {
            --primary: ${tenant.branding.primaryColor};
            --secondary: ${tenant.branding.secondaryColor};
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider tenant={tenant}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### RBAC Implementation
```javascript
// /lib/auth/rbac.js
export const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: ['*']
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      'campaigns:*',
      'users:read',
      'users:create',
      'billing:read'
    ]
  },
  MANAGER: {
    name: 'Manager',
    permissions: [
      'campaigns:read',
      'campaigns:create',
      'campaigns:update',
      'reports:*'
    ]
  },
  ANALYST: {
    name: 'Analyst',
    permissions: [
      'campaigns:read',
      'reports:read',
      'insights:read'
    ]
  },
  CLIENT: {
    name: 'Client',
    permissions: [
      'dashboard:read',
      'reports:read'
    ]
  }
};

export class PermissionManager {
  hasPermission(user, permission) {
    const role = ROLES[user.role];
    
    if (role.permissions.includes('*')) {
      return true;
    }
    
    if (role.permissions.includes(permission)) {
      return true;
    }
    
    // Check wildcard permissions
    const [resource, action] = permission.split(':');
    if (role.permissions.includes(`${resource}:*`)) {
      return true;
    }
    
    return false;
  }
  
  requirePermission(permission) {
    return async (req, res, next) => {
      const user = req.user;
      
      if (!this.hasPermission(user, permission)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }
      
      next();
    };
  }
}
```

## 📋 PHASE 6 : SCALE & ML (Q2 2025)

### Microservices Architecture

#### Service Decomposition
```yaml
# docker-compose.yml
version: '3.8'

services:
  gateway:
    image: digiflow/gateway
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - auth-service
      - campaign-service
      - analytics-service
  
  auth-service:
    image: digiflow/auth
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/auth
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  campaign-service:
    image: digiflow/campaigns
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/campaigns
      - META_API_KEY=${META_API_KEY}
    depends_on:
      - db
      - redis
  
  analytics-service:
    image: digiflow/analytics
    environment:
      - CLICKHOUSE_URL=clickhouse://clickhouse:8123
    depends_on:
      - clickhouse
  
  ai-service:
    image: digiflow/ai
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  clickhouse:
    image: clickhouse/clickhouse-server
    volumes:
      - clickhouse_data:/var/lib/clickhouse

volumes:
  postgres_data:
  redis_data:
  clickhouse_data:
```

### ML Pipeline

#### Feature Engineering
```python
# ml/feature_engineering.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

class FeatureEngineer:
    def __init__(self):
        self.scaler = StandardScaler()
    
    def create_features(self, campaign_data):
        features = pd.DataFrame()
        
        # Time-based features
        features['hour_of_day'] = pd.to_datetime(campaign_data['created_at']).dt.hour
        features['day_of_week'] = pd.to_datetime(campaign_data['created_at']).dt.dayofweek
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Performance features
        features['ctr'] = campaign_data['clicks'] / campaign_data['impressions']
        features['cpc'] = campaign_data['spend'] / campaign_data['clicks']
        features['cvr'] = campaign_data['conversions'] / campaign_data['clicks']
        
        # Audience features
        features['audience_size'] = campaign_data['audience_size']
        features['audience_age_range'] = campaign_data['age_max'] - campaign_data['age_min']
        
        # Historical features
        features['avg_ctr_7d'] = self.rolling_mean(campaign_data, 'ctr', 7)
        features['avg_spend_7d'] = self.rolling_mean(campaign_data, 'spend', 7)
        
        # Normalize
        features_scaled = self.scaler.fit_transform(features)
        
        return features_scaled
    
    def rolling_mean(self, df, column, window):
        return df[column].rolling(window=window).mean().fillna(0)
```

#### Model Training
```python
# ml/models/performance_predictor.py
import tensorflow as tf
from tensorflow import keras

class PerformancePredictor:
    def __init__(self):
        self.model = self.build_model()
    
    def build_model(self):
        model = keras.Sequential([
            keras.layers.Dense(128, activation='relu', input_shape=(50,)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(1, activation='linear')  # Predict ROAS
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train(self, X_train, y_train, X_val, y_val):
        early_stopping = keras.callbacks.EarlyStopping(
            patience=10,
            restore_best_weights=True
        )
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=100,
            batch_size=32,
            callbacks=[early_stopping]
        )
        
        return history
    
    def predict(self, features):
        return self.model.predict(features)
    
    def save(self, path):
        self.model.save(path)
    
    def load(self, path):
        self.model = keras.models.load_model(path)
```

## 🔧 OUTILS & RESSOURCES

### APIs Documentation
- **Meta Graph API** : https://developers.facebook.com/docs/graph-api
- **Google Ads API** : https://developers.google.com/google-ads/api/docs
- **TikTok Business API** : https://business-api.tiktok.com/portal/docs
- **Stripe API** : https://stripe.com/docs/api
- **Shopify API** : https://shopify.dev/api

### Libraries Essentielles
```json
{
  "dependencies": {
    "@anthropic/sdk": "^0.x",
    "openai": "^4.x",
    "stripe": "^13.x",
    "@shopify/shopify-api": "^7.x",
    "google-ads-api": "^14.x",
    "bull": "^4.x",
    "@sentry/nextjs": "^7.x",
    "redis": "^4.x",
    "playwright": "^1.x"
  }
}
```

### Services Cloud
- **Vercel** : Frontend hosting
- **Supabase** : PostgreSQL + Auth
- **Redis Cloud** : Caching & Queues
- **Cloudflare** : CDN & DDoS protection
- **DataDog** : Monitoring & APM
- **Sentry** : Error tracking

## 📝 CHECKLIST DE DÉMARRAGE

### Cette Semaine (29 Août - 4 Septembre)
- [ ] Soumettre l'app Meta pour review
- [ ] Implémenter les webhooks
- [ ] Fixer le token refresh
- [ ] Ajouter Sentry monitoring
- [ ] Créer les tests E2E basiques

### Semaine Prochaine (5-11 Septembre)
- [ ] Intégrer Stripe
- [ ] Créer les plans de pricing
- [ ] Implémenter le cache intelligent
- [ ] Ajouter la queue Bull
- [ ] Documenter l'API

### Dans 2 Semaines (12-18 Septembre)
- [ ] Commencer l'intégration Shopify
- [ ] Prototype Octavia AI
- [ ] Tests de charge
- [ ] Préparer la démo investisseurs

## 💰 BUDGET & RESSOURCES

### Coûts Mensuels Estimés
- **Vercel Pro** : 20€/mois
- **Supabase Pro** : 25€/mois
- **Redis Cloud** : 15€/mois
- **Meta API** : Gratuit (dans les limites)
- **OpenAI/Claude** : ~100€/mois (usage)
- **Monitoring** : 50€/mois
- **Total** : ~210€/mois

### Équipe Nécessaire (À terme)
- **1 Full-Stack Senior** : Focus architecture
- **1 Frontend Dev** : UI/UX
- **1 ML Engineer** : IA & Automation
- **1 DevOps** : Infrastructure
- **1 Product Manager** : Roadmap

## 🎯 OBJECTIFS MESURABLES

### Q4 2024
- ✅ 100 utilisateurs beta
- ✅ 10 clients payants
- ✅ 5k€ MRR
- ✅ 3 intégrations (Meta, Google, Shopify)

### Q1 2025
- ✅ 500 utilisateurs
- ✅ 50 clients payants
- ✅ 25k€ MRR
- ✅ White label ready

### Q2 2025
- ✅ 2000 utilisateurs
- ✅ 200 clients payants
- ✅ 100k€ MRR
- ✅ Series A ready

---

**CE DOCUMENT EST LE GUIDE COMPLET POUR LES PROCHAINES ÉTAPES**

*Chaque section contient du code prêt à l'emploi et des instructions détaillées.*

*À utiliser comme référence pour toute continuation du développement.*

*Dernière mise à jour : 29/08/2024 - 12:00*