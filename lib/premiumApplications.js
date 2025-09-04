export const PREMIUM_APPLICATIONS = [
  // === Applications prioritaires V4 ===
  {
    id: 'fidalyz',
    name: 'Fidalyz',
    tagline: 'E-Réputation & SEO',
    description: 'Centralise, analyse et répond aux avis clients pour booster votre e-réputation et SEO',
    icon: '⭐',
    aiName: 'Octavia',
    aiAvatar: '👩‍💻',
    color: 'from-amber-500 to-yellow-500',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
    status: 'active',
    features: [
      'Collecte d\'avis (email/SMS)',
      'Analyse IA du sentiment',
      'Réponses auto assistées',
      'Widget SEO-friendly'
    ],
    stats: { users: '2.5k+', rating: '4.9', reviews: '157k+' },
    path: '/app/fidalyz',
    kpis: ['Note moyenne', 'Volume d\'avis', 'Taux de réponse', 'Sentiment mix'],
    credits: { sentiment: 0.1, reply: 0.2, widget: 0.5 }
  },
  {
    id: 'ads-master',
    name: 'Ads Master',
    tagline: 'Cockpit Publicitaire',
    description: 'Analyse, optimise et teste vos campagnes Meta, Google et TikTok avec l\'IA',
    icon: '🎯',
    aiName: 'Octavia',
    aiAvatar: '👩‍💻',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #4267B2 0%, #0084FF 100%)',
    status: 'active',
    features: [
      'Dashboards multi-plateformes',
      'Insights IA & recommandations',
      'Création visuelle IA',
      'A/B tests automatiques'
    ],
    stats: { users: '1.8k+', rating: '4.8', roas: '4.2x' },
    path: '/app/ads-master',
    kpis: ['ROAS', 'CPA/CPL', 'CTR', 'CAC', 'LTV-ROAS'],
    credits: { insight: 0.2, optimize: 0.5, visual: 1.0, abtest: 2.0 }
  },
  {
    id: 'hubcrm',
    name: 'HubCRM',
    tagline: 'ERP/CRM Intelligent',
    description: 'Gère votre pipeline prospects, revenus et KPIs business en temps réel',
    icon: '📊',
    aiName: 'Octavia',
    aiAvatar: '👩‍💻',
    color: 'from-purple-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    status: 'active',
    features: [
      'Pipeline prospects intelligent',
      'Scoring IA des leads',
      'Sync Stripe (SaaS/MRR)',
      'Attribution ROAS'
    ],
    stats: { users: '2.3k+', rating: '4.9', deals: '89k+' },
    path: '/app/hubcrm',
    kpis: ['MRR/ARR', 'Churn', 'LTV', 'Win rate', 'Cycle vente'],
    credits: { scoring: 0.2, enrichment: 0.2, forecast: 0.5 }
  },
  {
    id: 'leadwarm',
    name: 'LeadWarm',
    tagline: 'Préqualification Auto',
    description: 'Préchauffe et qualifie vos leads via WhatsApp, email et SMS automatiquement',
    icon: '🔥',
    aiName: 'Gloria',
    aiAvatar: '🤝',
    color: 'from-orange-500 to-red-500',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    status: 'active',
    features: [
      'Conversations multicanal',
      'Mémoire de marque IA',
      'Qualification automatique',
      'Scoring dans HubCRM'
    ],
    stats: { users: '1.5k+', rating: '4.8', qualified: '72%' },
    path: '/app/leadwarm',
    kpis: ['Taux réponse', 'Délai 1er contact', '% leads chauds', 'RDV pris'],
    credits: { start: 0.5, extend: 0.2, channel: 0.2 }
  },
  
  // === Applications futures ===
  {
    id: 'seoly',
    name: 'SEOly',
    tagline: 'SEO Growth',
    description: 'Tom optimise votre SEO : mots-clés, rédaction, backlinks',
    icon: '🔍',
    aiName: 'Tom',
    aiAvatar: '🤓',
    color: 'from-green-500 to-emerald-600',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    status: 'locked',
    features: ['Recherche mots-clés', 'Content IA', 'Suivi positions'],
    stats: { users: '3.2k+', rating: '4.7', growth: '+156%' },
    path: '#'
  },
  {
    id: 'supportia',
    name: 'Supportia',
    tagline: 'Support Client IA',
    description: 'Claude gère votre support : tickets, chat live, FAQ dynamique',
    icon: '💬',
    aiName: 'Claude',
    aiAvatar: '🤖',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
    status: 'locked',
    features: ['Support 24/7', 'Tickets auto', 'Multi-canal'],
    stats: { users: '2.1k+', rating: '4.8', resolution: '89%' },
    path: '#'
  },
  {
    id: 'cashflow',
    name: 'CashFlow',
    tagline: 'CFO Virtuel',
    description: 'Papin pilote vos finances : factures, trésorerie, prévisions',
    icon: '💰',
    aiName: 'Papin',
    aiAvatar: '🧮',
    color: 'from-yellow-500 to-orange-500',
    gradient: 'linear-gradient(135deg, #EAB308 0%, #F97316 100%)',
    status: 'locked',
    features: ['Facturation auto', 'Prévisions IA', 'Alertes trésorerie'],
    stats: { users: '1.9k+', rating: '4.7', saved: '€2.1M' },
    path: '#'
  },
  {
    id: 'eden',
    name: 'Eden',
    tagline: 'Business Intelligence',
    description: 'Eden analyse votre business : KPIs, anomalies, recommandations IA',
    icon: '📈',
    aiName: 'Eden',
    aiAvatar: '🎯',
    color: 'from-indigo-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #9333EA 100%)',
    status: 'locked',
    features: ['Analytics IA', 'Détection anomalies', 'Insights prédictifs'],
    stats: { users: '5.2k+', rating: '4.9', accuracy: '96%' },
    path: '#'
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
    text: "HubCRM a automatisé notre pipeline. ROI en 2 mois.",
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
    text: "Ads Master a divisé notre CAC par 3 tout en doublant nos conversions.",
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
    text: "LeadWarm qualifie 72% de nos leads automatiquement. Game changer!",
    highlight: "72% qualified",
    size: 'small',
    verified: true
  },
  {
    id: 6,
    name: "Lucas Bernard",
    role: "Founder @ Agency",
    avatar: "👨‍🎨",
    rating: 5,
    text: "Le ROAS de nos campagnes a explosé avec Ads Master : 4.2x en moyenne.",
    highlight: "ROAS 4.2x",
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