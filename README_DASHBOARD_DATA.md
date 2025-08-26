# Documentation Dashboard AIDs - Intégration Meta Marketing API

## Vue d'ensemble

Cette documentation décrit l'intégration complète du dashboard AIDs avec l'API Marketing de Meta (Facebook/Instagram), permettant d'afficher les vraies données publicitaires au lieu de données fictives.

## Architecture

### Endpoints API créés

#### 1. `/api/aids/meta/campaigns`
Récupère la liste des campagnes publicitaires avec leurs statuts et insights optionnels.

**Paramètres:**
- `include_insights` (boolean): Inclure les métriques de performance
- `level` (string): Niveau de détail (`campaign`, `adset`, `ad`)

**Réponse:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "120228682985880616",
      "name": "Campagne Lead Generation",
      "status": "ACTIVE",
      "objective": "LEAD_GENERATION",
      "insights": {
        "spend": 245.67,
        "impressions": 45678,
        "clicks": 1234,
        "conversions": 56,
        "ctr": 2.7,
        "cpc": 0.20
      }
    }
  ],
  "timestamp": "2025-08-26T16:00:00Z"
}
```

#### 2. `/api/aids/meta/insights`
Récupère les métriques globales et détaillées avec support des breakdowns.

**Paramètres:**
- `time_range` ou `range`: Période (`today`, `yesterday`, `last_7d`, `last_30d`, `lifetime`)
- `breakdowns`: Dimensions d'analyse (`age`, `gender`, `publisher_platform`, `region`)
- `time_increment`: Granularité temporelle (1 pour quotidien)

**Réponse:**
```json
{
  "success": true,
  "insights": {
    "spend": "1234.56",
    "impressions": 234567,
    "clicks": 5678,
    "ctr": "2.42",
    "cpc": "0.22",
    "cpm": "5.26",
    "conversions": 123,
    "conversion_value": "4567.89",
    "roas": "3.70",
    "daily_data": [...],
    "breakdown_data": [...],
    "has_revenue_data": true
  },
  "timestamp": "2025-08-26T16:00:00Z"
}
```

## Métriques et KPIs

### Formules de calcul

- **CTR (Click-Through Rate)**: `(clicks / impressions) * 100`
- **CPC (Cost Per Click)**: `spend / clicks`
- **CPM (Cost Per Mille)**: `(spend / impressions) * 1000`
- **ROAS (Return On Ad Spend)**: `conversion_value / spend`
- **Cost Per Conversion**: `spend / conversions`
- **Conversion Rate**: `(conversions / clicks) * 100`

### Métriques disponibles

#### Métriques obligatoires (toujours disponibles)
- `spend`: Dépenses publicitaires
- `impressions`: Nombre d'affichages
- `clicks`: Nombre de clics
- `reach`: Portée unique
- `frequency`: Fréquence moyenne

#### Métriques conditionnelles
- `conversions`: Disponible si pixel/SDK configuré
- `conversion_value`: Disponible si tracking des achats actif
- `action_values`: Valeurs des actions (achats, leads, etc.)

### Gestion des données manquantes

Si les données de revenu ne sont pas disponibles:
- Le dashboard affiche "Données de revenu non disponibles"
- Les métriques ROAS et valeur de conversion sont masquées
- Seuls les conversions et cost_per_result sont affichés

## Breakdowns (Segmentation)

### Dimensions supportées

1. **Démographiques**
   - `age`: Tranches d'âge
   - `gender`: Genre (male, female, unknown)
   - `age,gender`: Combinaison âge et genre

2. **Placements**
   - `publisher_platform`: Facebook, Instagram, Audience Network
   - `platform_position`: Feed, Stories, Reels, etc.
   - `impression_device`: Mobile, Desktop, Tablet

3. **Géographiques**
   - `region`: Régions/États
   - `country`: Pays (si multi-pays)

### Utilisation des breakdowns

```javascript
// Exemple: Récupérer les insights par âge et genre
const response = await fetch('/api/aids/meta/insights?breakdowns=age,gender&time_range=last_7d');
```

## Stratégie de cache

### Durée de cache
- **60 secondes** pour tous les endpoints
- Évite les limites de rate de l'API Meta
- Réduit la latence pour les requêtes répétées

### Implémentation
```javascript
const CACHE_DURATION = 60 * 1000; // 60 secondes
const cache = new Map();

// Vérification du cache
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return cached.data;
}
```

## Sécurité

### Protection du token
- Token Meta stocké côté serveur uniquement
- Jamais exposé au frontend
- Transmission via cookies sécurisés (`meta_session`)

### Authentification
```javascript
// Vérification de l'authentification
const sessionCookie = cookieStore.get('meta_session');
if (!sessionCookie) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
```

## Limitations et contraintes

### Limites API Meta
- **Rate limits**: 200 appels/heure par utilisateur
- **Pagination**: Max 50 résultats par page
- **Délai de données**: Jusqu'à 3 heures pour les métriques récentes

### Données non disponibles
Si certaines métriques ne sont pas disponibles:
- Afficher explicitement "Non disponible" (pas 0)
- Griser les sections concernées
- Afficher un message explicatif

## Intégration Frontend

### Types TypeScript recommandés

```typescript
interface GlobalKpi {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  conversion_value?: number;
  roas?: number;
}

interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  daily_spend: number;
  results: number;
  cost_per_result: number;
}

interface BreakdownRow {
  dimension: string;
  value: string;
  metrics: GlobalKpi;
}
```

### Gestion des états de chargement

```javascript
// Skeleton loader pendant le fetch
{loading ? (
  <SkeletonLoader />
) : data ? (
  <DataDisplay />
) : (
  <NoDataMessage />
)}
```

## Déploiement et tests

### Variables d'environnement requises
```env
# Pas nécessaire si utilisation de cookies
# Le token Meta est stocké dans la session
```

### Commandes de test

```bash
# Tester l'endpoint campaigns
curl https://digiflow-hub.com/api/aids/meta/campaigns?include_insights=true

# Tester les insights avec breakdowns
curl https://digiflow-hub.com/api/aids/meta/insights?breakdowns=age,gender&time_range=last_7d
```

## Critères de validation

✅ **Données réelles uniquement** - Aucune donnée fictive
✅ **Métriques Meta API** - Toutes les métriques proviennent de l'API
✅ **Gestion des erreurs** - Messages clairs si données indisponibles
✅ **Cache intelligent** - 60 secondes pour éviter les limites
✅ **Sécurité token** - Token jamais exposé au frontend
✅ **Breakdowns fonctionnels** - Age, genre, placements disponibles
✅ **Timestamp de synchro** - "Dernière synchro" visible

## Support et dépannage

### Erreurs courantes

1. **"Not authenticated"**
   - Vérifier la connexion Meta
   - Reconnecter le compte si nécessaire

2. **"No data available"**
   - Vérifier que des campagnes sont actives
   - Attendre 3h après création de campagne

3. **Rate limit exceeded**
   - Attendre 1 heure
   - Le cache devrait limiter ce problème

### Logs de débogage

Les logs sont disponibles dans:
- Console navigateur (frontend)
- Logs serveur Next.js (backend)
- `/api/aids/logs` pour l'historique

---

*Document créé le 26/08/2025*
*Version 1.0*