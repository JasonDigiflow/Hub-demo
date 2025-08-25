// Données de démonstration pour l'App Review Facebook
export const demoData = {
  // Données pour ads_read
  campaigns: [
    {
      id: 'demo_campaign_1',
      name: 'Campagne Black Friday 2024',
      status: 'ACTIVE',
      objective: 'CONVERSIONS',
      budget: 5000,
      spent: 3250.45,
      impressions: 125000,
      clicks: 4500,
      ctr: 3.6,
      cpc: 0.72,
      conversions: 89,
      costPerConversion: 36.52,
      reach: 95000,
      frequency: 1.32,
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      performance: 'excellent'
    },
    {
      id: 'demo_campaign_2',
      name: 'Acquisition Leads B2B',
      status: 'ACTIVE',
      objective: 'LEAD_GENERATION',
      budget: 3000,
      spent: 1890.30,
      impressions: 89000,
      clicks: 2100,
      ctr: 2.36,
      cpc: 0.90,
      conversions: 156,
      costPerConversion: 12.12,
      reach: 67000,
      frequency: 1.33,
      startDate: '2024-11-15',
      endDate: '2024-12-15',
      performance: 'good'
    },
    {
      id: 'demo_campaign_3',
      name: 'Retargeting Panier Abandonné',
      status: 'PAUSED',
      objective: 'CONVERSIONS',
      budget: 2000,
      spent: 1456.78,
      impressions: 45000,
      clicks: 1800,
      ctr: 4.0,
      cpc: 0.81,
      conversions: 45,
      costPerConversion: 32.37,
      reach: 35000,
      frequency: 1.29,
      startDate: '2024-11-01',
      endDate: '2024-11-25',
      performance: 'average'
    }
  ],

  // Données pour leads_retrieval
  leads: [
    {
      id: 'lead_001',
      name: 'Marie Dupont',
      email: 'marie.dupont@entreprise.fr',
      phone: '+33 6 12 34 56 78',
      company: 'Tech Solutions SARL',
      source: 'Lead Form - B2B Acquisition',
      formId: 'form_123',
      formName: 'Demande de Démo Gratuite',
      campaignName: 'Acquisition Leads B2B',
      createdTime: '2024-11-28T10:30:00',
      status: 'new',
      score: 85,
      estimatedValue: 5000
    },
    {
      id: 'lead_002',
      name: 'Jean Martin',
      email: 'j.martin@societe.com',
      phone: '+33 7 98 76 54 32',
      company: 'Innovation Corp',
      source: 'Lead Form - Webinar',
      formId: 'form_124',
      formName: 'Inscription Webinar IA',
      campaignName: 'Webinar IA Marketing',
      createdTime: '2024-11-28T09:15:00',
      status: 'qualified',
      score: 92,
      estimatedValue: 8000
    },
    {
      id: 'lead_003',
      name: 'Sophie Bernard',
      email: 'sophie.b@startup.io',
      phone: '+33 6 45 67 89 01',
      company: 'Digital Startup',
      source: 'Lead Form - Livre Blanc',
      formId: 'form_125',
      formName: 'Télécharger le Guide 2024',
      campaignName: 'Content Marketing',
      createdTime: '2024-11-27T14:20:00',
      status: 'contacted',
      score: 78,
      estimatedValue: 3500
    }
  ],

  // Données pour read_insights
  insights: {
    demographics: {
      age: [
        { range: '18-24', percentage: 15, clicks: 675, conversions: 12 },
        { range: '25-34', percentage: 35, clicks: 1575, conversions: 45 },
        { range: '35-44', percentage: 28, clicks: 1260, conversions: 38 },
        { range: '45-54', percentage: 15, clicks: 675, conversions: 18 },
        { range: '55+', percentage: 7, clicks: 315, conversions: 8 }
      ],
      gender: [
        { type: 'female', percentage: 58, clicks: 2610, conversions: 78 },
        { type: 'male', percentage: 40, clicks: 1800, conversions: 42 },
        { type: 'unknown', percentage: 2, clicks: 90, conversions: 1 }
      ],
      locations: [
        { city: 'Paris', percentage: 25, clicks: 1125 },
        { city: 'Lyon', percentage: 15, clicks: 675 },
        { city: 'Marseille', percentage: 12, clicks: 540 },
        { city: 'Toulouse', percentage: 8, clicks: 360 },
        { city: 'Nice', percentage: 6, clicks: 270 }
      ]
    },
    timeAnalysis: {
      bestHours: [
        { hour: '09:00', performance: 85 },
        { hour: '12:00', performance: 92 },
        { hour: '14:00', performance: 78 },
        { hour: '18:00', performance: 88 },
        { hour: '20:00', performance: 95 },
        { hour: '21:00', performance: 90 }
      ],
      bestDays: [
        { day: 'Lundi', performance: 82 },
        { day: 'Mardi', performance: 88 },
        { day: 'Mercredi', performance: 91 },
        { day: 'Jeudi', performance: 89 },
        { day: 'Vendredi', performance: 76 },
        { day: 'Samedi', performance: 65 },
        { day: 'Dimanche', performance: 58 }
      ]
    },
    performance: {
      daily: [
        { date: '2024-11-20', impressions: 12000, clicks: 450, cost: 325.50, conversions: 8 },
        { date: '2024-11-21', impressions: 13500, clicks: 502, cost: 358.90, conversions: 11 },
        { date: '2024-11-22', impressions: 14200, clicks: 523, cost: 378.45, conversions: 12 },
        { date: '2024-11-23', impressions: 11800, clicks: 412, cost: 298.30, conversions: 7 },
        { date: '2024-11-24', impressions: 10500, clicks: 378, cost: 265.20, conversions: 6 },
        { date: '2024-11-25', impressions: 15600, clicks: 589, cost: 412.80, conversions: 14 },
        { date: '2024-11-26', impressions: 16800, clicks: 625, cost: 445.90, conversions: 15 },
        { date: '2024-11-27', impressions: 17200, clicks: 645, cost: 468.30, conversions: 16 },
        { date: '2024-11-28', impressions: 13200, clicks: 476, cost: 342.15, conversions: 10 }
      ]
    }
  },

  // Données pour attribution_read
  attribution: {
    conversionPaths: [
      {
        path: ['Facebook Ad', 'Instagram Story', 'Website', 'Conversion'],
        conversions: 45,
        value: 22500,
        avgDays: 3.2
      },
      {
        path: ['Facebook Ad', 'Email', 'Conversion'],
        conversions: 32,
        value: 16000,
        avgDays: 1.8
      },
      {
        path: ['Instagram Ad', 'Direct', 'Conversion'],
        conversions: 28,
        value: 14000,
        avgDays: 0.5
      }
    ],
    models: {
      lastClick: { facebook: 65, instagram: 35 },
      firstClick: { facebook: 72, instagram: 28 },
      linear: { facebook: 68, instagram: 32 },
      timeDecay: { facebook: 70, instagram: 30 }
    }
  },

  // Données pour page_events
  events: [
    {
      type: 'PageView',
      count: 45000,
      uniqueUsers: 32000,
      avgValue: 0
    },
    {
      type: 'AddToCart',
      count: 3200,
      uniqueUsers: 2800,
      avgValue: 125.50
    },
    {
      type: 'InitiateCheckout',
      count: 1800,
      uniqueUsers: 1650,
      avgValue: 189.90
    },
    {
      type: 'Purchase',
      count: 890,
      uniqueUsers: 850,
      avgValue: 245.80
    },
    {
      type: 'Lead',
      count: 156,
      uniqueUsers: 156,
      avgValue: 75.00
    }
  ],

  // Recommandations IA d'Octavia
  aiRecommendations: [
    {
      type: 'budget',
      priority: 'high',
      title: 'Optimisation Budget Détectée',
      description: 'La campagne "Black Friday 2024" performe 25% au-dessus de la moyenne. Augmenter le budget de 500€ pourrait générer 18 conversions supplémentaires.',
      action: 'increase_budget',
      estimatedImpact: '+18 conversions'
    },
    {
      type: 'audience',
      priority: 'medium',
      title: 'Audience Performante Identifiée',
      description: 'Les femmes de 25-34 ans ont un taux de conversion 40% supérieur. Créer une campagne dédiée pourrait améliorer le ROI.',
      action: 'create_lookalike',
      estimatedImpact: '+32% ROI'
    },
    {
      type: 'creative',
      priority: 'low',
      title: 'Fatigue Créative Détectée',
      description: 'La fréquence moyenne dépasse 1.3. Recommandation de rafraîchir les créatives pour maintenir l\'engagement.',
      action: 'refresh_creatives',
      estimatedImpact: '+15% CTR'
    },
    {
      type: 'timing',
      priority: 'high',
      title: 'Optimisation Horaire',
      description: 'Vos publicités performent 35% mieux entre 20h et 22h. Concentrer le budget sur ces créneaux.',
      action: 'adjust_schedule',
      estimatedImpact: '-20% CPC'
    }
  ],

  // Données pour business_management
  accounts: [
    {
      id: 'act_123456789',
      name: 'DigiFlow Agency - Principal',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      status: 'ACTIVE',
      spent: 12456.78,
      balance: 7543.22
    },
    {
      id: 'act_987654321',
      name: 'Client - Tech Startup',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      status: 'ACTIVE',
      spent: 5678.90,
      balance: 4321.10
    }
  ],

  // Données pour pages
  pages: [
    {
      id: 'page_001',
      name: 'DigiFlow Agency',
      followers: 12500,
      engagement: 4.8,
      posts: 156
    },
    {
      id: 'page_002',
      name: 'Tech Innovation Hub',
      followers: 8900,
      engagement: 3.2,
      posts: 89
    }
  ]
};

