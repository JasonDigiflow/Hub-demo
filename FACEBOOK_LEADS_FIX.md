# 🚨 CORRECTION URGENTE : Permission leads_retrieval manquante

## Le Problème
Facebook ne propose pas automatiquement la permission `leads_retrieval` lors de la connexion. Sans cette permission, vous ne pouvez pas voir les noms de vos 106 prospects.

## Solution Immédiate

### Option 1 : Via Facebook Developer Console (Recommandé)
1. Allez sur https://developers.facebook.com/apps/1994469434647099/settings/basic/
2. Dans le menu gauche, cliquez sur **"App Review"** > **"Permissions and Features"**
3. Recherchez **"leads_retrieval"**
4. Cliquez sur **"Request"** ou **"Add to Submission"**
5. Facebook peut demander une justification, indiquez : "Pour récupérer les données des formulaires de leads générés par nos campagnes publicitaires"

### Option 2 : Utiliser Graph API Explorer
1. Allez sur https://developers.facebook.com/tools/explorer/
2. Sélectionnez votre app "Octavia AIds"
3. Cliquez sur "User or Page" > "Get User Access Token"
4. Dans les permissions, cochez :
   - ads_management ✅
   - ads_read ✅
   - business_management ✅
   - **leads_retrieval** ⚠️ (IMPORTANT!)
   - pages_manage_ads
   - pages_read_engagement
5. Cliquez sur "Generate Access Token"
6. Copiez ce token et utilisez-le dans l'app

### Option 3 : Solution Temporaire (Contournement)
Si vous ne pouvez pas obtenir leads_retrieval immédiatement, voici un workaround :

```javascript
// Utiliser l'API Pages au lieu de Ads
// Les leads sont accessibles via la Page, pas le compte publicitaire
GET /{page-id}/leadgen_forms
GET /{form-id}/leads
```

## Test Rapide
Pour vérifier si ça fonctionne, testez cette URL dans Graph API Explorer :
```
https://graph.facebook.com/v18.0/1227304415302753/leads?access_token=YOUR_TOKEN
```

Si vous obtenez les leads avec les noms, c'est gagné !

## Permissions Actuelles vs Nécessaires

### ✅ Vous avez :
- email
- ads_management
- ads_read
- business_management
- pages_read_engagement
- pages_show_list

### ❌ Il vous manque :
- **leads_retrieval** (CRITIQUE pour voir les noms)
- pages_manage_metadata (optionnel mais utile)

## Alternative : Utiliser le Page Access Token

Puisque vous avez accès à la page "Digiflow", on peut utiliser son token :

1. Le Page Access Token est : `EAAcV9ZAoq4jsBPC3B9IaUBm2gMKK0ckO8BJ6coJ4Sa5uZCoegZADkqZCwhIgJ8pYe6yyDAl4ZAOIT0Vyh5cwBunwCDBMXf71sd81PlZCPZCbJoDBkKAlkrBpOqZAceMwD7Vor6mNYhuYq4pISETOf1SRKseBA98ZAgBwCAIvZBfVbZBAdurCZBDzsfwNMA3tw1NH5wWB6W2uOsgIRG5x8tFfMECC2O3E`

2. Ce token a la permission MANAGE_LEADS selon votre test API

3. On peut modifier l'API pour utiliser ce token spécifiquement pour récupérer les leads

## Action Immédiate
Je vais modifier l'API pour utiliser le Page Access Token quand on récupère les leads.