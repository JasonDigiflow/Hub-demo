export const translations = {
  fr: {
    // Onboarding
    onboarding: {
      steps: {
        account: 'Compte',
        company: 'Entreprise',
        modules: 'Modules',
        connections: 'Connexions'
      },
      account: {
        title: 'Créez votre compte',
        subtitle: 'Commencez avec 50 crédits offerts',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email professionnel',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        language: 'Langue',
        passwordHint: 'Minimum 8 caractères avec au moins une majuscule et un chiffre',
        terms: "J'accepte les",
        termsLink: "conditions d'utilisation",
        privacy: 'et la',
        privacyLink: 'politique de confidentialité',
        submit: 'Créer mon compte',
        submitting: 'Création du compte...',
        errors: {
          required: 'Tous les champs sont obligatoires',
          passwordLength: 'Le mot de passe doit contenir au moins 8 caractères',
          passwordMismatch: 'Les mots de passe ne correspondent pas',
          acceptTerms: "Vous devez accepter les conditions d'utilisation",
          disposableEmail: 'Les adresses email temporaires ne sont pas autorisées',
          emailInUse: 'Cet email est déjà utilisé',
          invalidEmail: 'Email invalide',
          weakPassword: 'Mot de passe trop faible'
        }
      },
      company: {
        title: 'Votre entreprise',
        subtitle: 'Configurez votre espace professionnel',
        choiceTitle: 'Comment souhaitez-vous configurer votre entreprise ?',
        createCompany: 'Créer mon entreprise (avec SIRET)',
        createCompanyDesc: 'Pour les entreprises françaises avec un numéro SIRET',
        joinCompany: "Rejoindre une entreprise (code d'invitation)",
        joinCompanyDesc: 'Si votre entreprise est déjà inscrite sur DigiFlow Hub',
        noSiret: "Je n'ai pas de SIRET / Société étrangère",
        siretLabel: 'Numéro de SIRET (14 chiffres)',
        siretFormat: 'Format : SIREN (9 chiffres) + NIC (5 chiffres)',
        verifySiret: 'Vérifier le SIRET',
        verifying: 'Vérification...',
        confirmInfo: 'Confirmer les informations',
        companyName: 'Raison sociale',
        address: 'Adresse',
        nafCode: 'Code NAF',
        establishments: 'Établissements',
        confirmCreate: "Confirmer et créer l'entreprise",
        inviteCode: "Code d'invitation",
        joinButton: "Rejoindre l'entreprise",
        inviteHint: "Demandez le code d'invitation à votre administrateur",
        companyExists: "Cette entreprise existe déjà. Entrez un code d'invitation ou contactez",
        back: 'Retour',
        modify: 'Modifier'
      },
      modules: {
        title: 'Modules & Abonnement',
        subtitle: 'Activez les modules dont vous avez besoin',
        selectModules: 'Sélectionnez vos modules',
        choosePlan: 'Choisissez votre abonnement',
        seats: 'Nombre de sièges',
        total: 'Total',
        perSeatMonth: '/siège/mois',
        perMonth: '/mois',
        popular: 'Populaire',
        creditsOffered: '50 crédits offerts',
        creditsDesc: 'Pour démarrer immédiatement avec tous les modules',
        continue: 'Continuer'
      },
      connections: {
        title: 'Connexions',
        subtitle: 'Connectez vos plateformes pour démarrer',
        required: 'Obligatoire',
        requiredWarning: 'est obligatoire pour utiliser Ads Master',
        connect: 'Connecter',
        connecting: 'Connexion...',
        connected: 'Connecté',
        skip: 'Passer',
        finish: "Terminer l'inscription",
        connectFirst: "Connecter Meta Ads d'abord",
        laterHint: 'Vous pourrez ajouter d\'autres connexions plus tard depuis votre tableau de bord',
        noConnections: 'Aucune connexion requise pour les modules sélectionnés'
      }
    },
    
    // Demo
    demo: {
      login: {
        title: 'Accès Démo',
        subtitle: 'Découvrez la puissance de DigiFlow Hub',
        credentials: 'Identifiants démo',
        email: 'Email',
        password: 'Mot de passe',
        access: 'Accéder à la démo',
        accessing: 'Accès en cours...',
        backToLogin: '← Retour à la connexion principale',
        disclaimer: 'Ceci est un environnement de démo avec des données simulées.',
        noOperations: 'Aucune opération réelle ne sera effectuée.',
        invalidCredentials: 'Identifiants démo invalides'
      },
      dashboard: {
        title: 'Tableau de Bord Démo',
        welcome: 'Bienvenue',
        demoMode: 'Mode Démo',
        liveSimulation: 'Simulation en direct',
        exitDemo: 'Quitter la démo',
        totalContacts: 'Total Contacts',
        activeCampaigns: 'Campagnes Actives',
        emailsSent: 'Emails Envoyés',
        loyaltyPoints: 'Points de Fidélité',
        hubcrm: {
          name: 'HubCRM',
          description: 'Gérez vos relations clients',
          contacts: 'Contacts',
          activeDeals: 'Affaires Actives',
          revenue: 'Revenus'
        },
        adsMaster: {
          name: 'Ads Master',
          description: 'Optimisez vos campagnes publicitaires',
          campaigns: 'Campagnes',
          adSpend: 'Dépenses Pub',
          roas: 'ROAS'
        },
        leadWarm: {
          name: 'LeadWarm',
          description: 'Chauffez vos comptes email',
          emailsSent: 'Emails Envoyés',
          warmupScore: 'Score de Chauffe',
          reputation: 'Réputation'
        },
        fidalyz: {
          name: 'Fidalyz',
          description: 'Fidélisez vos clients',
          customers: 'Clients',
          pointsIssued: 'Points Émis',
          retention: 'Rétention'
        },
        clickToExplore: 'Cliquez pour explorer',
        liveDemo: 'Démo en Direct',
        disclaimer: 'Ceci est un environnement de démo avec des données simulées • Tous les changements sont temporaires'
      },
      hubcrm: {
        title: 'HubCRM Démo',
        subtitle: 'Gérez votre pipeline de ventes avec des insights IA',
        back: '← Retour',
        newDeal: '+ Nouvelle Affaire',
        pipelineValue: 'Valeur du Pipeline',
        closedThisMonth: 'Fermé ce Mois',
        activeDeals: 'Affaires Actives',
        winRate: 'Taux de Victoire',
        pipeline: 'Pipeline',
        contacts: 'Contacts',
        activities: 'Activités',
        stages: {
          prospecting: 'Prospection',
          qualification: 'Qualification',
          proposal: 'Proposition',
          negotiation: 'Négociation',
          closed: 'Fermé'
        },
        deals: 'affaires',
        days: 'jours',
        score: 'Score',
        lastContact: 'Dernier contact',
        status: {
          active: 'actif',
          new: 'nouveau',
          inactive: 'inactif'
        },
        activityTypes: {
          call: 'Appel',
          email: 'Email',
          meeting: 'Réunion'
        },
        activityStatus: {
          completed: 'terminé',
          scheduled: 'planifié'
        }
      },
      adsMaster: {
        title: 'Ads Master Démo',
        subtitle: 'Optimisation publicitaire IA sur toutes les plateformes',
        back: '← Retour',
        aiOptimize: '🤖 Optimisation IA',
        optimizing: 'Optimisation...',
        totalSpend: 'Dépenses Totales',
        totalRevenue: 'Revenus Totaux',
        avgRoas: 'ROAS Moyen',
        activeCampaigns: 'Campagnes Actives',
        totalConversions: 'Conversions Totales',
        overview: 'Vue d\'ensemble',
        campaigns: 'Campagnes',
        analytics: 'Analytics',
        performanceTrend: 'Tendance de Performance',
        audienceDemographics: 'Démographie d\'Audience',
        platformPerformance: 'Performance par Plateforme',
        quickActions: 'Actions Rapides',
        launchSmartCampaign: '🎯 Lancer Campagne Intelligente',
        aiPoweredCreation: 'Création de campagne IA',
        generateReport: '📊 Générer Rapport',
        weeklyAnalysis: 'Analyse de performance hebdomadaire',
        syncPlatforms: '🔄 Synchroniser Plateformes',
        updateData: 'Mettre à jour les données de tous les comptes',
        campaign: 'Campagne',
        platform: 'Plateforme',
        status: 'Statut',
        budget: 'Budget',
        spent: 'Dépensé',
        conversions: 'conversions',
        active: 'actif',
        paused: 'en pause',
        view: 'Voir →',
        impressionsClicks: 'Impressions & Clics',
        aiInsights: 'Insights IA de Performance',
        strongPerformance: 'Performance Forte',
        optimizationOpportunity: 'Opportunité d\'Optimisation',
        aiRecommendation: 'Recommandation IA'
      },
      leadWarm: {
        title: 'LeadWarm Démo',
        subtitle: 'Réchauffement d\'email IA pour une délivrabilité maximale',
        back: '← Retour',
        aiAnalysis: '🤖 Analyse IA',
        analyzing: 'Analyse...',
        warmupScore: 'Score de Chauffe',
        emailsSent: 'Emails Envoyés',
        replyRate: 'Taux de Réponse',
        spamScore: 'Score de Spam',
        reputation: 'Réputation',
        status: {
          warming: 'en chauffe',
          paused: 'en pause',
          stopped: 'arrêté'
        },
        dailyProgress: 'Progression Quotidienne',
        dashboard: 'Tableau de bord',
        activity: 'Activité',
        insights: 'Insights',
        warmupProgress: 'Progression de Chauffe (7 Jours)',
        reputationScore: 'Score de Réputation',
        excellent: 'Excellent',
        good: 'Bon',
        building: 'En construction',
        warmupConfig: 'Configuration de Chauffe',
        dailyEmailLimit: 'Limite d\'Emails Quotidienne',
        graduallyIncreasing: 'Augmentation progressive',
        replyRateTarget: 'Objectif de Taux de Réponse',
        maintainEngagement: 'Maintenir un engagement élevé',
        warmupNetwork: 'Réseau de Chauffe',
        premiumAccess: 'Accès réseau premium',
        inboxes: 'boîtes de réception',
        startWarmup: '🚀 Démarrer Chauffe',
        warmingActive: '✅ Chauffe Active',
        performanceMetrics: 'Métriques de Performance',
        inboxPlacement: 'Placement en Boîte de Réception',
        lastDaysAvg: 'Moyenne des 7 derniers jours',
        responseTime: 'Temps de Réponse',
        avgReplySpeed: 'Vitesse de réponse moyenne',
        warmupStreak: 'Série de Chauffe',
        consecutiveDays: 'Jours consécutifs',
        recentActivity: 'Activité Récente',
        delivered: 'livré',
        replied: 'répondu',
        read: 'lu',
        pending: 'en attente',
        aiRecommendations: 'Insights & Recommandations IA',
        bestPractices: 'Meilleures Pratiques de Chauffe',
        startSlow: 'Commencer Lentement, Augmenter Progressivement',
        startWith: 'Commencer avec 10-20 emails par jour et augmenter de 5-10 quotidiennement',
        maintainHighEngagement: 'Maintenir un Engagement Élevé',
        replyToEmails: 'Répondre aux emails de chauffe pour maintenir 80%+ de taux de réponse',
        varyContent: 'Varier Votre Contenu',
        diverseSubjects: 'Utiliser des lignes d\'objet et des modèles de contenu diversifiés',
        monitorConsistently: 'Surveiller Constamment',
        checkMetrics: 'Vérifier le score de spam et les métriques de délivrabilité quotidiennement'
      },
      fidalyz: {
        title: 'Fidalyz Démo',
        subtitle: 'Gestion de programme de fidélité alimentée par l\'IA',
        back: '← Retour',
        newReward: '+ Nouvelle Récompense',
        aiCampaign: '🤖 Campagne IA',
        generating: 'Génération...',
        totalMembers: 'Total Membres',
        activePoints: 'Points Actifs',
        retentionRate: 'Taux de Rétention',
        avgBasket: 'Panier Moyen',
        overview: 'Vue d\'ensemble',
        members: 'Membres',
        rewards: 'Récompenses',
        analytics: 'Analytics',
        pointsActivity: 'Activité des Points',
        memberSegments: 'Segments de Membres',
        liveActivityFeed: 'Flux d\'Activité en Direct',
        earned: 'gagné',
        redeemed: 'échangé',
        joined: 'inscrit',
        points: 'points',
        purchase: 'Achat',
        discount: 'Remise',
        welcomeBonus: 'Bonus de Bienvenue',
        referralBonus: 'Bonus de Parrainage',
        productReview: 'Avis Produit',
        quickActions: 'Actions Rapides',
        sendCampaign: '📧 Envoyer Campagne',
        targetVipMembers: 'Cibler membres VIP',
        createEvent: '🎁 Créer Événement',
        doublePointsWeekend: 'Weekend double points',
        exportReport: '📊 Exporter Rapport',
        monthlyAnalytics: 'Analytics mensuels',
        topMembers: 'Top Membres',
        searchMembers: 'Rechercher membres...',
        member: 'Membre',
        tier: 'Niveau',
        totalSpent: 'Total Dépensé',
        visits: 'Visites',
        lastVisit: 'Dernière Visite',
        actions: 'Actions',
        active: 'Actif',
        special: 'Spécial',
        claimed: 'réclamé',
        weeklyEngagement: 'Engagement Hebdomadaire',
        performanceKpis: 'KPIs de Performance',
        customerLifetimeValue: 'Valeur Client à Vie',
        avgPerMember: 'Moyenne par membre',
        netPromoterScore: 'Net Promoter Score',
        customerSatisfaction: 'Satisfaction client',
        redemptionRate: 'Taux d\'Échange',
        pointsUtilization: 'Utilisation des points',
        optimal: 'Optimal',
        repeatPurchaseRate: 'Taux de Rachat',
        withinDays: 'Dans les 30 jours'
      }
    },
    
    // Navigation
    nav: {
      dashboard: 'Tableau de bord',
      campaigns: 'Campagnes',
      leads: 'Prospects',
      analytics: 'Analytics',
      settings: 'Paramètres',
      logout: 'Déconnexion'
    },
    
    // Dashboard
    dashboard: {
      welcome: 'Bienvenue',
      credits: 'Crédits',
      activeModules: 'Modules actifs',
      recentActivity: 'Activité récente',
      quickActions: {
        title: 'Actions rapides',
        newCampaign: 'Nouvelle campagne',
        viewAnalytics: 'Voir analytics',
        manageTeam: 'Gérer l\'équipe',
        settings: 'Paramètres'
      },
      activeApplications: 'Applications actives',
      users: 'Utilisateurs',
      plan: 'Plan',
      applicationsStatus: 'État des applications',
      active: 'Actif',
      inactive: 'Inactif',
      comingSoon: 'Bientôt disponible',
      lastUpdate: 'Dernière MAJ',
      open: 'Ouvrir',
      welcomeMessage: 'Voici un aperçu de votre activité et de vos applications',
      greetings: {
        morning: 'Bonjour',
        afternoon: 'Bon après-midi',
        evening: 'Bonsoir'
      },
      stats: {
        campaigns: 'Campagnes',
        budget: 'Budget',
        roas: 'ROAS',
        contacts: 'Contacts',
        deals: 'Deals',
        revenue: 'Revenus',
        leads: 'Leads',
        engaged: 'Engagés',
        converted: 'Convertis',
        rate: 'Taux',
        reviews: 'Avis',
        rating: 'Note',
        responses: 'Réponses',
        posts: 'Posts',
        engagement: 'Engagement',
        followers: 'Abonnés',
        articles: 'Articles',
        quality: 'Qualité',
        generated: 'Générés',
        emails: 'Emails',
        openRate: 'Taux d\'ouverture',
        clicks: 'Clics',
        reports: 'Rapports',
        insights: 'Insights',
        accuracy: 'Précision'
      },
      releaseNotesTitle: 'Notes de version',
      releaseNotes: {
        v410: {
          title: 'DigiFlow Hub V4.1 - Optimisations et nouvelles fonctionnalités',
          changes: [
            '🌐 Système de traduction complet FR/EN',
            '🚀 Performance améliorée de 45%',
            '🔐 Authentification Firebase optimisée',
            '📊 Nouveau tableau de bord avec statistiques en temps réel',
            '🎨 Interface glassmorphism améliorée'
          ]
        },
        v405: {
          title: 'Corrections et améliorations',
          changes: [
            '🐛 Correction du processus d\'inscription en 4 étapes',
            '⚡ Optimisation des requêtes API Pappers',
            '📱 Amélioration de l\'expérience mobile',
            '🔧 Correction des erreurs Firebase'
          ]
        },
        v400: {
          title: 'DigiFlow Hub V4 - Nouvelle génération',
          changes: [
            '🎨 Interface entièrement redesignée',
            '🚀 Migration vers Next.js 15',
            '🌐 Support multilingue initial',
            '🔐 Nouveau système d\'authentification',
            '📊 Dashboard unifié'
          ]
        }
      }
    },
    
    // Modules
    modules: {
      adsMaster: {
        name: 'Ads Master',
        description: 'Gestion multi-plateformes des campagnes publicitaires'
      },
      hubCRM: {
        name: 'HubCRM',
        description: 'CRM intelligent avec automatisation marketing'
      },
      leadWarm: {
        name: 'LeadWarm',
        description: 'Nurturing et conversion automatique des leads'
      },
      fidalyz: {
        name: 'Fidalyz',
        description: 'E-réputation et gestion des avis clients'
      },
      socialBoost: {
        name: 'SocialBoost',
        description: 'Automatisation et gestion des réseaux sociaux'
      },
      contentAI: {
        name: 'ContentAI',
        description: 'Génération de contenu optimisé par IA'
      },
      emailForge: {
        name: 'EmailForge',
        description: 'Campagnes email automatisées et personnalisées'
      },
      datalytics: {
        name: 'Datalytics',
        description: 'Analyse de données avancée et reporting'
      }
    },
    
    // Common
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Attention',
      comingSoon: 'Bientôt disponible',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      minutes: 'minutes'
    },
    
    // Ads Master
    adsMaster: {
      subtitle: 'Gestion multi-plateformes des campagnes publicitaires',
      selectAccount: 'Compte publicitaire',
      syncNow: 'Synchroniser maintenant',
      syncing: 'Synchronisation...',
      lastSync: 'Dernière synchronisation',
      connections: 'Connexions',
      connected: 'Connecté',
      confirmDisconnect: 'Êtes-vous sûr de vouloir déconnecter ce compte ?',
      neverSynced: 'Jamais synchronisé',
      justNow: 'À l\'instant',
      minutesAgo: '{{minutes}} minutes',
      hoursAgo: '{{hours}} heures',
      daysAgo: '{{days}} jours',
      cacheStatus: 'Statut du cache',
      cacheValid: 'Valide',
      cacheExpired: 'Expiré',
      cacheDuration: 'Durée du cache',
      forceRefresh: 'Forcer la régénération',
      comingSoonTooltip: 'Cette fonctionnalité sera bientôt disponible',
      googleComingSoon: 'L\'intégration Google Ads arrive bientôt !',
      tiktokComingSoon: 'L\'intégration TikTok Ads arrive bientôt !',
      connectMeta: 'Connecter Meta Business',
      notConnected: {
        title: 'Compte Meta non connecté',
        description: 'Connectez votre compte Meta pour afficher les insights de vos campagnes.'
      },
      noData: {
        title: 'Aucune donnée disponible',
        description: 'Aucune dépense publicitaire sur la période sélectionnée.'
      },
      period: 'Période',
      metric: 'Métrique',
      chartType: 'Type de graphique',
      lineChart: 'Ligne',
      barChart: 'Barres',
      evolution: 'évolution',
      campaigns: 'Campagnes',
      campaignName: 'Nom de la campagne',
      status: 'Statut',
      audienceMatrix: 'Matrice des audiences',
      metrics: {
        spend: 'Dépenses',
        ctr: 'CTR',
        cpc: 'CPC',
        cpm: 'CPM',
        conversions: 'Conversions',
        roas: 'ROAS'
      },
      dateRanges: {
        '7days': '7 derniers jours',
        '14days': '14 derniers jours',
        '30days': '30 derniers jours',
        'custom': 'Personnalisé'
      },
      errors: {
        noAccountSelected: 'Veuillez sélectionner un compte publicitaire',
        syncFailed: 'Échec de la synchronisation',
        networkError: 'Erreur réseau'
      },
      ai: {
        generateInsights: 'Générer des insights IA',
        insightsDescription: 'Forces, faiblesses et recommandations',
        optimizeBudget: 'Optimisation sans visuel',
        optimizeDescription: 'Optimisation du budget et du ciblage',
        createAd: 'Création annonce avec visuel',
        creativeDescription: 'Génération créative avec IA',
        subtitle: 'Assistant IA pour vos campagnes',
        credits: 'Crédits disponibles',
        cost: 'Coût',
        generating: 'Génération en cours...',
        insufficientCredits: 'Crédits insuffisants',
        generationFailed: 'Échec de la génération',
        insightsTitle: 'Insights IA générés',
        performanceScore: 'Score de performance',
        scoreDescription: 'Évaluation globale de vos campagnes',
        strengths: 'Points forts',
        weaknesses: 'Points faibles',
        recommendations: 'Recommandations',
        currentBudget: 'Budget actuel',
        recommendedBudget: 'Budget recommandé',
        expectedImprovement: 'Amélioration attendue',
        optimizationActions: 'Actions d\'optimisation',
        applyOptimizations: 'Appliquer les optimisations',
        applyChanges: 'Appliquer les changements',
        mockStrength1: 'CTR supérieur à la moyenne du secteur',
        mockStrength2: 'Bon ciblage des audiences 25-34 ans',
        mockStrength3: 'ROAS stable sur les 7 derniers jours',
        mockWeakness1: 'CPM élevé sur certaines campagnes',
        mockWeakness2: 'Taux de conversion faible le weekend',
        mockRecommendation1: 'Augmenter le budget sur les audiences performantes',
        mockRecommendation2: 'Réduire les enchères sur les créneaux peu performants',
        mockRecommendation3: 'Tester de nouveaux visuels pour améliorer le CTR',
        mockRecommendation4: 'Activer le retargeting sur les visiteurs abandonnistes',
        mockOptimization1: 'Réallouer 15% du budget vers les audiences 25-34 ans',
        mockOptimization2: 'Désactiver les annonces entre 2h et 6h du matin',
        mockOptimization3: 'Augmenter les enchères de 10% sur mobile'
      }
    },
    
    // Forms
    forms: {
      email: 'Email',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      company: 'Entreprise',
      phone: 'Téléphone',
      required: 'Champ obligatoire',
      invalidEmail: 'Email invalide',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères'
    },
    
    // Dates
    dates: {
      today: "Aujourd'hui",
      yesterday: 'Hier',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      lastMonth: 'Le mois dernier',
      custom: 'Personnalisé'
    }
  },
  
  en: {
    // Onboarding
    onboarding: {
      steps: {
        account: 'Account',
        company: 'Company',
        modules: 'Modules',
        connections: 'Connections'
      },
      account: {
        title: 'Create your account',
        subtitle: 'Start with 50 free credits',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Professional email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        language: 'Language',
        passwordHint: 'Minimum 8 characters with at least one uppercase and one number',
        terms: "I accept the",
        termsLink: "terms of service",
        privacy: 'and the',
        privacyLink: 'privacy policy',
        submit: 'Create my account',
        submitting: 'Creating account...',
        errors: {
          required: 'All fields are required',
          passwordLength: 'Password must be at least 8 characters',
          passwordMismatch: 'Passwords do not match',
          acceptTerms: "You must accept the terms of service",
          disposableEmail: 'Temporary email addresses are not allowed',
          emailInUse: 'This email is already in use',
          invalidEmail: 'Invalid email',
          weakPassword: 'Password too weak'
        }
      },
      company: {
        title: 'Your company',
        subtitle: 'Configure your professional space',
        choiceTitle: 'How would you like to set up your company?',
        createCompany: 'Create my company (with SIRET)',
        createCompanyDesc: 'For French companies with a SIRET number',
        joinCompany: "Join a company (invitation code)",
        joinCompanyDesc: 'If your company is already registered on DigiFlow Hub',
        noSiret: "I don't have a SIRET / Foreign company",
        siretLabel: 'SIRET number (14 digits)',
        siretFormat: 'Format: SIREN (9 digits) + NIC (5 digits)',
        verifySiret: 'Verify SIRET',
        verifying: 'Verifying...',
        confirmInfo: 'Confirm information',
        companyName: 'Company name',
        address: 'Address',
        nafCode: 'NAF Code',
        establishments: 'Establishments',
        confirmCreate: "Confirm and create company",
        inviteCode: "Invitation code",
        joinButton: "Join company",
        inviteHint: "Ask your administrator for the invitation code",
        companyExists: "This company already exists. Enter an invitation code or contact",
        back: 'Back',
        modify: 'Modify'
      },
      modules: {
        title: 'Modules & Subscription',
        subtitle: 'Activate the modules you need',
        selectModules: 'Select your modules',
        choosePlan: 'Choose your subscription',
        seats: 'Number of seats',
        total: 'Total',
        perSeatMonth: '/seat/month',
        perMonth: '/month',
        popular: 'Popular',
        creditsOffered: '50 credits offered',
        creditsDesc: 'To start immediately with all modules',
        continue: 'Continue'
      },
      connections: {
        title: 'Connections',
        subtitle: 'Connect your platforms to get started',
        required: 'Required',
        requiredWarning: 'is required to use Ads Master',
        connect: 'Connect',
        connecting: 'Connecting...',
        connected: 'Connected',
        skip: 'Skip',
        finish: "Complete registration",
        connectFirst: "Connect Meta Ads first",
        laterHint: 'You can add other connections later from your dashboard',
        noConnections: 'No connections required for selected modules'
      }
    },
    
    // Demo
    demo: {
      login: {
        title: 'Demo Access',
        subtitle: 'Experience the power of DigiFlow Hub',
        credentials: 'Demo credentials',
        email: 'Email',
        password: 'Password',
        access: 'Access Demo',
        accessing: 'Accessing...',
        backToLogin: '← Back to main login',
        disclaimer: 'This is a demo environment with simulated data.',
        noOperations: 'No real operations will be performed.',
        invalidCredentials: 'Invalid demo credentials'
      },
      dashboard: {
        title: 'Demo Dashboard',
        welcome: 'Welcome',
        demoMode: 'Demo Mode',
        liveSimulation: 'Live Simulation',
        exitDemo: 'Exit Demo',
        totalContacts: 'Total Contacts',
        activeCampaigns: 'Active Campaigns',
        emailsSent: 'Emails Sent',
        loyaltyPoints: 'Loyalty Points',
        hubcrm: {
          name: 'HubCRM',
          description: 'Manage your customer relationships',
          contacts: 'Contacts',
          activeDeals: 'Active Deals',
          revenue: 'Revenue'
        },
        adsMaster: {
          name: 'Ads Master',
          description: 'Optimize your advertising campaigns',
          campaigns: 'Campaigns',
          adSpend: 'Ad Spend',
          roas: 'ROAS'
        },
        leadWarm: {
          name: 'LeadWarm',
          description: 'Warm up your email accounts',
          emailsSent: 'Emails Sent',
          warmupScore: 'Warmup Score',
          reputation: 'Reputation'
        },
        fidalyz: {
          name: 'Fidalyz',
          description: 'Build customer loyalty',
          customers: 'Customers',
          pointsIssued: 'Points Issued',
          retention: 'Retention'
        },
        clickToExplore: 'Click to explore',
        liveDemo: 'Live Demo',
        disclaimer: 'This is a demo environment with simulated data • All changes are temporary'
      },
      hubcrm: {
        title: 'HubCRM Demo',
        subtitle: 'Manage your sales pipeline with AI-powered insights',
        back: '← Back',
        newDeal: '+ New Deal',
        pipelineValue: 'Pipeline Value',
        closedThisMonth: 'Closed This Month',
        activeDeals: 'Active Deals',
        winRate: 'Win Rate',
        pipeline: 'Pipeline',
        contacts: 'Contacts',
        activities: 'Activities',
        stages: {
          prospecting: 'Prospecting',
          qualification: 'Qualification',
          proposal: 'Proposal',
          negotiation: 'Negotiation',
          closed: 'Closed'
        },
        deals: 'deals',
        days: 'days',
        score: 'Score',
        lastContact: 'Last contact',
        status: {
          active: 'active',
          new: 'new',
          inactive: 'inactive'
        },
        activityTypes: {
          call: 'Call',
          email: 'Email',
          meeting: 'Meeting'
        },
        activityStatus: {
          completed: 'completed',
          scheduled: 'scheduled'
        }
      },
      adsMaster: {
        title: 'Ads Master Demo',
        subtitle: 'AI-powered advertising optimization across all platforms',
        back: '← Back',
        aiOptimize: '🤖 AI Optimize',
        optimizing: 'Optimizing...',
        totalSpend: 'Total Spend',
        totalRevenue: 'Total Revenue',
        avgRoas: 'Avg ROAS',
        activeCampaigns: 'Active Campaigns',
        totalConversions: 'Total Conversions',
        overview: 'Overview',
        campaigns: 'Campaigns',
        analytics: 'Analytics',
        performanceTrend: 'Performance Trend',
        audienceDemographics: 'Audience Demographics',
        platformPerformance: 'Platform Performance',
        quickActions: 'Quick Actions',
        launchSmartCampaign: '🎯 Launch Smart Campaign',
        aiPoweredCreation: 'AI-powered campaign creation',
        generateReport: '📊 Generate Report',
        weeklyAnalysis: 'Weekly performance analysis',
        syncPlatforms: '🔄 Sync All Platforms',
        updateData: 'Update data from all ad accounts',
        campaign: 'Campaign',
        platform: 'Platform',
        status: 'Status',
        budget: 'Budget',
        spent: 'Spent',
        conversions: 'conversions',
        active: 'active',
        paused: 'paused',
        view: 'View →',
        impressionsClicks: 'Impressions & Clicks',
        aiInsights: 'AI Performance Insights',
        strongPerformance: 'Strong Performance',
        optimizationOpportunity: 'Optimization Opportunity',
        aiRecommendation: 'AI Recommendation'
      },
      leadWarm: {
        title: 'LeadWarm Demo',
        subtitle: 'AI-powered email warmup for maximum deliverability',
        back: '← Back',
        aiAnalysis: '🤖 AI Analysis',
        analyzing: 'Analyzing...',
        warmupScore: 'Warmup Score',
        emailsSent: 'Emails Sent',
        replyRate: 'Reply Rate',
        spamScore: 'Spam Score',
        reputation: 'Reputation',
        status: {
          warming: 'warming',
          paused: 'paused',
          stopped: 'stopped'
        },
        dailyProgress: 'Daily Progress',
        dashboard: 'Dashboard',
        activity: 'Activity',
        insights: 'Insights',
        warmupProgress: 'Warmup Progress (7 Days)',
        reputationScore: 'Reputation Score',
        excellent: 'Excellent',
        good: 'Good',
        building: 'Building',
        warmupConfig: 'Warmup Configuration',
        dailyEmailLimit: 'Daily Email Limit',
        graduallyIncreasing: 'Gradually increasing',
        replyRateTarget: 'Reply Rate Target',
        maintainEngagement: 'Maintain high engagement',
        warmupNetwork: 'Warmup Network',
        premiumAccess: 'Premium network access',
        inboxes: 'inboxes',
        startWarmup: '🚀 Start Warmup',
        warmingActive: '✅ Warming Active',
        performanceMetrics: 'Performance Metrics',
        inboxPlacement: 'Inbox Placement',
        lastDaysAvg: 'Last 7 days average',
        responseTime: 'Response Time',
        avgReplySpeed: 'Average reply speed',
        warmupStreak: 'Warmup Streak',
        consecutiveDays: 'Consecutive days',
        recentActivity: 'Recent Email Activity',
        delivered: 'delivered',
        replied: 'replied',
        read: 'read',
        pending: 'pending',
        aiRecommendations: 'AI Insights & Recommendations',
        bestPractices: 'Warmup Best Practices',
        startSlow: 'Start Slow, Scale Gradually',
        startWith: 'Begin with 10-20 emails per day and increase by 5-10 daily',
        maintainHighEngagement: 'Maintain High Engagement',
        replyToEmails: 'Reply to warmup emails to maintain 80%+ reply rate',
        varyContent: 'Vary Your Content',
        diverseSubjects: 'Use diverse subject lines and email content patterns',
        monitorConsistently: 'Monitor Consistently',
        checkMetrics: 'Check spam score and deliverability metrics daily'
      },
      fidalyz: {
        title: 'Fidalyz Demo',
        subtitle: 'AI-powered loyalty program management',
        back: '← Back',
        newReward: '+ New Reward',
        aiCampaign: '🤖 AI Campaign',
        generating: 'Generating...',
        totalMembers: 'Total Members',
        activePoints: 'Active Points',
        retentionRate: 'Retention Rate',
        avgBasket: 'Avg Basket',
        overview: 'Overview',
        members: 'Members',
        rewards: 'Rewards',
        analytics: 'Analytics',
        pointsActivity: 'Points Activity',
        memberSegments: 'Member Segments',
        liveActivityFeed: 'Live Activity Feed',
        earned: 'earned',
        redeemed: 'redeemed',
        joined: 'joined',
        points: 'points',
        purchase: 'Purchase',
        discount: 'Discount',
        welcomeBonus: 'Welcome Bonus',
        referralBonus: 'Referral Bonus',
        productReview: 'Product Review',
        quickActions: 'Quick Actions',
        sendCampaign: '📧 Send Campaign',
        targetVipMembers: 'Target VIP members',
        createEvent: '🎁 Create Event',
        doublePointsWeekend: 'Double points weekend',
        exportReport: '📊 Export Report',
        monthlyAnalytics: 'Monthly analytics',
        topMembers: 'Top Members',
        searchMembers: 'Search members...',
        member: 'Member',
        tier: 'Tier',
        totalSpent: 'Total Spent',
        visits: 'Visits',
        lastVisit: 'Last Visit',
        actions: 'Actions',
        active: 'Active',
        special: 'Special',
        claimed: 'claimed',
        weeklyEngagement: 'Weekly Engagement',
        performanceKpis: 'Performance KPIs',
        customerLifetimeValue: 'Customer Lifetime Value',
        avgPerMember: 'Average per member',
        netPromoterScore: 'Net Promoter Score',
        customerSatisfaction: 'Customer satisfaction',
        redemptionRate: 'Redemption Rate',
        pointsUtilization: 'Points utilization',
        optimal: 'Optimal',
        repeatPurchaseRate: 'Repeat Purchase Rate',
        withinDays: 'Within 30 days'
      }
    },
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      campaigns: 'Campaigns',
      leads: 'Leads',
      analytics: 'Analytics',
      settings: 'Settings',
      logout: 'Logout'
    },
    
    // Dashboard
    dashboard: {
      welcome: 'Welcome',
      credits: 'Credits',
      activeModules: 'Active Modules',
      recentActivity: 'Recent Activity',
      quickActions: {
        title: 'Quick Actions',
        newCampaign: 'New Campaign',
        viewAnalytics: 'View Analytics',
        manageTeam: 'Manage Team',
        settings: 'Settings'
      },
      activeApplications: 'Active Applications',
      users: 'Users',
      plan: 'Plan',
      applicationsStatus: 'Applications Status',
      active: 'Active',
      inactive: 'Inactive',
      comingSoon: 'Coming Soon',
      lastUpdate: 'Last Update',
      open: 'Open',
      welcomeMessage: 'Here\'s an overview of your activity and applications',
      greetings: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening'
      },
      stats: {
        campaigns: 'Campaigns',
        budget: 'Budget',
        roas: 'ROAS',
        contacts: 'Contacts',
        deals: 'Deals',
        revenue: 'Revenue',
        leads: 'Leads',
        engaged: 'Engaged',
        converted: 'Converted',
        rate: 'Rate',
        reviews: 'Reviews',
        rating: 'Rating',
        responses: 'Responses',
        posts: 'Posts',
        engagement: 'Engagement',
        followers: 'Followers',
        articles: 'Articles',
        quality: 'Quality',
        generated: 'Generated',
        emails: 'Emails',
        openRate: 'Open Rate',
        clicks: 'Clicks',
        reports: 'Reports',
        insights: 'Insights',
        accuracy: 'Accuracy'
      },
      releaseNotesTitle: 'Release Notes',
      releaseNotes: {
        v410: {
          title: 'DigiFlow Hub V4.1 - Optimizations and New Features',
          changes: [
            '🌐 Complete FR/EN translation system',
            '🚀 Performance improved by 45%',
            '🔐 Optimized Firebase authentication',
            '📊 New dashboard with real-time statistics',
            '🎨 Enhanced glassmorphism interface'
          ]
        },
        v405: {
          title: 'Fixes and Improvements',
          changes: [
            '🐛 Fixed 4-step registration process',
            '⚡ Optimized Pappers API requests',
            '📱 Improved mobile experience',
            '🔧 Fixed Firebase errors'
          ]
        },
        v400: {
          title: 'DigiFlow Hub V4 - Next Generation',
          changes: [
            '🎨 Completely redesigned interface',
            '🚀 Migration to Next.js 15',
            '🌐 Initial multilingual support',
            '🔐 New authentication system',
            '📊 Unified dashboard'
          ]
        }
      }
    },
    
    // Modules
    modules: {
      adsMaster: {
        name: 'Ads Master',
        description: 'Multi-platform advertising campaign management'
      },
      hubCRM: {
        name: 'HubCRM',
        description: 'Smart CRM with marketing automation'
      },
      leadWarm: {
        name: 'LeadWarm',
        description: 'Automatic lead nurturing and conversion'
      },
      fidalyz: {
        name: 'Fidalyz',
        description: 'E-reputation and customer review management'
      },
      socialBoost: {
        name: 'SocialBoost',
        description: 'Social media automation and management'
      },
      contentAI: {
        name: 'ContentAI',
        description: 'AI-powered content generation and optimization'
      },
      emailForge: {
        name: 'EmailForge',
        description: 'Automated and personalized email campaigns'
      },
      datalytics: {
        name: 'Datalytics',
        description: 'Advanced data analytics and reporting'
      }
    },
    
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      comingSoon: 'Coming Soon',
      connect: 'Connect',
      disconnect: 'Disconnect',
      minutes: 'minutes'
    },
    
    // Ads Master
    adsMaster: {
      subtitle: 'Multi-platform advertising campaign management',
      selectAccount: 'Ad Account',
      syncNow: 'Sync Now',
      syncing: 'Syncing...',
      lastSync: 'Last sync',
      connections: 'Connections',
      connected: 'Connected',
      confirmDisconnect: 'Are you sure you want to disconnect this account?',
      neverSynced: 'Never synced',
      justNow: 'Just now',
      minutesAgo: '{{minutes}} minutes ago',
      hoursAgo: '{{hours}} hours ago',
      daysAgo: '{{days}} days ago',
      cacheStatus: 'Cache status',
      cacheValid: 'Valid',
      cacheExpired: 'Expired',
      cacheDuration: 'Cache duration',
      forceRefresh: 'Force refresh',
      comingSoonTooltip: 'This feature will be available soon',
      googleComingSoon: 'Google Ads integration coming soon!',
      tiktokComingSoon: 'TikTok Ads integration coming soon!',
      connectMeta: 'Connect Meta Business',
      notConnected: {
        title: 'Meta account not connected',
        description: 'Connect your Meta account to view your campaign insights.'
      },
      noData: {
        title: 'No data available',
        description: 'No ad spend in the selected period.'
      },
      period: 'Period',
      metric: 'Metric',
      chartType: 'Chart type',
      lineChart: 'Line',
      barChart: 'Bar',
      evolution: 'evolution',
      campaigns: 'Campaigns',
      campaignName: 'Campaign name',
      status: 'Status',
      audienceMatrix: 'Audience matrix',
      metrics: {
        spend: 'Spend',
        ctr: 'CTR',
        cpc: 'CPC',
        cpm: 'CPM',
        conversions: 'Conversions',
        roas: 'ROAS'
      },
      dateRanges: {
        '7days': 'Last 7 days',
        '14days': 'Last 14 days',
        '30days': 'Last 30 days',
        'custom': 'Custom'
      },
      errors: {
        noAccountSelected: 'Please select an ad account',
        syncFailed: 'Sync failed',
        networkError: 'Network error'
      },
      ai: {
        generateInsights: 'Generate AI Insights',
        insightsDescription: 'Strengths, weaknesses and recommendations',
        optimizeBudget: 'Budget Optimization',
        optimizeDescription: 'Budget and targeting optimization',
        createAd: 'Create Ad with Visual',
        creativeDescription: 'AI-powered creative generation',
        subtitle: 'AI Assistant for your campaigns',
        credits: 'Available credits',
        cost: 'Cost',
        generating: 'Generating...',
        insufficientCredits: 'Insufficient credits',
        generationFailed: 'Generation failed',
        insightsTitle: 'Generated AI Insights',
        performanceScore: 'Performance Score',
        scoreDescription: 'Overall evaluation of your campaigns',
        strengths: 'Strengths',
        weaknesses: 'Weaknesses',
        recommendations: 'Recommendations',
        currentBudget: 'Current budget',
        recommendedBudget: 'Recommended budget',
        expectedImprovement: 'Expected improvement',
        optimizationActions: 'Optimization actions',
        applyOptimizations: 'Apply optimizations',
        applyChanges: 'Apply changes',
        mockStrength1: 'CTR above industry average',
        mockStrength2: 'Good targeting of 25-34 age group',
        mockStrength3: 'Stable ROAS over the last 7 days',
        mockWeakness1: 'High CPM on some campaigns',
        mockWeakness2: 'Low conversion rate on weekends',
        mockRecommendation1: 'Increase budget on high-performing audiences',
        mockRecommendation2: 'Reduce bids during low-performing time slots',
        mockRecommendation3: 'Test new creatives to improve CTR',
        mockRecommendation4: 'Enable retargeting for cart abandoners',
        mockOptimization1: 'Reallocate 15% of budget to 25-34 age group',
        mockOptimization2: 'Disable ads between 2am and 6am',
        mockOptimization3: 'Increase mobile bids by 10%'
      }
    },
    
    // Forms
    forms: {
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      company: 'Company',
      phone: 'Phone',
      required: 'Required field',
      invalidEmail: 'Invalid email',
      passwordTooShort: 'Password must be at least 8 characters'
    },
    
    // Dates
    dates: {
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      custom: 'Custom'
    }
  }
};

/**
 * Fonction helper pour obtenir une traduction
 */
export function t(key, locale = 'fr') {
  const keys = key.split('.');
  let translation = translations[locale] || translations.fr;
  
  for (const k of keys) {
    translation = translation[k];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key;
    }
  }
  
  return translation;
}