# Configuration Meta/Facebook pour DigiFlow Hub

## Variables d'Environnement Requises

### 1. Meta App ID (Obligatoire)
```env
NEXT_PUBLIC_META_APP_ID=1994469434647099
```
✅ **Déjà configuré dans le code**

### 2. Meta App Secret (Optionnel mais recommandé)
```env
META_APP_SECRET=votre_app_secret_ici
```

**Où le trouver :**
1. Allez sur https://developers.facebook.com/apps/1994469434647099/settings/basic/
2. Cliquez sur "Afficher" à côté de "Clé secrète de l'app"
3. Entrez votre mot de passe Facebook
4. Copiez la clé secrète

⚠️ **IMPORTANT** : Ne jamais exposer cette clé côté client (pas de NEXT_PUBLIC_)

### 3. Configuration Vercel (Production)

Dans Vercel, ajoutez ces variables d'environnement :

```env
# Meta/Facebook
META_APP_SECRET=votre_app_secret_ici

# Firebase (si utilisé)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# JWT pour sessions
JWT_SECRET=votre_secret_jwt_random_ici
```

## Vérification de la Configuration

### 1. Vérifier l'App ID
L'App ID `1994469434647099` est déjà configuré dans :
- `/app/app/aids/connect/page.js` (ligne 32)

### 2. Permissions Requises
Votre app Meta doit avoir accès à :
- ✅ email
- ✅ ads_management
- ✅ ads_read
- ✅ business_management
- ✅ pages_read_engagement
- ✅ leads_retrieval
- ✅ pages_manage_metadata
- ✅ pages_manage_ads

### 3. Configuration de l'App Meta

#### URL de redirection OAuth
Dans les paramètres de votre app Meta :
1. Allez dans "Facebook Login" > "Paramètres"
2. Ajoutez ces URI de redirection OAuth valides :
   - https://digiflow-hub.vercel.app/
   - https://digiflow-hub.vercel.app/app/aids/connect
   - http://localhost:3000/ (pour dev local)
   - http://localhost:3000/app/aids/connect (pour dev local)

#### Domaines de l'app
Dans "Paramètres" > "De base" :
- Domaines de l'app : `digiflow-hub.vercel.app`

#### URL de la politique de confidentialité
- https://digiflow-hub.vercel.app/privacy

#### URL des conditions d'utilisation
- https://digiflow-hub.vercel.app/terms

## Résolution du Problème des Leads

### Pourquoi les leads n'apparaissaient pas ?

❌ **Ancien code (incorrect)** :
```javascript
// L'endpoint leadgen_forms n'existe pas sur AdAccount
`/v18.0/${accountId}/leadgen_forms`
```

✅ **Nouveau code (correct)** :
```javascript
// Les leads doivent être récupérés via les ads
`/v18.0/${accountId}/ads?fields=leads{...}`
```

### La nouvelle API v2 fait :
1. Récupère tous les ads du compte
2. Pour chaque ad, récupère les leads associés
3. Pagine automatiquement pour récupérer TOUS les leads
4. Évite les doublons avec un Set de IDs

## Test de l'API

### 1. Test Direct (Browser)
Remplacez `ACCESS_TOKEN` par votre token :
```
https://graph.facebook.com/v18.0/act_4049756585295162/ads?fields=id,name,status,leads{id,created_time,field_data}&access_token=ACCESS_TOKEN
```

### 2. Test via l'App
1. Allez sur https://digiflow-hub.vercel.app/app/aids/prospects
2. Cliquez sur "Synchroniser avec Meta"
3. Vérifiez les logs sur /app/aids/logs

### 3. Debug Avancé
Utilisez la page de debug : https://digiflow-hub.vercel.app/app/aids/debug-leads

## Checklist de Déploiement

- [ ] Meta App ID configuré
- [ ] Meta App Secret dans les variables d'environnement (Vercel)
- [ ] URLs de redirection OAuth configurées dans Meta
- [ ] Domaine de l'app configuré dans Meta
- [ ] Politique de confidentialité et CGU ajoutées
- [ ] JWT_SECRET configuré pour les sessions
- [ ] Firebase configuré (si utilisé)
- [ ] Test de connexion/déconnexion fonctionnel
- [ ] Test de synchronisation des leads fonctionnel

## Support

Si les leads n'apparaissent toujours pas :
1. Vérifiez que votre compte a bien des ads actives avec des leads
2. Consultez les logs : /app/aids/logs
3. Utilisez l'outil de debug : /app/aids/debug-leads
4. Vérifiez les permissions de votre token dans Meta Business Manager

---
**Dernière mise à jour :** Décembre 2024
**Version API :** v18.0