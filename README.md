# 🚀 DigiFlow Hub V4 - Demo

Plateforme tout-en-un de marketing digital avec modules IA intégrés.

## ✨ Modules disponibles

- **🔥 LeadWarm** : IA conversationnelle multi-canal (WhatsApp, Email, SMS)
- **💎 HubCRM** : Gestion relation client avec synchronisation en temps réel
- **🚀 Ads Master** : Centralisation des campagnes publicitaires multi-plateformes
- **🎁 Fidalyz** : Gestion e-réputation et avis clients avec IA

## 🎯 Démo en ligne

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JasonDigiflow/Hub-demo)

Accédez directement au mode démo sans authentification depuis la page de connexion.

## 🛠 Installation locale

1. Clonez le repository :
```bash
git clone https://github.com/JasonDigiflow/Hub-demo.git
cd Hub-demo
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement (optionnel) :
```bash
cp .env.local.example .env.local
# Éditez .env.local avec vos clés API
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000)

## 🎮 Mode Démo

Le mode démo fonctionne sans configuration Firebase. Les fonctionnalités sont simulées localement avec des données d'exemple.

### Accès au mode démo :
- Depuis la page de connexion, cliquez sur "Essayer le Mode Démo"
- URL directe : `/app/demo`

## 🔧 Configuration (Production)

Pour utiliser l'application en production avec de vraies données, configurez les services suivants :

### Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### APIs Marketing
```env
# Meta/Facebook
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# OpenAI/Anthropic
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# WhatsApp Business
WHATSAPP_TOKEN=your_whatsapp_token
```

## 📦 Technologies utilisées

- **Frontend** : Next.js 14, React 18, Tailwind CSS
- **Animations** : Framer Motion
- **Charts** : Recharts
- **Backend** : Firebase (Auth, Firestore, Storage)
- **IA** : OpenAI GPT-4, Anthropic Claude
- **Déploiement** : Vercel

## 🎨 Features

### Interface moderne
- Design glassmorphism avec effets de flou
- Animations fluides et transitions élégantes
- Mode sombre par défaut
- Support multilingue (FR/EN)

### Système de crédits IA
- Analyse de sentiment : 0.1 crédit
- Génération de réponse : 0.2 crédit
- Création de contenu : 0.3 crédit
- Widget personnalisé : 0.5 crédit

### Dashboard analytique
- Métriques en temps réel
- Graphiques interactifs
- Export des données
- Rapports automatisés

## 📱 Screenshots

### Hub Principal
Interface centralisée avec accès rapide aux modules et métriques clés.

### LeadWarm
Gestion des conversations multi-canal avec IA conversationnelle.

### Ads Master
Tableau de bord unifié pour toutes vos campagnes publicitaires.

### Fidalyz
Gestion complète de votre e-réputation et avis clients.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 💬 Support

Pour toute question ou assistance :
- Email : tech@digiflow-agency.fr
- Issues : [GitHub Issues](https://github.com/JasonDigiflow/Hub-demo/issues)

## 🙏 Remerciements

- [Vercel](https://vercel.com) pour l'hébergement
- [Firebase](https://firebase.google.com) pour le backend
- [OpenAI](https://openai.com) & [Anthropic](https://anthropic.com) pour les APIs IA

---

**DigiFlow Hub** - Transformez votre marketing digital avec l'IA 🚀

Développé avec ❤️ par [DigiFlow Agency](https://digiflow-agency.fr)