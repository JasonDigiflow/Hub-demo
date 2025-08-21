# Guide des Tokens et Identifiants Meta/Facebook

## 🔑 Les différents identifiants Meta

### 1. **Meta App ID** ✅ (Vous l'avez)
- **Qu'est-ce que c'est** : L'identifiant unique de votre application Facebook
- **Où le trouver** : Facebook Developers > Votre App > Settings > Basic
- **Format** : Une série de chiffres (ex: `1994469434647099`)
- **Usage** : Public, utilisé côté client pour initialiser le SDK

### 2. **Meta App Secret** ❓ (Optionnel pour votre cas)
- **Qu'est-ce que c'est** : Une clé secrète pour sécuriser les appels serveur
- **Où le trouver** : 
  1. Allez sur https://developers.facebook.com
  2. Sélectionnez votre app
  3. Settings > Basic
  4. Cherchez "App Secret" (avec un bouton "Show")
  5. Cliquez sur "Show" et entrez votre mot de passe Facebook
- **Format** : Une chaîne de 32 caractères alphanumériques
- **Usage** : PRIVÉ, ne jamais exposer côté client
- **IMPORTANT** : Vous n'en avez PAS BESOIN pour la connexion OAuth basique !

### 3. **Meta Access Token** ✅ (Vous l'avez)
- **Qu'est-ce que c'est** : Un token temporaire pour accéder à l'API
- **Où le trouver** : 
  - Graph API Explorer
  - Ou généré après connexion OAuth
- **Format** : Une longue chaîne de caractères
- **Durée de vie** : 
  - Court terme : 1-2 heures
  - Long terme : 60 jours
- **Usage** : Pour faire des appels API

### 4. **Meta Ad Account ID** ✅ (Vous l'avez)
- **Qu'est-ce que c'est** : L'ID de votre compte publicitaire
- **Où le trouver** : Business Manager > Ad Accounts
- **Format** : `act_XXXXXXXXXXXX`
- **Usage** : Pour accéder aux données publicitaires spécifiques

## ✅ Ce dont vous avez VRAIMENT besoin

Pour faire fonctionner AIDs avec la connexion Facebook, vous avez besoin de :

1. **Meta App ID** ✅ (Public) - Pour initialiser le SDK
2. **Meta Access Token** ✅ (Obtenu après connexion) - Pour les appels API
3. **Meta Ad Account ID** ✅ (Sélectionné après connexion) - Pour cibler le bon compte

**Le App Secret n'est PAS nécessaire** pour :
- La connexion OAuth via le bouton Facebook
- L'utilisation basique de l'API
- La gestion des campagnes via l'interface

## 📝 Configuration minimale requise

Dans votre `.env.local`, vous avez juste besoin de :

```env
# Configuration Meta (Facebook)
NEXT_PUBLIC_META_APP_ID=1994469434647099

# Optionnel - pour tests en local
META_ACCESS_TOKEN=votre_token_de_test
META_AD_ACCOUNT_ID=act_votre_compte
```

## 🔄 Flux de connexion

1. **L'utilisateur clique sur "Se connecter avec Facebook"**
   - Utilise seulement `NEXT_PUBLIC_META_APP_ID`

2. **Facebook demande les permissions**
   - L'utilisateur accepte

3. **Facebook renvoie un Access Token**
   - Stocké temporairement côté client
   - Envoyé au serveur pour validation

4. **L'utilisateur sélectionne son Ad Account**
   - L'ID est stocké dans la session

5. **Les appels API utilisent**
   - L'Access Token de l'utilisateur
   - L'Ad Account ID sélectionné

## ⚠️ Notes importantes

- **Ne mettez PAS le App Secret dans NEXT_PUBLIC_** (il serait exposé)
- **L'Access Token expire** - Implémentez un refresh si nécessaire
- **Pour la production** : Utilisez les tokens de chaque utilisateur, pas un token global

## 🚀 Pour commencer

Vous avez déjà tout ce qu'il faut ! 
- Laissez le `META_APP_SECRET` vide ou supprimez la ligne
- La connexion OAuth fonctionnera parfaitement sans

## 📊 Hiérarchie des permissions

```
Facebook User Account
    └── Business Manager
        └── Ad Account (act_xxx)
            ├── Campaigns
            ├── Ad Sets
            └── Ads
```

Chaque utilisateur qui se connecte donnera accès à SES propres comptes publicitaires.