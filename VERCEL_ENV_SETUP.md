# Configuration des Variables d'Environnement sur Vercel

## Variables Firebase Requises

Vous devez ajouter ces variables dans Vercel Settings → Environment Variables :

### Variables pour le CLIENT (déjà ajoutées) :
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Variables pour le SERVEUR (à ajouter) :
Copiez les mêmes valeurs SANS le préfixe `NEXT_PUBLIC_` :

- `FIREBASE_API_KEY` → (même valeur que NEXT_PUBLIC_FIREBASE_API_KEY)
- `FIREBASE_AUTH_DOMAIN` → (même valeur que NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
- `FIREBASE_PROJECT_ID` → (même valeur que NEXT_PUBLIC_FIREBASE_PROJECT_ID)
- `FIREBASE_STORAGE_BUCKET` → (même valeur que NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
- `FIREBASE_MESSAGING_SENDER_ID` → (même valeur que NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
- `FIREBASE_APP_ID` → (même valeur que NEXT_PUBLIC_FIREBASE_APP_ID)

### Autres variables importantes :
- `JWT_SECRET` → (générez une clé secrète forte)
- `META_ACCESS_TOKEN` → (votre token Meta)
- `META_AD_ACCOUNT_ID` → (votre compte publicitaire Meta)
- `ANTHROPIC_API_KEY` → (votre clé API Anthropic)

## Comment ajouter les variables :

1. Allez sur https://vercel.com/your-username/digiflow-hub-v3/settings/environment-variables
2. Pour chaque variable :
   - Cliquez sur "Add New"
   - Entrez le nom de la variable
   - Collez la valeur
   - Sélectionnez tous les environnements (Production, Preview, Development)
   - Cliquez sur "Save"

## Test de configuration :

Après avoir ajouté les variables, testez sur :
https://digiflow-hub-v3-five.vercel.app/api/auth/test-firebase

Vous devriez voir :
```json
{
  "firebaseStatus": {
    "hasAuth": true,
    "hasDb": true,
    ...
  },
  "message": "Firebase is configured and ready"
}
```

## Important :

Les variables `NEXT_PUBLIC_*` sont exposées au navigateur (client).
Les variables sans préfixe sont uniquement côté serveur (sécurisées).

C'est pourquoi nous avons besoin des deux sets de variables pour que Firebase fonctionne à la fois côté client et serveur.