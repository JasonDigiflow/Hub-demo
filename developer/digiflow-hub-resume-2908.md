# DigiFlow Hub - État Complet du Projet (29/08/2024)

## 🎯 CONTEXTE PROJET

### Identité du Projet
- **Nom** : DigiFlow Hub
- **Version** : 3.0
- **Repository** : https://github.com/DigiflowAgency/digiflow-hub
- **URL Production** : https://digiflow-hub.vercel.app
- **Créateur** : Jason Sotoca (jason@digiflow-agency.fr)
- **Date de début** : 20/08/2024
- **Dernière mise à jour majeure** : 29/08/2024

### Vision Produit
Créer une plateforme SaaS tout-en-un regroupant 8 applications métier pour automatiser et optimiser la croissance des entreprises. Focus actuel sur le module AIDs (gestion publicitaire Meta Ads avec IA).

### Modèle Business
- **B2B SaaS** : Abonnement mensuel/annuel
- **Target** : PME, E-commerce, Agences digitales
- **Pricing envisagé** : 99€-999€/mois selon features
- **Différenciation** : IA native + Multi-apps intégrées

## 🏗️ ARCHITECTURE TECHNIQUE DÉTAILLÉE

### Stack Frontend
```javascript
// Package.json versions exactes
{
  "next": "15.5.0",
  "react": "19.0.0",
  "tailwindcss": "^3.4.13",
  "framer-motion": "^11.18.0",
  "recharts": "^2.15.0",
  "@radix-ui/react-*": "latest",
  "lucide-react": "^0.468.0"
}
```

### Stack Backend
```javascript
// APIs et Services
- Next.js API Routes (App Router)
- Firebase Admin SDK 12.9.0
- Firebase Client SDK 11.2.0
- JWT (jsonwebtoken 9.0.2)
- Crypto (AES-256-CBC encryption)
- Rate limiting (custom implementation)
```

### Structure des Dossiers
```
/app
  /api
    /aids              # 94 endpoints Meta Ads
    /auth              # Authentication endpoints
    /fidalyz           # Review management
  /app
    /aids              # Module publicitaire (COMPLET)
      /campaigns       # Gestion campagnes
      /insights        # Analytics avancés
      /prospects       # Gestion leads
      /revenues        # Tracking revenus
      /test-tokens     # Gestion tokens test
    /fidalyz          # Module réputation (BASIQUE)
    /[autres]         # Modules verrouillés
  /(marketing)        # Pages publiques
/components
  /aids               # Composants spécifiques AIDs
  /ui                # Composants réutilisables
/lib
  /aids-logger.js    # Système de logging custom
  /firebase.js       # Config Firebase client
  /firebase-admin.js # Config Firebase admin
/developer           # Documentation technique
```

### Base de Données (Firestore)
```javascript
// Collections principales
{
  "users": {
    // Utilisateurs DigiFlow
    "[userId]": {
      email: string,
      primaryOrgId: string,
      orgIds: string[],
      createdAt: timestamp
    }
  },
  "aids_prospects": {
    // Prospects importés de Meta
    "[prospectId]": {
      id: string,           // Meta lead ID ou Firebase ID
      name: string,
      email: string,
      phone: string,
      status: "new" | "contacted" | "qualified" | "converted",
      source: "meta" | "manual",
      campaignId: string,
      campaignName: string,
      adsetId: string,
      adsetName: string,
      adId: string,
      adName: string,
      formId: string,
      formName: string,
      createdTime: string,
      platform: string,
      customFields: object,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  },
  "aids_revenues": {
    // Revenus trackés
    "[revenueId]": {
      id: string,
      prospectId: string,
      prospectName: string,
      amount: number,
      date: string,
      leadDate: string,     // Pour calcul TTD
      description: string,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  },
  "test_tokens": {
    // Tokens Meta chiffrés
    "[tokenId]": {
      name: string,
      encryptedToken: string,  // AES-256-CBC
      metaUserId: string,
      metaUserName: string,
      accountId: string,
      accountName: string,
      isActive: boolean,
      lastUsed: timestamp,
      createdAt: timestamp
    }
  },
  "insights_cache": {
    // Cache des données Meta (désactivé actuellement)
    "[userId_accountId]": {
      campaigns: array,
      lastSync: timestamp,
      nextSync: timestamp
    }
  }
}
```

## 📊 MODULE AIDs - FONCTIONNALITÉS COMPLÈTES

