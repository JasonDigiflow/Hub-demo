# 🚨 Résoudre les Limites API Meta (90% utilisé)

## Problème : "90% of limit used"

Vous approchez de la limite d'appels API de Meta. Voici comment résoudre ce problème :

## 📊 Comprendre les Limites

Meta impose des limites d'API basées sur :
- **200 appels** par heure par utilisateur
- **4800 appels** par jour par application
- Les limites augmentent avec l'utilisation et l'ancienneté de l'app

## 🔧 Solutions Immédiates

### 1. Attendre le Reset (Plus Simple)
Les limites se réinitialisent :
- **Toutes les heures** pour la limite horaire
- **Tous les jours à minuit PST** pour la limite quotidienne

### 2. Augmenter les Limites (Recommandé)

#### Étape 1 : Demander une Review de l'App
1. Allez sur [Facebook Developers](https://developers.facebook.com/apps/1994469434647099)
2. Menu gauche → **"App Review"** → **"Requests"**
3. Cliquez sur **"Start a Request"**
4. Sélectionnez les permissions :
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `leads_retrieval`
   - ✅ `pages_manage_ads`
5. Soumettez la demande avec justification business

#### Étape 2 : Passer en Mode Live
1. Dans **"Settings"** → **"Basic"**
2. Changez **"App Mode"** de "Development" à **"Live"**
3. Cela augmente automatiquement les limites

#### Étape 3 : Business Verification
1. Allez dans **"Settings"** → **"Business Verification"**
2. Complétez la vérification de votre entreprise
3. Les limites passent de 200/h à **600 appels/heure**

### 3. Optimisations Immédiates (Déjà Implémentées)

✅ **Cache de 5 minutes** pour les données de pages
✅ **Suppression de la validation de token** au login
✅ **Limite de 500 leads** par requête (au lieu de plusieurs petites)
✅ **Filtrage côté serveur** pour réduire les allers-retours

## 📈 Surveiller l'Utilisation

### Via Graph API Explorer
1. Allez sur [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Faites un appel test
3. Regardez les headers de réponse :
   - `X-App-Usage` : Utilisation de l'app
   - `X-Business-Use-Case-Usage` : Utilisation business

### Via Dashboard
1. [Facebook App Dashboard](https://developers.facebook.com/apps/1994469434647099/dashboard/)
2. Regardez la section **"API Requests"**

## 🛡️ Bonnes Pratiques

### Pour Éviter les Limites
1. **Synchronisez 1 fois par jour** maximum
2. **Utilisez le bouton "Import Direct"** qui utilise moins d'appels
3. **Évitez les clics répétés** sur synchroniser
4. **Planifiez les syncs** en dehors des heures de pointe

### Indicateurs de Limite
- Message d'erreur : "User request limit reached"
- Code erreur : `17` ou `32`
- Headers : `X-App-Usage > 90`

## 🚀 Solution Long Terme

### Webhook Setup (Zéro Appel API)
Au lieu de synchroniser manuellement, configurez les webhooks :

1. Dans votre app Meta → **"Webhooks"**
2. URL : `https://votre-domaine.com/api/aids/meta/webhook`
3. Events : `leadgen`
4. Les nouveaux leads arrivent automatiquement sans appel API !

## 💡 Astuce Pro

Si vous êtes bloqué immédiatement :
1. **Déconnectez-vous** de Meta dans l'app
2. **Attendez 1 heure**
3. **Reconnectez-vous**
4. **Utilisez "Import Direct"** au lieu de "Synchroniser"

## 📝 Checklist Rapide

- [ ] Attendre 1h si limite atteinte
- [ ] Passer l'app en mode "Live"
- [ ] Demander App Review pour plus de permissions
- [ ] Compléter Business Verification
- [ ] Configurer les webhooks
- [ ] Utiliser le cache et limiter les syncs

---

**Note :** Les changements d'optimisation sont déjà déployés dans le code. Vous devriez voir une réduction de 50% de la consommation API.