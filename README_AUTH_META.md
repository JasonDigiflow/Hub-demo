# DigiFlow Hub - Authentification Meta OAuth

## 🚀 Vue d'ensemble

Ce document explique le nouveau système d'authentification OAuth Meta qui remplace l'ancien système basé sur des tokens fixes dans les variables d'environnement.

## 🔑 Configuration requise

### Variables d'environnement (côté serveur uniquement)
```env
# Meta App Configuration (OBLIGATOIRE)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Security (OBLIGATOIRE)
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key

# Cron (OPTIONNEL)
CRON_SECRET=your-cron-secret-for-sync

# URL (Production)
NEXT_PUBLIC_URL=https://digiflow-hub.com
```

### Configuration Meta App Dashboard
1. Aller sur https://developers.facebook.com/apps
2. Sélectionner votre app
3. Dans "Settings" > "Basic", configurer :
   - App Domains : `digiflow-hub.com`, `localhost:3000`
   - Privacy Policy URL : `https://digiflow-hub.com/privacy`
   - Terms of Service URL : `https://digiflow-hub.com/terms`
4. Dans "Facebook Login" > "Settings" :
   - Valid OAuth Redirect URIs : 
     - `https://digiflow-hub.com/api/meta/auth/callback`
     - `http://localhost:3000/api/meta/auth/callback`
5. Dans "App Review" > "Permissions and Features", demander :
   - `ads_read`
   - `ads_management`
   - `business_management`
   - `read_insights`
   - `leads_retrieval`

## 📋 Flux d'authentification

### 1. Connexion initiale
```
User → /app/aids/connect → "Se connecter avec Meta"
     → GET /api/meta/auth/url (génère URL OAuth)
     → Redirect vers Facebook OAuth
     → User consent
     → Callback vers /api/meta/auth/callback
     → Exchange code → short-lived token
     → Exchange short-lived → long-lived token (60 jours)
     → Stockage chiffré dans Firestore
     → Redirect vers dashboard
```

### 2. Structure Firestore
```javascript
// users/{uid}
{
  email: "user@example.com",
  name: "User Name",
  metaConnection: {
    fbUserId: "123456789",
    fbUserName: "Facebook User",
    encryptedToken: "encrypted_token_here",
    expiresAt: 1234567890000, // timestamp
    lastRefresh: 1234567890000,
    connectedAt: "2024-08-29T12:00:00Z"
  }
}

// organizations/{orgId}
{
  name: "Organisation Name",
  adAccounts: [
    {
      id: "act_123456",
      accountId: "123456",
      name: "Account Name",
      currency: "EUR",
      status: 1, // 1=Active, 2=Disabled, etc.
      lastSync: 1234567890000
    }
  ],
  syncLogs: [] // SubCollection
}
```

## 🔄 Multi-Ad Accounts

### Utilisation du sélecteur
```jsx
// Dans n'importe quelle page AIDs
import AdAccountSelector from '@/components/aids/AdAccountSelector';
import { AdAccountProvider } from '@/lib/contexts/AdAccountContext';

export default function Page() {
  return (
    <AdAccountProvider>
      <div className="header">
        <AdAccountSelector />
      </div>
      {/* Votre contenu */}
    </AdAccountProvider>
  );
}
```

### Récupérer l'account actif dans une API
```javascript
// Dans une API route
import { DynamicConfigService } from '@/lib/aids/services/config-dynamic';

export async function GET(request) {
  const config = await DynamicConfigService.fromRequest(request);
  const metaConfig = config.getMetaConfig();
  
  if (!metaConfig.accessToken) {
    return NextResponse.json({ error: 'Non authentifié' });
  }
  
  const adAccountId = metaConfig.adAccountId; // Account sélectionné
  // Utiliser adAccountId pour les appels Meta API
}
```

## 🔐 Sécurité

### Chiffrement des tokens
- Algorithme : AES-256-CBC
- Les tokens sont UNIQUEMENT stockés côté serveur
- Jamais exposés au client
- Chiffrés dans Firestore

### Middleware de vérification
```javascript
// Vérifier l'accès à un ad account
import { getMetaTokenForUser } from '@/lib/meta-token-manager';

const tokenInfo = await getMetaTokenForUser();
if (!tokenInfo.success) {
  // Rediriger vers connexion Meta
  return NextResponse.redirect('/app/aids/connect');
}
```

## 🔄 Synchronisation automatique

### Configuration Vercel Cron
Le fichier `vercel.json` configure une sync toutes les 4 heures :
```json
{
  "crons": [
    {
      "path": "/api/meta/sync-lite?secret=your-cron-secret",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

### Endpoint de sync manuelle
```bash
# Déclencher une sync manuelle (avec auth)
curl -X POST https://digiflow-hub.com/api/meta/sync-lite \
  -H "Authorization: Bearer your-cron-secret"
```

## 🔍 Debugging

### Vérifier la connexion Meta
```javascript
// GET /api/meta/accounts
// Retourne les ad accounts disponibles

// GET /api/meta/sync-lite
// Retourne le statut de la dernière sync
```

### Logs disponibles
- `/app/aids/logs` : Interface des logs
- Firestore : `organizations/{orgId}/syncLogs`

## 🚨 Gestion des erreurs

### Token expiré
```javascript
if (tokenInfo.needsReauth) {
  // Rediriger vers /app/aids/connect
}
```

### Pas d'ad accounts
```javascript
if (accounts.length === 0) {
  // Message : "Créez un compte publicitaire dans Business Manager"
}
```

## 📝 Migration depuis l'ancien système

### Avant (variables d'environnement)
```env
META_ACCESS_TOKEN=fixed_token_here
META_AD_ACCOUNT_ID=act_123456
```

### Après (OAuth dynamique)
- Supprimez `META_ACCESS_TOKEN` et `META_AD_ACCOUNT_ID`
- Les utilisateurs doivent se connecter via OAuth
- Les tokens sont gérés automatiquement
- Multi-comptes supporté nativement

## 🎯 Checklist de déploiement

- [ ] Variables META_APP_ID et META_APP_SECRET configurées
- [ ] TOKEN_ENCRYPTION_KEY générée (32 caractères)
- [ ] Redirect URIs configurées dans Meta App Dashboard
- [ ] Permissions Meta approuvées (ou en test mode)
- [ ] Vercel Cron configuré avec CRON_SECRET
- [ ] Firestore rules mises à jour
- [ ] Tests de connexion OAuth réussis
- [ ] Sync automatique vérifiée

## 📚 Ressources

- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Marketing API Permissions](https://developers.facebook.com/docs/marketing-api/access)

---
*Dernière mise à jour : 29/08/2024*