### 1. Dashboard Principal (`/app/aids`)
```javascript
// Composants et fonctionnalités
- <MetricsOverview /> : KPIs temps réel
- <PerformanceChart /> : Graphiques interactifs
- <QuickActions /> : Actions rapides
- <SystemStatus /> : État connexion Meta

// Métriques affichées
- ROAS (Return on Ad Spend)
- Total des dépenses
- Nombre de leads
- Revenus générés
- Taux de conversion
- Coût par lead (CPL)

// Features
- Comparaison de périodes (vs période précédente)
- Export CSV/Excel
- Refresh manuel des données
- Vue responsive mobile/desktop
```

### 2. Gestion des Prospects (`/app/aids/prospects`)
```javascript
// CRUD Operations
POST   /api/aids/prospects/add      # Ajout manuel
GET    /api/aids/prospects          # Liste avec filtres
PUT    /api/aids/prospects/[id]     # Modification
DELETE /api/aids/prospects/[id]     # Suppression

// Synchronisation Meta
GET    /api/aids/meta/leadcenter-v2 # Import leads Meta
POST   /api/aids/prospects/sync     # Sync manuelle
POST   /api/aids/clean-duplicates   # Nettoyage doublons
POST   /api/aids/migrate-prospect-ids # Migration IDs

// Features UI
- Table avec tri/pagination/recherche
- Filtres par statut/date/source
- Actions en masse (delete, export)
- Modal d'édition inline
- Affichage des données Meta (campaign, adset, ad)
- Timeline d'activité du prospect

// Statuts disponibles
const STATUSES = [
  'new',        // Nouveau lead
  'contacted',  // Contacté
  'qualified',  // Qualifié
  'converted'   // Converti
];
```

### 3. Gestion des Revenus (`/app/aids/revenues`)
```javascript
// API Endpoints
POST   /api/aids/revenues/add       # Ajout revenu
GET    /api/aids/revenues           # Liste revenus
PUT    /api/aids/revenues/[id]      # Modification
DELETE /api/aids/revenues/[id]      # Suppression
POST   /api/aids/revenues/link-prospect # Liaison auto

// Calculs automatiques
- ROAS = Revenus / Dépenses
- CPL = Dépenses / Nombre de leads
- Taux de conversion = Conversions / Leads * 100
- Panier moyen = Revenus / Nombre de ventes
- TTD (Time To Deal) = Date vente - Date lead

// Features spéciales
- Auto-linking avec prospects (par email/phone)
- Calcul du TTD moyen
- Graphiques d'évolution
- Export comptable
```

### 4. Insights & Analytics (`/app/aids/insights`)
```javascript
// Composants principaux
<MetricsGrid />          # Grille de KPIs
<PerformanceChart />     # Graphiques temporels
<CampaignDrilldownTable /> # Hiérarchie interactive
<PeriodSelector />       # Sélecteur de période

// Périodes disponibles
- Today
- Yesterday  
- Last 7 days
- Last 15 days
- Last 30 days
- Last 90 days
- Current month
- Last month
- Custom range

// Hiérarchie des données
Campaign
  └── Ad Sets
      └── Ads
          └── Metrics

// Métriques Meta Ads
- Impressions, Reach, Frequency
- Clicks, CTR, CPC
- Spend, CPM
- Leads, Cost per Lead
- Actions, Conversions

// Cache Strategy
1. Memory cache: 30 minutes
2. Firestore cache: Disabled (bug with periods)
3. API calls: Rate limited
```

### 5. Connexion Meta (`/app/aids/connect`)
```javascript
// OAuth2 Flow
1. User clicks "Connect with Meta"
2. Redirect to Facebook OAuth
3. Callback with access token
4. Store encrypted token in cookies
5. Select ad account
6. Ready to use

// Session Management
- Token stored in httpOnly cookies
- 30 days expiration
- Auto-select last used account
- Multiple accounts support

// Security
- AES-256-CBC encryption for tokens
- HTTPS only in production
- CORS protection
- Rate limiting on API calls
```

### 6. Test Tokens (`/app/aids/test-tokens`)
```javascript
// Features
- Add multiple test tokens
- Encrypted storage in Firestore
- Switch between accounts
- Token validation
- Auto-activation

// Workflow
1. Get token from Graph API Explorer
2. Add token with name/description
3. Token encrypted and stored
4. Click "Use" to activate
5. Session created automatically
```