// Fonction pour simuler des mises à jour en temps réel
export function getRealtimeMetrics() {
  const base = demoData.campaigns[0];
  const variance = 0.05; // 5% de variance
  
  return {
    ...base,
    impressions: Math.round(base.impressions * (1 + (Math.random() - 0.5) * variance)),
    clicks: Math.round(base.clicks * (1 + (Math.random() - 0.5) * variance)),
    spent: +(base.spent * (1 + (Math.random() - 0.5) * variance)).toFixed(2),
    conversions: Math.round(base.conversions * (1 + (Math.random() - 0.5) * variance))
  };
}

// Fonction pour générer des nouveaux leads
export function generateNewLead() {
  const firstNames = ['Pierre', 'Claire', 'Thomas', 'Julie', 'Nicolas', 'Emma'];
  const lastNames = ['Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre'];
  const companies = ['StartUp IO', 'Tech Corp', 'Digital Agency', 'Innovation Lab', 'Cloud Services'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  
  return {
    id: `lead_${Date.now()}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(' ', '')}.com`,
    phone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
    company: company,
    source: 'Lead Form - Demo',
    formId: 'form_demo',
    formName: 'Formulaire de Démonstration',
    campaignName: demoData.campaigns[1].name,
    createdTime: new Date().toISOString(),
    status: 'new',
    score: Math.floor(Math.random() * 30 + 70),
    estimatedValue: Math.floor(Math.random() * 5000 + 2000)
  };
}