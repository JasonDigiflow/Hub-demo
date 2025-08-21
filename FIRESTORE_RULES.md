# Règles de Sécurité Firestore

## ⚠️ IMPORTANT : Configurez ces règles dans Firebase Console

Allez dans **Firebase Console → Firestore Database → Rules** et remplacez les règles par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture/écriture temporairement pour le développement
    // IMPORTANT: Sécurisez ces règles en production !
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || request.auth.uid == resource.data.uid);
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Organizations collection
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // AIDs revenues collection
    match /aids_revenues/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Temporary: Allow all for development
    // REMOVE THIS IN PRODUCTION
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Pour un accès temporaire complet (DÉVELOPPEMENT UNIQUEMENT) :

Si vous voulez tester rapidement, utilisez ces règles TRÈS PERMISSIVES :

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

⚠️ **ATTENTION** : Ces règles permettent à TOUT LE MONDE de lire/écrire. 
À utiliser uniquement pour le développement et les tests !

## Comment appliquer les règles :

1. Allez sur : https://console.firebase.google.com
2. Sélectionnez votre projet
3. **Firestore Database** → **Rules**
4. Remplacez le contenu par les règles ci-dessus
5. Cliquez sur **Publish**

## Vérification :

Après avoir publié les règles, testez :
1. Créez un compte sur /auth/register
2. Connectez-vous sur /auth/login
3. Les deux devraient fonctionner sans erreur

## Règles de production recommandées :

Pour la production, utilisez des règles plus strictes basées sur l'authentification et les rôles d'organisation.