### 7. Outils de Debug
```javascript
// Pages disponibles
/app/aids/logs           # Logs système
/app/aids/debug-leads    # Debug import leads
/app/aids/debug-meta     # Debug API Meta

// API Endpoints debug
GET  /api/aids/logs      # Récupère logs
POST /api/aids/force-delete # Suppression totale
POST /api/aids/reset-all    # Reset complet
GET  /api/aids/debug-firebase # Test Firebase
```

## 🔌 INTÉGRATIONS ACTUELLES

### Meta (Facebook) Business API
```javascript
// Permissions utilisées
['ads_read', 'ads_management', 'leads_retrieval']

// Endpoints principaux
GET /me/adaccounts       # Liste comptes pub
GET /{account}/campaigns # Campagnes
GET /{account}/insights  # Métriques
GET /{form}/leads       # Leads formulaires
GET /{campaign}/adsets  # Ad sets
GET /{adset}/ads        # Ads

// Limites actuelles
- Rate limit: 200 calls/hour
- Batch size: 50 items
- Time range: Max 90 days
```

### Firebase Services
```javascript
// Services utilisés
- Authentication (Email/Password + OAuth)
- Firestore Database
- Admin SDK (server-side)
- Security Rules (à implémenter)

// Configuration requise
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL  
FIREBASE_ADMIN_PRIVATE_KEY
NEXT_PUBLIC_FIREBASE_*
```

## 🎨 DESIGN SYSTEM

### Glassmorphism Theme
```css
/* Styles principaux */
.glass {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* Couleurs principales */
--primary: #9333ea (purple-600)
--secondary: #ec4899 (pink-600)
--success: #10b981 (emerald-600)
--warning: #f59e0b (amber-600)
--danger: #ef4444 (red-600)
```

### Composants UI Réutilisables
```javascript
// Dans /components/ui
- Button.jsx      # Boutons avec variants
- Card.jsx        # Cards glassmorphism
- Input.jsx       # Inputs stylisés
- Modal.jsx       # Modals avec backdrop
- Table.jsx       # Tables responsives
- Select.jsx      # Dropdowns custom
- Badge.jsx       # Badges status
- Alert.jsx       # Notifications
- Skeleton.jsx    # Loading states
```

### Animations (Framer Motion)
```javascript
// Animations standards
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const scaleIn = {
  initial: { scale: 0.95 },
  animate: { scale: 1 },
  whileHover: { scale: 1.05 }
};
```

## 📈 MÉTRIQUES & PERFORMANCE

### Performance Actuelle
```javascript
// Lighthouse Scores
Performance: 85
Accessibility: 78
Best Practices: 92
SEO: 100

// Bundle Size
First Load JS: 102 kB
Total Bundle: ~450 kB

// Build Stats
Build Time: 45 seconds
Routes: 130 static pages
API Routes: 94 endpoints

// Response Times
API Average: 200-500ms
Meta API calls: 500-2000ms
Database queries: 50-200ms
```

### Utilisation Actuelle
```javascript
// Code Stats
Total Files: ~250
Lines of Code: ~25,000
Components: ~50
API Endpoints: 94

// Git Stats
Total Commits: ~150
Last Push: 29/08/2024
Contributors: 1 (+ Claude)
```

## 🐛 BUGS & LIMITATIONS CONNUS

### Critiques (À fixer en priorité)
1. **Token Refresh** : Pas de refresh automatique des tokens Meta
2. **Cache Firestore** : Ne prend pas en compte les différentes périodes
3. **Rate Limiting** : Peut atteindre les limites Meta rapidement
4. **Mobile UX** : Tables pas optimales sur petits écrans

### Moyens
1. **Webhooks Meta** : Non implémentés (leads pas en temps réel)
2. **Error Handling** : Certaines erreurs pas catchées proprement
3. **Validation** : Manque de validation côté client sur certains forms
4. **Types** : Pas de TypeScript (difficile à maintenir)

### Mineurs
1. **Animations** : Parfois saccadées sur mobile
2. **Dark Mode** : Pas de toggle (dark only)
3. **i18n** : Pas d'internationalisation
4. **PWA** : Pas de support offline

## ✅ CE QUI FONCTIONNE PARFAITEMENT

### Features Stables
- ✅ Connexion OAuth Meta
- ✅ Import des leads depuis Meta
- ✅ CRUD prospects complet
- ✅ CRUD revenus complet
- ✅ Calculs ROAS/CPL/Conversion
- ✅ Export CSV des données
- ✅ Graphiques interactifs
- ✅ Système de tokens de test
- ✅ Glassmorphism UI
- ✅ Responsive design

