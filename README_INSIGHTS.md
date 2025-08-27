# AIDs Insights - Documentation Technique

## Architecture

### État Centralisé (Zustand)
- **Store**: `/lib/aids-store.js`
- **État partagé**:
  - `adAccountId`: Compte publicitaire actif
  - `dateRange`: {since, until} - Dates absolues
  - `datePreset`: Preset sélectionné (today, yesterday, last_7d, last_30d, last_90d, lifetime)
  - `lastSync` / `nextSync`: Timestamps de synchronisation
  - `syncInProgress`: État de sync en cours

### Composants Principaux
1. **AccountDropdown** (`/components/aids/AccountDropdown.js`)
   - Utilise React Portal pour résoudre les problèmes de z-index
   - Rendu directement dans document.body avec z-index: 99999
   
2. **CampaignDrilldownTable** (`/components/aids/CampaignDrilldownTable.js`)
   - Consomme dateRange du store centralisé
   - Charge les données via insights-v2 API
   - Support du drill-down: Campaign → AdSet → Ad
   
3. **AutoSyncManager** (`/components/aids/AutoSyncManager.js`)
   - Synchronisation automatique toutes les 30 minutes
   - Vérifie le statut de sync au démarrage
   - Met à jour les timestamps dans le store

## Endpoints Meta API

### `/api/aids/meta/insights-v2/route.js`
Endpoint principal pour les insights avec support since/until.

#### Paramètres
- `since` / `until`: Dates absolues (YYYY-MM-DD)
- `level`: account | campaign | adset | ad
- `breakdowns`: age,gender,publisher_platform,etc.
- `time_increment`: 1 (pour les séries temporelles)

#### Requêtes Meta Graph API
```javascript
// Niveau compte
GET /act_{AD_ACCOUNT_ID}/insights
  ?fields=spend,impressions,clicks,reach,ctr,cpm,cpc,actions,results
  &time_range={'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}

// Niveau campagne
GET /act_{AD_ACCOUNT_ID}/insights
  ?level=campaign
  &fields=campaign_id,campaign_name,objective,spend,impressions,clicks,reach,results
  &time_range={'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}
```

### Mapping des Leads
Les leads sont extraits selon l'objectif de la campagne:

```javascript
// Si objectif = OUTCOME_LEADS ou LEAD_GENERATION
leads = item.results || 0

// Sinon, filtrage des actions
const leadActions = actions.filter(a => 
  ['lead', 'omni_complete_registration', 'offsite_conversion.fb_pixel_lead']
  .includes(a.action_type)
);
leads = leadActions.reduce((sum, a) => sum + parseInt(a.value), 0);
```

## Formules de Calcul

### Métriques Principales
```javascript
CTR = (clicks / impressions) * 100       // Taux de clic
CPC = spend / clicks                     // Coût par clic  
CPM = (spend / impressions) * 1000       // Coût pour 1000 impressions
Cost per Lead = spend / leads            // Coût par lead
```

### ROAS Réel (Revenue On Ad Spend)
```javascript
// Depuis les revenus internes (/aids/revenues)
ROAS = revenues_total / spend_total
ROI = ((revenues_total / spend_total) - 1) * 100
```

## Stratégie de Cache

### Cache Mémoire (1 minute)
- Clé: `{adAccountId}_{since}_{until}_{level}_{breakdowns}_{timeIncrement}`
- Durée: 60 secondes
- But: Éviter les appels API répétés lors de la navigation

### Cache Firestore (30 minutes)
- Collection: `insights_cache`
- Document ID: `{userId}_{adAccountId}`
- Structure:
```javascript
{
  userId: string,
  accountId: string,
  campaigns: Array,
  lastSync: Timestamp,
  nextSync: Timestamp
}
```

### Invalidation du Cache
- Changement de période → Nouvelle clé de cache
- Changement de compte → Nouvelle clé de cache
- Sync manuelle → Invalide tout le cache

## Revenus Internes

### Endpoint: `/api/aids/insights/revenues/route.js`

