# DigiFlow Hub v3 - ULTRA PREMIUM

🚀 Plateforme tout-en-un pour automatiser et scaler votre business avec l'IA

## 🌟 Fonctionnalités

### Applications Premium
- **Fidalyz** ⭐ - Gestion de réputation avec IA (ACTIF avec démo)
- **AIDs** 📱 - Optimisation publicitaire Meta & Google
- **SEOly** 🔍 - Agent SEO automatisé
- **Supportia** 🤖 - Support client IA
- **Salesia** 🎯 - Automatisation commerciale
- **Lexa** ⚖️ - Générateur de contrats légaux
- **CashFlow** 💰 - Gestion financière
- **Eden** 🚀 - Business Intelligence

### Design Ultra Premium
- Animation 3D Three.js interactive
- Interface glassmorphism sophistiquée
- Animations Framer Motion fluides
- Chatbot animé intégré
- Sections témoignages Bento Grid
- FAQ accordéon premium
- Footer avec animations de vagues

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/yourusername/digiflow-hub-v3.git
cd digiflow-hub-v3

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Lancer en développement
npm run dev
```

## 📦 Technologies

- **Next.js 15.5** - Framework React avec App Router
- **Three.js** - Animations 3D
- **Framer Motion** - Animations fluides
- **Tailwind CSS** - Styling
- **Chart.js** - Visualisations de données
- **JWT** - Authentification sécurisée

## 🔐 Compte Démo

```
Email: jason@behype-app.com
Mot de passe: Demo123
```

## 🎯 Démo Fidalyz

Accédez à la démo complète de Fidalyz avec :
- Dashboard interactif avec statistiques en temps réel
- Gestion des avis avec IA Zoë
- Suggestions de réponses automatiques
- Analyse de sentiment
- Posts Google Business

URL : `/demo/fidalyz`

## 📝 Structure API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Récupérer l'utilisateur

### Fidalyz
- `GET /api/fidalyz/reviews` - Liste des avis
- `POST /api/fidalyz/reviews` - Répondre à un avis
- `GET /api/fidalyz/stats` - Statistiques
- `POST /api/fidalyz/ai-suggestions` - Générer suggestions IA

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Build de production

```bash
# Build
npm run build

# Démarrer en production
npm start
```

## 🌐 Variables d'environnement

```env
JWT_SECRET=your-secret-key-here
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## 📊 Performance

- Lighthouse Score : 95+
- First Load JS : ~102 kB (optimisé)
- Temps de build : ~6 secondes
- Pages statiques pré-rendues

## 🛠️ Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## 📱 Responsive Design

- Mobile First
- Breakpoints optimisés
- Animations adaptatives
- Touch gestures support

## 🔧 Configuration Next.js

- App Router activé
- Image Optimization
- Font Optimization
- Turbopack support

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un PR.

## 📄 Licence

Propriétaire - DigiFlow © 2024

---

Développé avec 💜 par Jason Sotoca pour Behype