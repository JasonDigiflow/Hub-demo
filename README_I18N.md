# DigiFlow Hub - Internationalisation (i18n)

## 🌍 Vue d'ensemble

DigiFlow Hub supporte le multilinguisme avec le français (FR) comme langue par défaut et l'anglais (EN) comme langue secondaire.

## 📁 Structure des fichiers

```
/messages/
  ├── fr.json    # Traductions françaises
  └── en.json    # Traductions anglaises

/components/
  └── LanguageSwitcher.js  # Composant de sélection de langue

/i18n.config.js  # Configuration des langues
/app/i18n.js     # Configuration next-intl
```

## 🔧 Configuration

### Langues supportées
```javascript
// i18n.config.js
export const locales = ['fr', 'en'];
export const defaultLocale = 'fr';
```

## 💻 Utilisation dans les composants

### Client Components
```jsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('overview')}</p>
    </div>
  );
}
```

### Server Components
```jsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### API Routes
```javascript
import { getTranslations } from 'next-intl/server';

export async function GET(request) {
  const t = await getTranslations('auth');
  
  return NextResponse.json({
    message: t('loginSuccess')
  });
}
```

## 📝 Structure des traductions

### Organisation par namespace
```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "metrics": "Métriques"
  },
  "prospects": {
    "title": "Prospects",
    "addProspect": "Ajouter un prospect"
  }
}
```

### Utilisation avec namespace
```jsx
const t = useTranslations('prospects');
t('title');        // "Prospects"
t('addProspect');  // "Ajouter un prospect"
```

## 🔄 Changement de langue

### Composant LanguageSwitcher
```jsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### Persistance
- LocalStorage : `locale`
- Cookie : `NEXT_LOCALE`
- La langue sélectionnée persiste entre les sessions

## ➕ Ajouter une nouvelle langue

### 1. Créer le fichier de traduction
```bash
cp messages/en.json messages/es.json
# Traduire le contenu en espagnol
```

### 2. Mettre à jour la configuration
```javascript
// i18n.config.js
export const locales = ['fr', 'en', 'es'];
export const localeNames = {
  fr: 'Français',
  en: 'English',
  es: 'Español'
};
```

### 3. Tester
- Le nouveau language apparaît dans le switcher
- Les traductions sont appliquées

## 📋 Conventions de nommage

### Clés de traduction
- **camelCase** pour les clés : `addProspect`, `syncNow`
- **Namespace** logique : `auth`, `dashboard`, `prospects`
- **Hiérarchie** claire : `prospects.status.new`

### Fichiers
- Un namespace = un objet principal
- Grouper par fonctionnalité
- Maximum 3 niveaux de profondeur

## 🎯 Bonnes pratiques

### 1. Variables dans les traductions
```json
{
  "welcome": "Bienvenue {name}!"
}
```
```jsx
t('welcome', { name: 'John' }); // "Bienvenue John!"
```

### 2. Pluriels
```json
{
  "items": {
    "one": "{count} élément",
    "other": "{count} éléments"
  }
}
```
```jsx
t('items', { count: 1 });  // "1 élément"
t('items', { count: 5 });  // "5 éléments"
```

### 3. Dates et nombres
```jsx
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();
  
  return (
    <div>
      {format.dateTime(new Date())}
      {format.number(1234.56)}
    </div>
  );
}
```

## 🔍 Debug et tests

### Vérifier les traductions manquantes
```javascript
// En développement, next-intl affiche des warnings
// pour les clés manquantes dans la console
```

### Tester le changement de langue
1. Cliquer sur le language switcher
2. Sélectionner une langue
3. Vérifier que toute l'UI est traduite
4. Rafraîchir la page (doit conserver la langue)

## 📚 Namespaces disponibles

- `common` : Termes généraux
- `auth` : Authentification
- `dashboard` : Tableau de bord
- `prospects` : Gestion des prospects
- `revenues` : Gestion des revenus
- `insights` : Analyses et rapports
- `settings` : Paramètres
- `sync` : Synchronisation
- `adAccounts` : Comptes publicitaires
- `logs` : Journaux système

## 🚀 Utilisation pour les screencasts Meta

Pour les screencasts de l'App Review Meta :
1. Basculer en anglais via le switcher
2. L'interface complète passe en anglais
3. Faire le screencast
4. Rebasculer en français après

## ⚠️ Points d'attention

- **SSR** : Les traductions côté serveur utilisent les cookies
- **CSR** : Les traductions côté client utilisent localStorage
- **Hydration** : Assurez-vous que les langues correspondent
- **Performance** : Les fichiers de traduction sont chargés à la demande

---
*Dernière mise à jour : 29/08/2024*