### Workflows Testés
```javascript
// Workflow complet validé
1. Connect Meta → 
2. Select Ad Account → 
3. Import Leads → 
4. Manage Prospects → 
5. Track Revenues → 
6. View Analytics → 
7. Export Data
```

## 🔐 SÉCURITÉ ACTUELLE

### Mesures en Place
- ✅ Tokens chiffrés AES-256-CBC
- ✅ HTTP-only cookies
- ✅ HTTPS en production
- ✅ CORS configuré
- ✅ Rate limiting basique
- ✅ Validation des inputs (partielle)

### À Améliorer
- ❌ 2FA non implémenté
- ❌ Audit logs incomplets
- ❌ Pas de WAF
- ❌ Secrets en .env (pas de vault)
- ❌ Pas de pen testing

## 📝 ENVIRONNEMENT & CONFIGURATION

### Variables d'Environnement Requises
```bash
# Firebase Admin (OBLIGATOIRE)
FIREBASE_ADMIN_PROJECT_ID=digiflow-hub
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Firebase Client (OBLIGATOIRE)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=digiflow-hub.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=digiflow-hub
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=digiflow-hub.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Meta API (OBLIGATOIRE pour AIDs)
META_APP_ID=123456789        # From Meta App Dashboard
META_APP_SECRET=abc123def456  # From Meta App Dashboard
NEXT_PUBLIC_META_APP_ID=123456789

# Security (OBLIGATOIRE)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key

# Anthropic AI (OPTIONNEL - pour Octavia)
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Vercel (AUTO)
VERCEL_URL=auto-generated
```

### Commandes de Développement
```bash
# Installation
npm install

# Dev server (port 3000 ou 3007 si occupé)
npm run dev

# Build production
npm run build

# Start production
npm run start

# Lint
npm run lint

# Tests (non configurés)
npm run test
```

### Déploiement
```bash
# Auto-deploy sur Vercel
git push origin main

# Preview sur PR
git push origin feature/xxx
# → URL preview générée automatiquement

# Rollback si besoin
vercel rollback
```

## 🎯 ÉTAT PAR MODULE

### ✅ AIDs (Publicité Digitale) - 80% COMPLET
- Dashboard ✅
- Prospects ✅
- Revenus ✅
- Insights ✅
- Campagnes ✅
- Connexion Meta ✅
- Octavia AI 🚧 (30%)
- Webhooks ❌
- Multi-channel ❌

### 🚧 Fidalyz (Réputation) - 20% COMPLET
- Interface basique ✅
- Clark AI (réponses) ✅
- Connexion Google ❌
- Import avis ❌
- Analytics ❌

### 🔒 Autres Modules - 0% (Verrouillés)
- Supportia ❌
- SEOly ❌
- Salesia ❌
- CashFlow ❌
- Lexa ❌
- Eden ❌

## 📅 HISTORIQUE DES CHANGEMENTS MAJEURS

### 29/08/2024
- Ajout système de tokens de test sécurisé
- Remplacement fake data par vraies métriques
- UI/UX glassmorphism sur prospects/revenues
- Nettoyage des fichiers de documentation

### 28/08/2024
- Fix dates excluant aujourd'hui
- Fix cache hiérarchie campagnes
- Amélioration UI/UX avec glassmorphism

### 27/08/2024
- Implémentation insights avancés
- Ajout drill-down campagnes
- Fix période selector

### 26/08/2024
- Dashboard data réel fonctionnel
- Intégration complète revenues
- Calculs ROAS/metrics

### 25/08/2024
- Fix import leads Meta
- Ajout clean duplicates
- Migration IDs system

### 24/08/2024
- Prospects CRUD complet
- Revenues tracking
- Export CSV

### 22/08/2024
- Connexion Meta OAuth
- Structure AIDs module
- Firebase setup

### 20/08/2024
- Init projet
- Setup Next.js 15
- Configuration de base

---

**CE FICHIER EST LA RÉFÉRENCE ABSOLUE DE L'ÉTAT ACTUEL DU PROJET**

*Pour toute reprise de développement, ce fichier contient TOUTES les informations nécessaires pour comprendre où nous en sommes.*

*Dernière mise à jour : 29/08/2024 - 11:30*