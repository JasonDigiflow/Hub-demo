# Guide de Configuration Facebook pour AIDs

## 📋 Prérequis
- Un compte Facebook Business
- Accès à un compte publicitaire Facebook
- L'App ID : `1994469434647099`

## 🔧 Configuration dans Facebook Developers

### 1. Accédez à Facebook Developers
- Allez sur : https://developers.facebook.com
- Connectez-vous avec votre compte Facebook
- Sélectionnez votre app ou créez-en une nouvelle

### 2. Configuration de base de l'application

#### A. Paramètres de base (Settings > Basic)
- **App ID**: `1994469434647099` (déjà configuré)
- **Display Name**: DigiFlow Hub
- **Contact Email**: Votre email
- **Privacy Policy URL**: `https://digiflow-hub-v3-five.vercel.app/privacy`
- **Terms of Service URL**: `https://digiflow-hub-v3-five.vercel.app/terms`
- **Data Deletion Instructions URL**: `https://digiflow-hub-v3-five.vercel.app/data-deletion`

#### B. Domaines de l'application (Settings > Basic > App Domains)
Ajoutez ces domaines :
```
digiflow-hub-v3-five.vercel.app
localhost
```

### 3. Configuration Facebook Login

#### A. Accédez à Facebook Login > Settings
Configurez les paramètres suivants :

#### B. Client OAuth Settings

**Valid OAuth Redirect URIs** (URIs de redirection OAuth valides) :
```
https://digiflow-hub-v3-five.vercel.app/app/aids/connect
https://digiflow-hub-v3-five.vercel.app/facebook/callback
http://localhost:3000/app/aids/connect
http://localhost:3000/facebook/callback
http://localhost:3005/app/aids/connect
http://localhost:3005/facebook/callback
```

**Deauthorize Callback URL** :
```
https://digiflow-hub-v3-five.vercel.app/api/aids/meta/disconnect
```

**Data Deletion Callback URL** :
```
https://digiflow-hub-v3-five.vercel.app/api/aids/meta/delete-data
```

#### C. Web OAuth Login
- ✅ Activez "Web OAuth Login"

#### D. Enforce HTTPS
- ✅ Activez "Enforce HTTPS" (pour la production)

### 4. Permissions et Fonctionnalités

#### A. Dans App Review > Permissions and Features
Demandez l'accès aux permissions suivantes :
- `email` (par défaut)
- `ads_management` - Pour gérer les campagnes
- `ads_read` - Pour lire les données publicitaires
- `business_management` - Pour accéder aux comptes Business
- `pages_read_engagement` - Pour lire l'engagement des pages

### 5. Business Verification (Optionnel mais recommandé)
- Allez dans Settings > Business Verification
- Suivez le processus de vérification de votre entreprise
- Cela débloque plus de permissions et augmente les limites d'API

### 6. Mode Live
- Une fois tout configuré, passez votre app en mode "Live"
- Settings > Basic > App Mode > Toggle to "Live"

## 🔐 Variables d'environnement

Assurez-vous d'avoir ces variables dans votre `.env.local` :
```env
# Meta/Facebook
NEXT_PUBLIC_META_APP_ID=1994469434647099
META_APP_SECRET=YOUR_APP_SECRET_HERE  # Trouvez-le dans Settings > Basic
```

## 🧪 Test de la connexion

1. Allez sur : https://digiflow-hub-v3-five.vercel.app/app/aids/connect
2. Cliquez sur "Se connecter avec Facebook"
3. Autorisez les permissions demandées
4. Sélectionnez votre compte publicitaire
5. Vous êtes connecté !

## ⚠️ Problèmes courants

### "Invalid OAuth redirect URI"
- Vérifiez que l'URL exacte est dans les Valid OAuth Redirect URIs
- Attention aux trailing slashes et au protocole (http vs https)

### "App not active"
- Assurez-vous que l'app est en mode "Live"
- Vérifiez que votre domaine est bien ajouté

### "Insufficient permissions"
- Les permissions avancées nécessitent une App Review
- En mode développement, seuls les testeurs de l'app ont accès

## 📝 Notes importantes

1. **Mode Développement** : Seuls les utilisateurs ajoutés comme testeurs peuvent se connecter
2. **App Review** : Pour une utilisation publique, soumettez votre app à Facebook pour review
3. **Limites d'API** : Respectez les rate limits de l'API Facebook
4. **Token Expiration** : Les tokens Facebook expirent, implémentez un refresh automatique

## 🔗 Liens utiles
- [Facebook Developers Console](https://developers.facebook.com)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)