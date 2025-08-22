# 🧪 Tester les Permissions Meta pour Débloquer Advanced Access

## Problème : Bouton "Request" grisé

Meta exige un appel API réussi avec chaque permission avant de pouvoir demander l'Advanced Access.

## 📋 Comment tester chaque permission

### 1. **read_insights** (Test créé)

```bash
# Dans votre navigateur, allez sur :
https://votre-domaine.com/api/aids/meta/test-insights

# Ou testez localement :
curl http://localhost:3000/api/aids/meta/test-insights
```

### 2. **Test Manuel via Graph API Explorer**

Plus simple et rapide :

1. Allez sur [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Sélectionnez votre app "Octavia AIds"
3. Générez un token avec les permissions nécessaires
4. Testez ces appels :

#### Pour `read_insights`:
```
GET /me/accounts
```
Puis avec l'ID de page obtenu :
```
GET /{page-id}/insights?metric=page_impressions
```

#### Pour `leads_retrieval`:
```
GET /{form-id}/leads
```

#### Pour `attribution_read`:
```
GET /{ad-account-id}/adrules_library
```

#### Pour `page_events`:
```
POST /{page-id}/events
{
  "data": [{
    "event_name": "PageView",
    "event_time": 1234567890
  }]
}
```

### 3. **Script de Test Complet**

Créez ce fichier HTML et ouvrez-le dans votre navigateur :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Permissions Meta</title>
</head>
<body>
    <h1>Test des Permissions Meta</h1>
    <button onclick="testPermissions()">Tester Toutes les Permissions</button>
    <div id="results"></div>

    <script>
        async function testPermissions() {
            const token = 'VOTRE_ACCESS_TOKEN'; // Copiez depuis Graph API Explorer
            const tests = [
                {
                    name: 'read_insights',
                    url: 'https://graph.facebook.com/v18.0/me/accounts'
                },
                {
                    name: 'ads_read',
                    url: 'https://graph.facebook.com/v18.0/act_VOTRE_AD_ACCOUNT_ID/campaigns'
                },
                {
                    name: 'leads_retrieval',
                    url: 'https://graph.facebook.com/v18.0/VOTRE_FORM_ID/leads'
                }
            ];

            for (const test of tests) {
                try {
                    const response = await fetch(`${test.url}?access_token=${token}`);
                    const data = await response.json();
                    
                    document.getElementById('results').innerHTML += 
                        `<p>${test.name}: ${data.error ? '❌ Échec' : '✅ Succès'}</p>`;
                } catch (error) {
                    document.getElementById('results').innerHTML += 
                        `<p>${test.name}: ❌ Erreur</p>`;
                }
            }
        }
    </script>
</body>
</html>
```

## 🚀 Méthode Rapide (Recommandée)

### Utilisez Graph API Explorer :

1. **Ouvrez** [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

2. **Sélectionnez** votre app "Octavia AIds"

3. **Cliquez** sur "Get Access Token"

4. **Cochez** ces permissions :
   - `read_insights`
   - `ads_read`
   - `ads_management`
   - `leads_retrieval`
   - `pages_read_engagement`
   - `business_management`

5. **Générez** le token

6. **Testez** ces requêtes une par une :

```
# Test read_insights
GET /me/accounts

# Test ads_read (remplacez AD_ACCOUNT_ID)
GET /act_123456789/campaigns

# Test leads_retrieval (remplacez FORM_ID)
GET /1227304415302753/leads

# Test business_management
GET /me/businesses
```

## ⏱️ Après les Tests

1. **Attendez 24h** après un test réussi
2. **Retournez** dans App Review → Permissions
3. **Le bouton** "Request" sera actif
4. **Cliquez** et demandez Advanced Access

## 💡 Astuce Pro

Si vous êtes pressé, utilisez directement Graph API Explorer :
- C'est l'outil officiel de Meta
- Les tests sont comptabilisés immédiatement
- Pas besoin de coder
- Résultats instantanés

## 🎯 Permissions à Tester en Priorité

1. ✅ `leads_retrieval` - Pour vos 107 prospects
2. ✅ `read_insights` - Pour les analytics
3. ✅ `ads_management` - Pour gérer les pubs
4. ✅ `ads_read` - Pour lire les données

Une fois testées, attendez 24h et les boutons "Request" seront actifs !