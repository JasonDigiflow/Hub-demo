# Checklist de Configuration Firebase

## 1. ✅ Vérifier que Firestore est activé

### Dans Firebase Console :
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. **Firestore Database** dans le menu de gauche
4. Si vous voyez "Create Database", cliquez dessus :
   - Choisissez **Production mode** ou **Test mode**
   - Sélectionnez la région (europe-west1 pour la France)
   - Cliquez sur **Enable**

### ⚠️ IMPORTANT : 
Si Firestore n'était pas activé, c'était la cause de l'erreur `PERMISSION_DENIED` !

## 2. ✅ Vérifier les règles de sécurité

Dans **Firestore Database → Rules**, assurez-vous d'avoir :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 3. ✅ Vérifier les variables d'environnement sur Vercel

Vous devez avoir DEUX sets de variables :

### Variables CLIENT (avec NEXT_PUBLIC_) :
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Variables SERVEUR (sans préfixe) :
- `FIREBASE_API_KEY` (même valeur)
- `FIREBASE_AUTH_DOMAIN` (même valeur)
- `FIREBASE_PROJECT_ID` (même valeur)
- `FIREBASE_STORAGE_BUCKET` (même valeur)
- `FIREBASE_MESSAGING_SENDER_ID` (même valeur)
- `FIREBASE_APP_ID` (même valeur)

## 4. ✅ Test de configuration

Testez ces endpoints après déploiement :

1. **Test Firebase** : https://digiflow-hub-v3-five.vercel.app/api/auth/test-firebase
   - Doit montrer `hasAuth: true` et `hasDb: true`

2. **Test Firestore** : https://digiflow-hub-v3-five.vercel.app/api/firestore/test
   - Doit montrer `testWrite: true` et `testRead: true`

## 5. 🔍 Vérifier les logs

Dans les logs Vercel, vous devriez voir :
- `Firebase Config Check: { ... isConfigured: true }`
- `Firebase initialized successfully: { app: true, auth: true, db: true }`

Si vous voyez `isConfigured: false`, les variables d'environnement ne sont pas chargées.

## 6. 🚨 Erreurs communes

### `PERMISSION_DENIED` :
- Firestore n'est pas activé dans Firebase Console
- Les règles de sécurité sont trop restrictives
- Le project ID est incorrect

### `Firebase not configured` :
- Variables d'environnement manquantes sur Vercel
- Oubli de redéployer après ajout des variables

### Users créés mais pas de données :
- Firestore n'est pas activé
- Erreur dans les règles de sécurité

## Actions immédiates :

1. **Vérifiez que Firestore est activé** dans Firebase Console
2. **Testez** : https://digiflow-hub-v3-five.vercel.app/api/firestore/test
3. **Regardez les logs** Vercel pour voir les détails d'erreur