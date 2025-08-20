export const PREMIUM_APPLICATIONS = [
  {
    id: 'fidalyz',
    name: 'Fidalyz',
    tagline: 'Reputation Manager',
    description: 'Gère toute la e-réputation : réponses aux avis, collecte, posts Google Business',
    icon: '⭐',
    color: 'from-amber-500 to-yellow-500',
    gradient: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
    status: 'active',
    features: ['Réponses IA aux avis', 'Collecte SMS/NFC', 'Posts automatiques'],
    stats: { users: '2.5k+', rating: '4.9', uptime: '99.9%' },
    path: '/app/fidalyz'
  },
  {
    id: 'aids',
    name: 'AIDs',
    tagline: 'Ads Optimizer',
    description: 'Crée et optimise les campagnes Meta & Google Ads avec IA',
    icon: '📱',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #4267B2 0%, #0084FF 100%)',
    status: 'locked',
    features: ['Créatives IA', 'A/B tests auto', 'Optimisation ROAS'],
    stats: { users: '1.8k+', rating: '4.8', savings: '42%' }
  },
  {
    id: 'seoly',
    name: 'SEOly',
    tagline: 'SEO Growth',
    description: 'Agent SEO complet : mots-clés, rédaction, backlinks',
    icon: '🔍',
    color: 'from-green-500 to-emerald-600',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    status: 'locked',
    features: ['Recherche mots-clés', 'Articles optimisés', 'Suivi positions'],
    stats: { users: '3.2k+', rating: '4.7', growth: '+156%' }
  },
  {
    id: 'supportia',
    name: 'Supportia',
    tagline: 'Customer Support AI',
    description: 'Support client automatisé : tickets, chat, emails',
    icon: '🤖',
    color: 'from-purple-500 to-violet-600',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    status: 'locked',
    features: ['Réponses automatiques', 'Gestion FAQ', 'Escalade intelligente'],
    stats: { users: '4.1k+', rating: '4.9', resolution: '89%' }
  },
  {
    id: 'salesia',
    name: 'Salesia',
    tagline: 'Acquisition & CRM',
    description: 'Automatisation commerciale : prospection, qualification, CRM',
    icon: '🎯',
    color: 'from-red-500 to-rose-600',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #EC4899 100%)',
    status: 'locked',
    features: ['Scraping leads', 'Mails personnalisés', 'Scoring automatique'],
    stats: { users: '2.7k+', rating: '4.8', conversion: '+34%' }
  },
  {
    id: 'lexa',
    name: 'Lexa',
    tagline: 'Legal & Contracts',
    description: 'Génère contrats, CGV, NDA avec suivi juridique',
    icon: '⚖️',
    color: 'from-slate-600 to-gray-700',
    gradient: 'linear-gradient(135deg, #475569 0%, #374151 100%)',
    status: 'locked',
    features: ['Contrats sur-mesure', 'Veille juridique', 'Mises à jour auto'],
    stats: { users: '1.5k+', rating: '4.9', compliance: '100%' }
  },
  {
    id: 'cashflow',
    name: 'CashFlow',
    tagline: 'Finance Manager',
    description: 'Facturation, paiements et prévisionnel de trésorerie',
    icon: '💰',
    color: 'from-emerald-500 to-teal-600',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
    status: 'locked',
    features: ['Relances impayés', 'Alertes trésorerie', 'Simulations'],
    stats: { users: '3.5k+', rating: '4.8', recovery: '+67%' }
  },
  {
    id: 'eden',
    name: 'Eden',
    tagline: 'Business Co-Pilot',
    description: 'Vue globale entreprise : KPIs, anomalies, recommandations',
    icon: '🚀',
    color: 'from-indigo-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #9333EA 100%)',
    status: 'locked',
    features: ['Dashboard unifié', 'Détection anomalies', 'Insights IA'],
    stats: { users: '5.2k+', rating: '4.9', accuracy: '96%' }
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sophie Martin",
    role: "CEO @ TechStart",
    avatar: "👩‍💼",
    rating: 5,
    text: "DigiFlow a transformé notre gestion. +300% de productivité en 3 mois.",
    highlight: "+300% productivité",
    size: 'large',
    verified: true
  },
  {
    id: 2,
    name: "Jean Dupont",
    role: "Directeur Marketing @ Scale",
    avatar: "👨‍💼",
    rating: 5,
    text: "L'IA de Fidalyz répond à nos avis 24/7. Notre note Google est passée de 3.8 à 4.7!",
    highlight: "3.8 → 4.7 ⭐",
    size: 'medium',
    verified: true
  },
  {
    id: 3,
    name: "Marie Leblanc",
    role: "CFO @ FinTech Pro",
    avatar: "👩‍💻",
    rating: 5,
    text: "CashFlow a automatisé 80% de notre facturation. ROI en 2 mois.",
    highlight: "ROI 2 mois",
    size: 'medium',
    verified: true
  },
  {
    id: 4,
    name: "Thomas Chen",
    role: "CMO @ GrowthLab",
    avatar: "👨‍💻",
    rating: 5,
    text: "AIDs a divisé notre CAC par 3 tout en doublant nos conversions.",
    highlight: "CAC ÷3",
    size: 'small',
    verified: true
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "Head of Ops @ Startup",
    avatar: "👩‍🚀",
    rating: 5,
    text: "Eden nous a fait économiser 15h/semaine en reportings automatiques.",
    highlight: "-15h/semaine",
    size: 'small',
    verified: true
  },
  {
    id: 6,
    name: "Lucas Bernard",
    role: "Founder @ Agency",
    avatar: "👨‍🎨",
    rating: 5,
    text: "SEOly nous a fait passer de la page 5 à la position #1 en 3 mois.",
    highlight: "Page 5 → #1",
    size: 'large',
    verified: true
  }
];

