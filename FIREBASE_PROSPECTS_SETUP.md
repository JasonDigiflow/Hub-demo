# 🚀 Configuration Firebase Prospects & Auto-Sync Meta

## ✅ Système Implémenté

### 1. **Stockage Firebase**
Les prospects sont maintenant stockés dans Firebase dans la collection `aids_prospects` au lieu de localStorage.

**Structure de la collection:**
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  metaId: "LEAD_xxx", // ID unique de Meta
  name: "Jean Dupont",
  email: "jean@example.com",
  phone: "0612345678",
  company: "Entreprise ABC",
  source: "Facebook",
  status: "new|contacted|qualified|closing|converted|lost",
  revenueAmount: 1500, // Si status = closing
  closingDate: "2024-08-20T10:00:00Z",
  syncedFromMeta: true,
  createdAt: "2024-08-20T10:00:00Z",
  updatedAt: "2024-08-20T10:00:00Z",
  syncedAt: "2024-08-20T10:00:00Z",
  rawData: {} // Données brutes de Meta
}
```

### 2. **APIs Créées**

#### Prospects CRUD
- `GET /api/aids/prospects` - Liste tous les prospects de l'utilisateur
- `POST /api/aids/prospects` - Créer un nouveau prospect
- `PUT /api/aids/prospects` - Import en masse (pour Meta sync)
- `GET /api/aids/prospects/[id]` - Obtenir un prospect spécifique
- `PUT /api/aids/prospects/[id]` - Mettre à jour un prospect
- `DELETE /api/aids/prospects/[id]` - Supprimer un prospect

#### Synchronisation Meta
- `GET /api/aids/meta/leads` - Récupère et sauvegarde automatiquement les leads Meta
- `GET /api/aids/meta/direct-leads` - Import direct avec token hardcodé (106 prospects)

#### Webhooks & Auto-Sync
- `GET/POST /api/aids/meta/webhook` - Webhook pour recevoir les nouveaux leads en temps réel
- `POST /api/aids/meta/auto-sync` - Endpoint pour synchronisation périodique (cron job)
- `GET /api/aids/meta/auto-sync` - Vérifier le statut de la synchronisation

### 3. **Migration Automatique**
Lors du premier chargement, si des prospects existent dans localStorage, ils sont automatiquement migrés vers Firebase.

## 🔧 Configuration Meta Webhooks

### Étape 1: Configuration dans Meta App Dashboard

1. Allez sur [Facebook Developers](https://developers.facebook.com/apps/1994469434647099)
2. Dans le menu gauche, cliquez sur **"Webhooks"**
3. Sélectionnez **"Page"** comme produit
4. Cliquez sur **"Ajouter un abonnement"**

### Étape 2: Configurer l'URL du Webhook

**URL de callback:**
```
https://votre-domaine.com/api/aids/meta/webhook
```

**Verify Token:**
```
digiflow_webhook_2024
```

### Étape 3: S'abonner aux événements

Cochez les événements suivants:
- ✅ `leadgen` - Pour recevoir les nouveaux leads
- ✅ `feed` - Optionnel, pour les interactions

### Étape 4: Variables d'environnement

Ajoutez dans votre `.env.local`:
```env
# Webhook Meta
META_WEBHOOK_VERIFY_TOKEN=digiflow_webhook_2024
META_APP_SECRET=votre_app_secret_ici
META_PAGE_ACCESS_TOKEN=EAAcV9ZAoq4jsB...

# Pour l'auto-sync (optionnel)
CRON_SECRET=secret_pour_cron_jobs_2024
```

## ⚡ Configuration Auto-Sync (Cron Job)

### Option 1: Vercel Cron (Recommandé)

Créez `vercel.json` à la racine:
```json
{
  "crons": [{
    "path": "/api/aids/meta/auto-sync",
    "schedule": "0 */6 * * *"
  }]
}
```

Cela synchronisera les leads toutes les 6 heures.

### Option 2: Service Externe (Cron-job.org)

1. Créez un compte sur [cron-job.org](https://cron-job.org)
2. Créez un nouveau job:
   - **URL:** `https://votre-domaine.com/api/aids/meta/auto-sync`
   - **Method:** POST
   - **Headers:** `Authorization: Bearer votre_cron_secret`
   - **Schedule:** Every 6 hours

### Option 3: GitHub Actions

Créez `.github/workflows/sync-meta-leads.yml`:
```yaml
name: Sync Meta Leads

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          curl -X POST https://votre-domaine.com/api/aids/meta/auto-sync \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 📊 Flux de Données

```mermaid
graph TD
    A[Lead Form Facebook] -->|Webhook| B[/api/aids/meta/webhook]
    A -->|Polling| C[/api/aids/meta/auto-sync]
    A -->|Manual Sync| D[/api/aids/meta/leads]
    
    B --> E[Firebase: aids_prospects]
    C --> E
    D --> E
    
    E --> F[Page Prospects]
    E --> G[Page Revenues]
    
    G -->|Update Status| E
```

## 🔍 Debug & Monitoring

### Vérifier les Webhooks
```bash
# Dans la console du navigateur
fetch('/api/aids/meta/auto-sync', {
  method: 'GET',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### Logs Firebase
Les prospects synchronisés ont ces champs spéciaux:
- `syncedFromMeta: true` - Vient de Meta
- `webhookReceived: true` - Reçu via webhook
- `autoSynced: true` - Synchronisé automatiquement

### Test Manuel de Sync
```bash
# Déclencher une sync manuelle
curl -X POST http://localhost:3000/api/aids/meta/auto-sync \
  -H "Authorization: Bearer votre_cron_secret"
```

## 🚨 Troubleshooting

### Problème: Prospects en double
**Solution:** Le système vérifie `metaId` pour éviter les doublons. Si vous avez des doublons, vérifiez que `metaId` est bien unique.

### Problème: Webhook ne reçoit pas les leads
**Solutions:**
1. Vérifiez que l'URL est accessible publiquement
2. Vérifiez le Verify Token
3. Vérifiez les permissions de la Page (MANAGE_LEADS)
4. Dans Meta App Dashboard, vérifiez que le webhook est "Active"

### Problème: Auto-sync ne fonctionne pas
**Solutions:**
1. Vérifiez `CRON_SECRET` dans `.env.local`
2. Vérifiez que l'utilisateur a `metaSession` et `selectedAdAccount` dans Firebase
3. Vérifiez les logs Vercel/serveur

## 📈 Améliorations Futures

1. **Notifications temps réel** - Ajouter des notifications push quand un nouveau lead arrive
2. **Mapping Page-User** - Associer spécifiquement des pages Facebook à des utilisateurs
3. **Historique de sync** - Garder un log des synchronisations dans Firebase
4. **Rate limiting** - Ajouter des limites pour éviter les abus
5. **Queue system** - Utiliser une queue pour traiter les webhooks de manière asynchrone

## 💡 Notes Importantes

- Les prospects sont maintenant **persistants** dans Firebase
- La synchronisation est **incrémentale** (ne re-télécharge pas les leads existants)
- Le système supporte **plusieurs utilisateurs** avec isolation des données
- **Fallback to localStorage** si Firebase est indisponible
- Les webhooks retournent toujours **200 OK** pour éviter les retry de Meta

---

*Dernière mise à jour: 20/08/2024*