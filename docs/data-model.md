# Architecture Multi-Tenant DigiFlow Hub

## Vue d'ensemble

L'application utilise une architecture multi-tenant centrée sur les **organisations** plutôt que sur les utilisateurs individuels. Chaque organisation peut avoir plusieurs membres avec différents rôles et plusieurs comptes publicitaires.

## Structure Firestore

```
organizations/{orgId}/
├── members/{uid}
│   ├── role: 'admin' | 'member' | 'viewer'
│   ├── invitedBy: string
│   ├── email: string
│   └── createdAt: Timestamp
│
├── teams/{teamId}
│   ├── name: string
│   └── members: string[]
│
├── settings/{default}
│   ├── branding: object
│   ├── prompts: object
│   └── preferences: object
│
├── payments/{invoiceId}
│   ├── provider: 'stripe'
│   ├── status: string
│   ├── amountCents: number
│   └── currency: string
│
└── adAccounts/{adAccountId}/
    ├── platform: 'meta' | 'google' | 'tiktok'
    ├── externalId: string
    ├── name: string
    ├── currency: string
    ├── status: string
    │
    ├── prospects/{prospectId}
    │   ├── name: string
    │   ├── email: string
    │   ├── phone: string
    │   ├── status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    │   ├── source: 'meta' | 'google' | 'manual'
    │   ├── metaId: string (pour les leads Meta)
    │   └── createdAt: Timestamp
    │
    ├── revenues/{revId}
    │   ├── amountCents: number
    │   ├── currency: string
    │   ├── date: Timestamp
    │   └── attribution: object
    │
    ├── insightsDaily/{yyyymmdd}
    │   ├── date: Timestamp
    │   ├── spendCents: number
    │   ├── impressions: number
    │   ├── clicks: number
    │   ├── ctr: number
    │   └── roas: number
    │
    └── campaigns/{campaignId}/
        ├── name: string
        ├── objective: string
        ├── status: string
        ├── budgetCents: number
        └── insightsDaily/{yyyymmdd}

users/{uid}/
├── email: string
├── name: string
├── orgIds: string[]
├── primaryOrgId: string
├── photoURL: string
└── createdAt: Timestamp
```

## Rôles et Permissions

### Rôles

- **Admin** : Accès complet, peut gérer les membres et les paramètres
- **Member** : Peut créer/modifier des données (prospects, revenus)
- **Viewer** : Lecture seule

### Matrice des Permissions

| Action | Admin | Member | Viewer |
|--------|-------|--------|---------|
| Voir les données | ✅ | ✅ | ✅ |
| Créer des prospects | ✅ | ✅ | ❌ |
| Modifier des prospects | ✅ | ✅ | ❌ |
| Supprimer des prospects | ✅ | ❌ | ❌ |
| Gérer les membres | ✅ | ❌ | ❌ |
| Voir les paiements | ✅ | ❌ | ❌ |
| Configurer les intégrations | ✅ | ❌ | ❌ |

## Conventions

### Montants Monétaires
Tous les montants sont stockés en **centimes** (entiers) pour éviter les problèmes de précision :
- `amountCents: 1999` = 19.99€
- `spendCents: 500` = 5.00€

### Dates
Toutes les dates utilisent le type **Timestamp** de Firestore :
- `createdAt: Timestamp`
- `date: Timestamp`

### IDs
Format des IDs :
- Organizations : `org_{userId}_{timestamp}`
- Ad Accounts : `adacc_{platform}_{timestamp}`
- Prospects : `prospect_{timestamp}{random}`

## Exemples de Documents

### Organization
```json
{
  "name": "DigiFlow Agency",
  "slug": "digiflow-agency",
  "owner": "user123",
  "createdAt": "2025-08-22T10:00:00Z",
  "subscription": {
    "plan": "pro",
    "status": "active",
    "validUntil": "2025-09-22T10:00:00Z"
  },
  "limits": {
    "maxMembers": 10,
    "maxAdAccounts": 5,
    "maxProspects": 5000
  }
}
```

### Ad Account
```json
{
  "platform": "meta",
  "externalId": "act_525710246832337",
  "name": "Compte Pub Principal",
  "currency": "EUR",
  "status": "active",
  "createdAt": "2025-08-22T10:00:00Z"
}
```

