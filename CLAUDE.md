# DigiFlow Hub V3 - Documentation Claude

## 🎯 Contexte Business Important

### Statut Actuel des Applications (CRUCIAL)
- **Fidalyz** : ✅ SEULE application déployée et fonctionnelle
- **7 autres apps** : 🚧 En développement, lancement progressif Q1-Q2 2025

### Roadmap 2025
1. **Janvier** : Supportia (Claude) - Support client IA
2. **Février** : AIDs (Octavia) - Publicité digitale  
3. **Mars** : SEOly (Jerry) - Référencement
4. **Avril** : Salesia (Valérie) - Automatisation commerciale
5. **Mai** : CashFlow (Papin) - Gestion financière
6. **Juin** : Lexa - Contrats juridiques
7. **Juillet** : Eden - Business Intelligence

### Messages Clés pour le Chatbot Ava
- Fidalyz est le produit phare avec 2.5k+ utilisateurs
- Les autres apps arrivent "très prochainement"
- Proposer liste d'attente pour les apps non disponibles
- Rediriger vers démo Fidalyz en attendant

## 🤖 Système de Personas IA

### Assistante Principale
- **Ava** : Chatbot principal DigiFlow, professionnelle et proactive

### Les 8 Experts IA
1. **Clark** (Fidalyz) : Gestion réputation, empathique
2. **Octavia** (AIDs) : Publicité digitale, data-driven
3. **Jerry** (SEOly) : Expert SEO, méthodique
4. **Claude** (Supportia) : Support client, patient
5. **Valérie** (Salesia) : Commerciale, persuasive
6. **Lexa** (Lexa) : Juriste, rigoureuse
7. **Papin** (CashFlow) : Comptable, analytique
8. **Eden** (Eden) : Business analyst, visionnaire

## 🔧 Configuration Technique

### Variables d'Environnement Requises
```env
# Anthropic AI
ANTHROPIC_API_KEY=

# Firebase (optionnel pour mode démo)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# JWT
JWT_SECRET=
```

### APIs Principales
- `/api/chat` : Chatbot Ava avec contexte DigiFlow
- `/api/reviews/respond` : Clark génère des réponses aux avis (multi-tenant)

### Compte Démo
- Email : jason@behype-app.com
- Password : Demo123

## 📝 Scripts Utiles
```bash
# Développement local
npm run dev

# Build production
npm run build

# Linter
npm run lint
```

## 🚀 Déploiement
- GitHub : https://github.com/JasonDigiflow/digiflow-hub-v3
- Vercel : Auto-deploy sur push main
- Domain : digiflow-agency.fr (à configurer)

## 💡 Points d'Attention
1. SimpleChatbot utilise des styles inline (fix problème CSS Vercel)
2. Firebase conditionnel : fonctionne en mode démo si non configuré
3. Anthropic fallback : réponses prédéfinies si pas d'API key
4. Les personas ont une mémoire conversationnelle

## 🎨 Design System
- Couleurs principales : Violet (#9333ea) et Orange (#ec4899)
- Font : Inter + Space Grotesk
- Animations : Framer Motion
- 3D : Three.js (sphere animée)

## 📱 Applications Status
- Fidalyz : ✅ Active (path: /app/fidalyz)
- Autres : 🔒 Locked (coming soon)

---
Dernière mise à jour : 20/08/2025