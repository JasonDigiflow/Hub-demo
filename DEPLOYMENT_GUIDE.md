# 🚀 Guide de Déploiement Vercel - DigiFlow Hub v3

## 📋 Prérequis

1. Compte [Vercel](https://vercel.com)
2. Compte [Firebase](https://console.firebase.google.com) (optionnel mais recommandé)
3. Compte [Anthropic](https://console.anthropic.com) (optionnel mais recommandé pour l'IA)

## 🔥 Étape 1 : Configuration Firebase (Recommandé)

### Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Cliquer sur "Créer un projet"
3. Nom : `digiflow-hub-v3`
4. Activer Google Analytics (optionnel)

### Activer Authentication

1. Dans Firebase Console → Authentication
2. Cliquer "Commencer"
3. Onglet "Sign-in method"
4. Activer "Email/Password"

### Activer Firestore

1. Dans Firebase Console → Firestore Database
2. Cliquer "Créer une base de données"
3. Choisir "Mode production"
4. Sélectionner une région (Europe-west3 pour la France)

### Récupérer les clés

1. Paramètres du projet → Général
2. Section "Vos applications" → Ajouter une app Web
3. Copier la configuration Firebase

## 🤖 Étape 2 : Configuration Anthropic (Recommandé)

1. Créer un compte sur [Anthropic Console](https://console.anthropic.com)
2. Générer une API Key
3. Copier la clé (commence par `sk-ant-`)

## 🚀 Étape 3 : Déploiement sur Vercel

### Méthode 1 : Via GitHub (Recommandé)

1. Aller sur [Vercel](https://vercel.com)
2. "New Project" → Import Git Repository
3. Sélectionner `JasonDigiflow/digiflow-hub-v3`
4. Configurer les variables d'environnement (voir ci-dessous)
5. Deploy!

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Dans le dossier du projet
vercel

# Suivre les instructions
```

## 🔐 Étape 4 : Variables d'Environnement dans Vercel

Dans Vercel → Settings → Environment Variables, ajouter :

### Variables OBLIGATOIRES

```env
JWT_SECRET=générer-une-clé-aléatoire-sécurisée-de-32-caractères
```

### Variables Firebase (Fortement recommandées)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=votre-app-id
```

### Variable Anthropic (Pour l'IA dans Fidalyz)

```env
ANTHROPIC_API_KEY=sk-ant-votre-clé
```

### Variables optionnelles

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

## ✅ Étape 5 : Vérification

Après le déploiement :

1. Accéder à votre URL Vercel
2. Tester la connexion avec le compte démo :
   - Email : `jason@behype-app.com`
   - Password : `Demo123`
3. Accéder à `/demo/fidalyz`
4. Tester les suggestions IA

## 🎯 Fonctionnalités selon la configuration

### Sans Firebase ni Anthropic
- ✅ Site vitrine complet
- ✅ Animations 3D
- ✅ Compte démo fonctionnel
- ✅ Mock data pour Fidalyz
- ⚠️ Pas de persistance des données
- ⚠️ Suggestions IA pré-définies

### Avec Firebase seulement
- ✅ Tout ce qui précède +
- ✅ Authentification réelle
- ✅ Persistance des données
- ✅ Multi-utilisateurs
- ⚠️ Suggestions IA pré-définies

### Avec Firebase + Anthropic (COMPLET)
- ✅ Tout ce qui précède +
- ✅ Suggestions IA en temps réel avec Claude
- ✅ Analyse de sentiment avancée
- ✅ Génération de posts personnalisés
- ✅ Expérience Fidalyz complète

## 🆘 Dépannage

### Erreur de build
```bash
# Vérifier en local
npm run build
```

### Variables d'environnement non reconnues
- Vérifier dans Vercel → Settings → Environment Variables
- Redéployer après ajout de variables

### Firebase Auth ne fonctionne pas
1. Vérifier que Email/Password est activé dans Firebase
2. Vérifier le domaine autorisé dans Firebase → Authentication → Settings

### Anthropic ne génère pas de suggestions
1. Vérifier le crédit disponible sur votre compte Anthropic
2. Vérifier que la clé API est correcte

## 📱 Domaine personnalisé

1. Dans Vercel → Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions Vercel

## 🔄 Mises à jour

Pour déployer les mises à jour :

```bash
git add .
git commit -m "Votre message"
git push origin main
```

Vercel redéploiera automatiquement !

## 📞 Support

- Issues GitHub : [github.com/JasonDigiflow/digiflow-hub-v3/issues](https://github.com/JasonDigiflow/digiflow-hub-v3/issues)
- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Documentation Firebase : [firebase.google.com/docs](https://firebase.google.com/docs)

---

💜 Développé par Jason Sotoca pour Behype