### Prospect
```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33612345678",
  "company": "Entreprise XYZ",
  "source": "meta",
  "status": "qualified",
  "metaId": "lead_123456789",
  "campaignId": "camp_987654321",
  "campaignName": "Campagne Acquisition Q1",
  "score": 85,
  "tags": ["urgent", "grand-compte"],
  "createdAt": "2025-08-22T14:30:00Z"
}
```

### Revenue
```json
{
  "amountCents": 19900,
  "currency": "EUR",
  "date": "2025-08-22T10:12:00Z",
  "type": "sale",
  "attribution": {
    "campaignId": "camp_987654321",
    "prospectId": "prospect_abc123",
    "source": "meta"
  },
  "customer": {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  }
}
```

### Insights Daily
```json
{
  "date": "2025-08-22T00:00:00Z",
  "spendCents": 2450,
  "impressions": 5234,
  "clicks": 287,
  "ctr": 5.48,
  "cpcCents": 8,
  "cpmCents": 468,
  "conversions": 12,
  "roas": 3.2
}
```

## Migration

### Depuis l'ancienne structure

Pour migrer les données existantes :

```bash
# Mode simulation (dry-run)
node scripts/migrate-to-org-structure.js --dry-run

# Migration réelle
node scripts/migrate-to-org-structure.js

# Reprendre depuis un ID spécifique
node scripts/migrate-to-org-structure.js --resume=prospect_xyz123

# Limiter le nombre de documents
node scripts/migrate-to-org-structure.js --limit=100
```

### Collections migrées
- `aids_prospects` → `organizations/{orgId}/adAccounts/{adAccountId}/prospects`
- `aids_revenues` → `organizations/{orgId}/adAccounts/{adAccountId}/revenues`

## APIs

### Endpoints Principaux

#### Prospects
```
GET    /api/organizations/{orgId}/adAccounts/{adAccountId}/prospects
POST   /api/organizations/{orgId}/adAccounts/{adAccountId}/prospects
PUT    /api/organizations/{orgId}/adAccounts/{adAccountId}/prospects (bulk import)
DELETE /api/organizations/{orgId}/adAccounts/{adAccountId}/prospects/{prospectId}
```

#### Revenues
```
GET    /api/organizations/{orgId}/adAccounts/{adAccountId}/revenues
POST   /api/organizations/{orgId}/adAccounts/{adAccountId}/revenues
```

#### Insights
```
GET    /api/organizations/{orgId}/adAccounts/{adAccountId}/insights
POST   /api/organizations/{orgId}/adAccounts/{adAccountId}/insights/ingest
```

### Authentification

Toutes les requêtes nécessitent un JWT token dans les cookies :
- Cookie name : `auth-token`
- Payload : `{ uid: string, email: string }`

## Hooks React

### useOrganization()
```javascript
const { 
  organization,     // Organisation courante
  currentOrgId,     // ID de l'org active
  memberRole,       // Rôle de l'utilisateur
  isAdmin,          // true si admin
  switchOrganization // Changer d'org
} = useOrganization();
```

### useAdAccounts()
```javascript
const { 
  adAccounts,       // Liste des comptes pub
  loading 
} = useAdAccounts();
```

### useProspects(adAccountId)
```javascript
const { 
  prospects,        // Liste des prospects
  loading 
} = useProspects(adAccountId);
```

### useInsights(adAccountId, dateRange)
```javascript
const { 
  insights,         // Données d'insights
  totals,           // Totaux agrégés
  loading 
} = useInsights(adAccountId, 30);
```

## Déploiement Firebase

### 1. Déployer les règles de sécurité
```bash
firebase deploy --only firestore:rules
```

### 2. Déployer les index
```bash
firebase deploy --only firestore:indexes
```

### 3. Variables d'environnement requises
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# JWT
JWT_SECRET=

# Meta API
NEXT_PUBLIC_META_APP_ID=
NEXT_PUBLIC_META_APP_SECRET=
```

## Monitoring

### Métriques à surveiller
- Nombre de lectures/écritures par organisation
- Taux d'erreur des règles de sécurité
- Temps de réponse des requêtes
- Utilisation du quota Firebase

### Logs importants
- Créations d'organisations
- Imports de prospects en masse
- Erreurs de validation
- Violations de permissions

## Support

Pour toute question sur l'architecture :
- Documentation : `/docs/data-model.md`
- Schémas : `/lib/schemas/organization.js`
- Hooks : `/lib/hooks/useOrganization.js`
- Migration : `/scripts/migrate-to-org-structure.js`