#### Paramètres
- `since` / `until`: Période de filtrage
- `campaign_id` (optionnel): Filtrer par campagne

#### Structure de Retour
```javascript
{
  total: number,          // Total des revenus
  count: number,          // Nombre de revenus
  daily_data: Array,      // Revenus par jour
  by_campaign: {          // Revenus par campagne
    [campaignId]: {
      total: number,
      count: number,
      revenues: Array
    }
  }
}
```

## Synchronisation

### Auto-Sync
- **Intervalle**: 30 minutes
- **Composant**: `AutoSyncManager`
- **Endpoint**: `/api/aids/insights/sync`
- **Processus**:
  1. Fetch insights niveau compte
  2. Fetch hiérarchie campagnes
  3. Cache en Firestore
  4. Update timestamps

### Sync Manuelle
- Bouton dans CampaignDrilldownTable
- Même processus que auto-sync
- Force refresh des données

## Critères d'Acceptation

### Page /aids (Dashboard)
✅ Le dropdown compte publicitaire utilise un Portal (z-index: 99999)
✅ Affichage correct au-dessus de tous les éléments
✅ Timestamps de synchronisation visibles

### Page /aids/insights

#### Table Hiérarchie des Campagnes
✅ Respecte la période sélectionnée (since/until)
✅ Données alignées avec Meta Ads Manager:
  - 30 jours: ~€585,11 / ~21,43k impressions / 55 leads
  - 90 jours: ~€1539,81 / ~51,541 impressions / 107 leads
✅ Pas de double comptage des clics
✅ CTR/CPC/CPM calculés à partir des données agrégées

#### Revenus Réels & ROAS
✅ Données depuis `/aids/revenues` (pas Meta)
✅ Filtrage par période (since/until)
✅ ROAS = revenus_internes / spend_meta
✅ Support revenus par campagne si campaignId renseigné

#### Synchronisation
✅ Auto-sync toutes les 30 minutes
✅ Bouton sync manuel fonctionnel
✅ Affichage "Dernière sync" / "Prochaine sync"
✅ Indicateur visuel pendant la sync

## Debugging

### Logs Utiles
```javascript
// Vérifier les requêtes Meta
console.log('[Insights V2] Fetching:', url);

// Vérifier le cache
console.log('[Insights V2] Cache key:', cacheKey);

// Vérifier les totaux
console.log('[Insights V2] Totals:', { spend, clicks, leads });

// Vérifier les revenus
console.log('[Revenues API] Found records:', count);
```

### Problèmes Courants

1. **Métriques incorrectes**
   - Vérifier date_range vs date_preset
   - Vérifier l'agrégation (sum vs max pour reach)
   - Vérifier le level (campaign vs account)

2. **Dropdown z-index**
   - S'assurer que le Portal est monté
   - Vérifier qu'aucun parent n'a transform/filter

3. **Revenus à 0**
   - Vérifier l'authentification (auth-token ou meta_session)
   - Vérifier les dates de filtrage
   - Vérifier userId dans les requêtes

4. **Sync ne fonctionne pas**
   - Vérifier les cookies meta_session et selected_ad_account
   - Vérifier les permissions Meta API
   - Vérifier le cache Firestore

## Tests Recommandés

1. **Test de Période**
   - Sélectionner 30 jours → Vérifier totaux vs Ads Manager
   - Sélectionner 90 jours → Vérifier nouvelle requête API
   - Changer de période → Vérifier invalidation cache

2. **Test de Revenus**
   - Ajouter revenu dans /aids/revenues
   - Vérifier affichage dans Insights
   - Vérifier calcul ROAS

3. **Test de Sync**
   - Cliquer sync manuel → Vérifier loading state
   - Attendre 30 min → Vérifier auto-sync
   - Vérifier timestamps mis à jour

## Migration Future

### Optimisations Suggérées
1. Implémenter pagination pour grandes campagnes
2. Ajouter support custom date picker
3. Implémenter comparaison de périodes
4. Ajouter export CSV/Excel
5. Implémenter webhooks Meta pour real-time updates