export const FAQ_DATA = [
  {
    category: "IA & Automatisation",
    questions: [
      {
        question: "Comment l'IA personnalise-t-elle les réponses?",
        answer: "Notre IA analyse le contexte de chaque interaction, l'historique client, le ton de votre marque et les données sectorielles pour créer des réponses uniques et pertinentes. Elle apprend continuellement de vos validations pour s'améliorer."
      },
      {
        question: "Quel niveau de contrôle ai-je sur l'IA?",
        answer: "Total. Vous définissez les limites, validez les actions critiques, et pouvez intervenir à tout moment. L'IA propose, vous disposez."
      }
    ]
  },
  {
    category: "Intégrations",
    questions: [
      {
        question: "Puis-je connecter mes outils existants?",
        answer: "Oui! DigiFlow s'intègre nativement avec +50 outils : Stripe, Slack, Zapier, HubSpot, Salesforce, Google Workspace, Microsoft 365, et bien plus. API ouverte disponible."
      },
      {
        question: "Comment migrer mes données existantes?",
        answer: "Notre équipe d'onboarding s'occupe de tout. Migration gratuite, sans interruption de service, avec validation à chaque étape."
      }
    ]
  },
  {
    category: "Sécurité & Conformité",
    questions: [
      {
        question: "Mes données sont-elles sécurisées?",
        answer: "Chiffrement AES-256, conformité RGPD/CCPA, audits SOC 2 Type II, hébergement ISO 27001. Vos données vous appartiennent et sont supprimables à tout moment."
      },
      {
        question: "Où sont hébergées les données?",
        answer: "Serveurs en Europe (France/Allemagne) pour les clients EU, avec option de géolocalisation spécifique pour les entreprises."
      }
    ]
  },
  {
    category: "Tarification",
    questions: [
      {
        question: "Y a-t-il des frais cachés?",
        answer: "Aucun. Prix transparents, tout inclus. Pas de frais de setup, pas de commission sur les transactions, support illimité inclus."
      },
      {
        question: "Puis-je changer de plan?",
        answer: "À tout moment, sans frais. Upgrade instantané, downgrade en fin de période. Remboursement au prorata si annulation."
      }
    ]
  }
];