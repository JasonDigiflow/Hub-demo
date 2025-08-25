'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoData, getRealtimeMetrics, generateNewLead } from '@/lib/demo-data/aids-demo';

// Icônes SVG personnalisées
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

export default function AppReviewComplete() {
  // États principaux
  const [activeSection, setActiveSection] = useState('dashboard');
  const [campaigns, setCampaigns] = useState(demoData.campaigns);
  const [leads, setLeads] = useState(demoData.leads);
  const [metrics, setMetrics] = useState(getRealtimeMetrics());
  const [octaviaAnalysis, setOctaviaAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // États pour les modals
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOctaviaChat, setShowOctaviaChat] = useState(false);
  
  // États pour les formulaires
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    productDescription: '',
    objective: 'CONVERSIONS',
    budgetType: 'daily', // 'daily' ou 'weekly'
    dailyBudget: 100,
    weeklyBudget: 700,
    audienceType: 'ai', // 'ai' ou 'manual'
    audience: {
      ageMin: 18,
      ageMax: 65,
      gender: 'all',
      interests: [],
      locations: ['France'],
      languages: ['Français'],
      behaviors: [],
      customAudiences: [],
      lookalike: false
    },
    placement: 'automatic',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    bidStrategy: 'lowest_cost',
    optimizationGoal: 'conversions'
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [audienceSize, setAudienceSize] = useState({ min: 500000, max: 2000000 });
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newBudget, setNewBudget] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [applyingRecommendation, setApplyingRecommendation] = useState(null);
  
  // États pour le chat Octavia
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: "Bonjour ! Je suis Octavia, votre assistante IA powered by Claude 3.5 Sonnet. Comment puis-je optimiser vos campagnes aujourd'hui ?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // États pour les métriques avancées
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [hoveredMetric, setHoveredMetric] = useState(null);
  
  // États pour Business Manager
  const [ltv, setLtv] = useState(285.50);
  const [cac, setCac] = useState(42.30);
  const [ltvcac, setLtvCac] = useState(6.75);
  const [monthlyRecurringRevenue, setMrr] = useState(48500);
  const [churnRate, setChurnRate] = useState(2.3);
  const [customerLifetime, setCustomerLifetime] = useState(18.5);
  
  // États pour Pages & Assets
  const [managedPages] = useState([
    { 
      id: 'page_1', 
      name: 'TechCorp Solutions', 
      followers: 45673, 
      engagement: 4.8, 
      reach: 125400,
      adSpend: 8900,
      conversions: 156,
      pageViews: 23400,
      ctr: 3.4,
      status: 'active'
    },
    { 
      id: 'page_2', 
      name: 'E-commerce Store', 
      followers: 23891, 
      engagement: 6.2, 
      reach: 87300,
      adSpend: 5600,
      conversions: 89,
      pageViews: 18900,
      ctr: 4.1,
      status: 'active'
    },
    { 
      id: 'page_3', 
      name: 'Brand Awareness', 
      followers: 12456, 
      engagement: 3.7, 
      reach: 45600,
      adSpend: 3200,
      conversions: 34,
      pageViews: 9800,
      ctr: 2.8,
      status: 'paused'
    }
  ]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [roas, setRoas] = useState(3.2);
  const [cpm, setCpm] = useState(12.45);
  const [qualityScore, setQualityScore] = useState(8.7);
  const [adSpend, setAdSpend] = useState(12456.78);
  const [conversionRate, setConversionRate] = useState(2.45);
  const [frequencyCap, setFrequencyCap] = useState(1.8);
  const [engagementRate, setEngagementRate] = useState(4.2);
  const [videoViews, setVideoViews] = useState(234567);
  const [linkClicks, setLinkClicks] = useState(8934);
  const [costPerResult, setCostPerResult] = useState(18.50);
  const [reachGrowth, setReachGrowth] = useState(23.5);
  const [audienceOverlap, setAudienceOverlap] = useState(12.3);

  // Métriques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = getRealtimeMetrics();
      setMetrics(newMetrics);
      
      // Mettre à jour les métriques avancées
      setRoas(3.2 + (Math.random() - 0.5) * 0.3);
      setCpm(12.45 + (Math.random() - 0.5) * 2);
      setQualityScore(8.7 + (Math.random() - 0.5) * 0.5);
      setAdSpend(prev => prev + Math.random() * 10);
      setConversionRate(2.45 + (Math.random() - 0.5) * 0.3);
      setFrequencyCap(1.8 + (Math.random() - 0.5) * 0.2);
      setEngagementRate(4.2 + (Math.random() - 0.5) * 0.5);
      setVideoViews(prev => prev + Math.floor(Math.random() * 100));
      setLinkClicks(prev => prev + Math.floor(Math.random() * 20));
      setCostPerResult(18.50 + (Math.random() - 0.5) * 2);
      setReachGrowth(23.5 + (Math.random() - 0.5) * 3);
      setAudienceOverlap(12.3 + (Math.random() - 0.5) * 1.5);
      
      // Mettre à jour les métriques business
      setLtv(285.50 + (Math.random() - 0.5) * 10);
      setCac(42.30 + (Math.random() - 0.5) * 3);
      setLtvCac(ltv / cac);
      setMrr(48500 + (Math.random() - 0.5) * 1000);
      setChurnRate(2.3 + (Math.random() - 0.5) * 0.3);
      setCustomerLifetime(18.5 + (Math.random() - 0.5) * 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Nouveaux leads automatiques
  useEffect(() => {
    const interval = setInterval(() => {
      const newLead = generateNewLead();
      setLeads(prev => [newLead, ...prev]);
      showNotificationFunc(`🎉 Nouveau lead: ${newLead.name} de ${newLead.company}`);
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);

  // Analyse Octavia au chargement
  useEffect(() => {
    performOctaviaAnalysis();
  }, []);

  // Fonctions d'interaction
  const showNotificationFunc = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const performOctaviaAnalysis = async () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analyses = [
        {
          insight: "📈 Performance exceptionnelle détectée",
          detail: "Votre CTR de 3.6% dépasse la moyenne du secteur de 45%. Les campagnes de conversion performent particulièrement bien.",
          action: "Augmentez le budget de 30%",
          impact: "+42 conversions estimées"
        },
        {
          insight: "🎯 Opportunité d'audience identifiée",
          detail: "Les femmes 25-34 ans convertissent 2.3x mieux. Cette segment représente 35% de votre audience mais 58% de vos ventes.",
          action: "Créer une audience lookalike",
          impact: "ROI potentiel: 4.2x"
        },
        {
          insight: "⚡ Optimisation horaire recommandée",
          detail: "80% de vos conversions arrivent entre 19h et 23h, mais seulement 40% de votre budget y est alloué.",
          action: "Activer le dayparting",
          impact: "-25% de CPA estimé"
        }
      ];
      
      setOctaviaAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const createCampaign = () => {
    if (!newCampaign.name) {
      showNotificationFunc('❌ Veuillez entrer un nom de campagne');
      return;
    }
    
    const campaign = {
      id: `campaign_${Date.now()}`,
      name: newCampaign.name,
      status: 'ACTIVE',
      objective: newCampaign.objective,
      budget: newCampaign.budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      conversions: 0,
      costPerConversion: 0,
      reach: 0,
      frequency: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      performance: 'new'
    };
    
    setCampaigns([campaign, ...campaigns]);
    setShowCreateCampaignModal(false);
    showNotificationFunc(`✅ Campagne "${campaign.name}" créée avec succès !`);
    setNewCampaign({
      name: '',
      objective: 'CONVERSIONS',
      budget: 1000,
      audience: 'broad',
      placement: 'automatic'
    });
  };

  const updateBudget = () => {
    if (!editingCampaign || newBudget <= 0) {
      showNotificationFunc('❌ Budget invalide');
      return;
    }
    
    const updatedCampaigns = campaigns.map(c => 
      c.id === editingCampaign.id 
        ? { ...c, budget: newBudget }
        : c
    );
    
    setCampaigns(updatedCampaigns);
    setShowEditBudgetModal(false);
    showNotificationFunc(`✅ Budget de "${editingCampaign.name}" modifié : ${newBudget}€`);
    setEditingCampaign(null);
  };

  const syncLeads = async () => {
    setSyncingLeads(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newLeadsList = [];
    for (let i = 0; i < 5; i++) {
      newLeadsList.push(generateNewLead());
    }
    
    setLeads([...newLeadsList, ...leads]);
    setSyncingLeads(false);
    showNotificationFunc(`✅ 5 nouveaux leads synchronisés depuis Meta !`);
  };

  const exportLeads = (format) => {
    if (format === 'csv') {
      const csv = [
        'Nom,Email,Entreprise,Téléphone,Score,Statut,Source,Date',
        ...leads.map(l => 
          `"${l.name}","${l.email}","${l.company}","${l.phone}",${l.score},"${l.status}","${l.source}","${l.createdTime}"`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      showNotificationFunc('✅ Export CSV téléchargé !');
    } else {
      showNotificationFunc('📊 Export PDF en cours de génération...');
      setTimeout(() => {
        showNotificationFunc('✅ Export PDF téléchargé !');
      }, 2000);
    }
    setShowExportModal(false);
  };

  const applyRecommendation = (rec) => {
    setApplyingRecommendation(rec);
    
    setTimeout(() => {
      if (rec.action.includes('budget')) {
        const campaign = campaigns[0];
        setCampaigns(campaigns.map(c => 
          c.id === campaign.id 
            ? { ...c, budget: c.budget + 500 }
            : c
        ));
        showNotificationFunc('✅ Budget augmenté de 500€');
      } else if (rec.action.includes('audience')) {
        showNotificationFunc('✅ Audience lookalike créée');
      } else if (rec.action.includes('dayparting')) {
        showNotificationFunc('✅ Planning optimisé pour 19h-23h');
      }
      
      setApplyingRecommendation(null);
    }, 1500);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { type: 'user', text: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const responses = [
        "J'analyse vos campagnes avec Claude 3.5 Sonnet... Votre CTR de 3.6% est excellent ! Je recommande d'augmenter le budget de 20% sur la campagne Black Friday.",
        "Les données montrent que vos leads de qualité proviennent principalement des femmes 25-34 ans. Créons une audience similaire pour maximiser les conversions !",
        "Votre coût par conversion de 36€ est compétitif. Avec une optimisation créative basée sur l'IA, nous pouvons le réduire à 28€.",
        "Les performances sont meilleures entre 20h et 22h. J'ajuste automatiquement vos enchères pour ces créneaux. Impact estimé : +15% de conversions."
      ];
      
      const botMessage = { 
        type: 'bot', 
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
        : c
    ));
    showNotificationFunc('✅ Statut de la campagne modifié');
  };

  const changeLeadStatus = (leadId, newStatus) => {
    setLeads(leads.map(l => 
      l.id === leadId 
        ? { ...l, status: newStatus }
        : l
    ));
    showNotificationFunc(`✅ Statut du lead modifié : ${newStatus}`);
  };

  const duplicateCampaign = (campaign) => {
    const newCamp = {
      ...campaign,
      id: `campaign_${Date.now()}`,
      name: `${campaign.name} (Copie)`,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0
    };
    setCampaigns([newCamp, ...campaigns]);
    showNotificationFunc(`✅ Campagne "${campaign.name}" dupliquée`);
  };

  // Nouvelles fonctions pour Business Management
  const generateBusinessReport = (type) => {
    const reports = {
      'P&L': {
        revenue: monthlyRecurringRevenue,
        costs: monthlyRecurringRevenue * 0.65,
        profit: monthlyRecurringRevenue * 0.35,
        margin: '35%'
      },
      'ROI': {
        totalInvestment: cac * metrics.conversions,
        totalRevenue: ltv * metrics.conversions,
        roi: ((ltv/cac - 1) * 100).toFixed(0) + '%',
        paybackPeriod: (cac / (monthlyRecurringRevenue / 1000)).toFixed(1) + ' mois'
      }
    };
    
    const report = reports[type] || reports['P&L'];
    console.log(`Business Report (${type}):`, report);
    return report;
  };

  const optimizeBudgetAllocation = () => {
    const channels = [
      { name: 'Facebook Ads', currentBudget: 22500, recommendedBudget: 27000, reason: 'High ROAS performance' },
      { name: 'Google Ads', currentBudget: 15000, recommendedBudget: 12000, reason: 'Diminishing returns' },
      { name: 'LinkedIn Ads', currentBudget: 7500, recommendedBudget: 9000, reason: 'Growing B2B segment' },
      { name: 'Autres canaux', currentBudget: 5000, recommendedBudget: 2000, reason: 'Poor performance' }
    ];
    
    showNotificationFunc('🎯 Optimisation budget calculée - voir console pour détails');
    console.log('Budget Optimization Recommendations:', channels);
    return channels;
  };

  // Nouvelles fonctions pour Pages Management
  const bulkUpdatePages = (action, pageIds) => {
    const selectedPageDetails = managedPages.filter(page => pageIds.includes(page.id));
    
    switch(action) {
      case 'budget':
        showNotificationFunc(`💰 Budget mis à jour pour ${pageIds.length} pages`);
        break;
      case 'audience':
        showNotificationFunc(`🎯 Audiences synchronisées pour ${pageIds.length} pages`);
        break;
      case 'duplicate':
        showNotificationFunc(`📋 Campagnes dupliquées pour ${pageIds.length} pages`);
        break;
      case 'export':
        const exportData = selectedPageDetails.map(page => ({
          name: page.name,
          followers: page.followers,
          engagement: page.engagement,
          adSpend: page.adSpend,
          conversions: page.conversions,
          roi: ((page.conversions * 125) / page.adSpend).toFixed(2)
        }));
        console.log('Pages Export Data:', exportData);
        showNotificationFunc(`📊 Données exportées pour ${pageIds.length} pages`);
        break;
      case 'schedule':
        showNotificationFunc(`📅 Publications planifiées pour ${pageIds.length} pages`);
        break;
      default:
        showNotificationFunc(`✅ Action "${action}" appliquée sur ${pageIds.length} pages`);
    }
  };

  const calculatePageROI = (page) => {
    const revenue = page.conversions * 125; // AOV moyen
    const roi = ((revenue - page.adSpend) / page.adSpend * 100).toFixed(1);
    return { revenue, roi };
  };

  // Calculer les métriques dérivées
  const calculatedCvr = ((metrics.conversions / metrics.clicks) * 100).toFixed(2);
  const avgOrderValue = (metrics.conversions * 125).toFixed(0);
  const revenue = (metrics.conversions * 125).toFixed(0);
  const profit = (revenue - metrics.spent).toFixed(0);
  const profitMargin = ((profit / revenue) * 100).toFixed(1);

  const sections = [
    { id: 'dashboard', name: 'Vue d\'ensemble', icon: '🎯', color: 'from-purple-600 to-pink-600' },
    { id: 'business', name: 'Business Manager', icon: '💼', color: 'from-emerald-600 to-teal-600', highlight: true },
    { id: 'pages', name: 'Pages & Assets', icon: '📄', color: 'from-indigo-600 to-blue-600', highlight: true },
    { id: 'campaigns', name: 'Campagnes', icon: '📊', color: 'from-blue-600 to-cyan-600' },
    { id: 'leads', name: 'Prospects', icon: '👥', color: 'from-green-600 to-emerald-600' },
    { id: 'insights', name: 'Insights', icon: '📈', color: 'from-orange-600 to-red-600' },
    { id: 'ai', name: 'IA Octavia', icon: '🤖', color: 'from-violet-600 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Facebook App Review Compliance Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-white font-bold text-lg">
                Facebook App Review Compliance Dashboard
              </p>
              <p className="text-blue-100 text-sm">
                Démonstration des permissions: <span className="font-semibold">business_management</span> • <span className="font-semibold">page_manage_ads</span> • <span className="font-semibold">ads_management</span>
              </p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
      </div>

      {/* Header Premium */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AIDs Premium Dashboard
                </h1>
                <p className="text-sm text-gray-400">Powered by Octavia AI • Claude 3.5 Sonnet (Oct 2024)</p>
              </div>
            </div>
            
            {/* Métriques en temps réel dans le header */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Spend Today</p>
                <p className="text-xl font-bold text-white">
                  €{adSpend.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">ROAS</p>
                <p className="text-xl font-bold text-green-400">
                  {roas.toFixed(2)}x
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Quality Score</p>
                <p className="text-xl font-bold text-purple-400">
                  {qualityScore.toFixed(1)}/10
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/app/aids'}
                className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white hover:bg-white/20 transition-all"
              >
                Mode Production →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation élégante */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  relative px-6 py-3 rounded-lg font-medium transition-all
                  ${activeSection === section.id 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                  }
                  ${section.highlight ? 'ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/20' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className={`absolute inset-0 bg-gradient-to-r ${section.color} rounded-lg`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  {section.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 max-w-md"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Analyse Octavia en temps réel */}
            <motion.div 
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Analyse Octavia en temps réel
                    </h3>
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <p className="text-gray-300">Analyse des performances en cours...</p>
                      </div>
                    ) : octaviaAnalysis ? (
                      <div className="space-y-2">
                        <p className="text-white font-medium">{octaviaAnalysis.insight}</p>
                        <p className="text-gray-300 text-sm">{octaviaAnalysis.detail}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button 
                            onClick={() => applyRecommendation(octaviaAnalysis)}
                            className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-all"
                          >
                            {octaviaAnalysis.action}
                          </button>
                          <span className="text-green-400 text-sm">
                            Impact: {octaviaAnalysis.impact}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={performOctaviaAnalysis}
                  className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all"
                >
                  Rafraîchir
                </button>
              </div>
            </motion.div>

            {/* Métriques principales - Ligne 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  title: 'Revenue', 
                  value: `€${revenue}`, 
                  change: '+22%', 
                  trend: 'up',
                  color: 'from-green-600 to-emerald-600',
                  detail: `€${avgOrderValue} AOV`
                },
                { 
                  title: 'ROAS', 
                  value: `${roas.toFixed(2)}x`, 
                  change: '+15%', 
                  trend: 'up',
                  color: 'from-blue-600 to-cyan-600',
                  detail: `Target: 4.0x`
                },
                { 
                  title: 'Conversions', 
                  value: metrics.conversions, 
                  change: '+18%', 
                  trend: 'up',
                  color: 'from-purple-600 to-pink-600',
                  detail: `${conversionRate.toFixed(2)}% CVR`
                },
                { 
                  title: 'CTR', 
                  value: `${metrics.ctr.toFixed(2)}%`, 
                  change: '+0.5%', 
                  trend: 'up',
                  color: 'from-orange-600 to-red-600',
                  detail: `${linkClicks.toLocaleString()} clics`
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onHoverStart={() => setHoveredMetric(metric.title)}
                  onHoverEnd={() => setHoveredMetric(null)}
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => showNotificationFunc(`${metric.title}: ${metric.value} (${metric.change})`)}
                >
                  <div className={`
                    bg-gradient-to-br ${metric.color} p-[1px] rounded-2xl
                    ${hoveredMetric === metric.title ? 'shadow-2xl shadow-purple-600/20' : ''}
                  `}>
                    <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                        <div className={`
                          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${metric.trend === 'up' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                          }
                        `}>
                          {metric.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                          {metric.change}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500">{metric.detail}</p>
                      
                      {/* Mini graphique */}
                      <div className="mt-3 flex items-end gap-1 h-8">
                        {[...Array(7)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`flex-1 bg-gradient-to-t ${metric.color} rounded-t opacity-60`}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 100}%` }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Effet de brillance au hover */}
                  {hoveredMetric === metric.title && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Métriques secondaires - Ligne 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {[
                { 
                  title: 'CPM', 
                  value: `€${cpm.toFixed(2)}`, 
                  change: '-8%', 
                  trend: 'down',
                  color: 'from-indigo-600 to-blue-600',
                  detail: `${metrics.impressions.toLocaleString()} imp.`
                },
                { 
                  title: 'Fréquence', 
                  value: frequencyCap.toFixed(2), 
                  change: '+0.2', 
                  trend: 'up',
                  color: 'from-teal-600 to-cyan-600',
                  detail: 'Optimal: 1.5-2.0'
                },
                { 
                  title: 'Engagement', 
                  value: `${engagementRate.toFixed(1)}%`, 
                  change: '+1.2%', 
                  trend: 'up',
                  color: 'from-pink-600 to-rose-600',
                  detail: `${videoViews.toLocaleString()} vues`
                },
                { 
                  title: 'CPA', 
                  value: `€${costPerResult.toFixed(2)}`, 
                  change: '-12%', 
                  trend: 'down',
                  color: 'from-amber-600 to-orange-600',
                  detail: 'Target: €15'
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => showNotificationFunc(`${metric.title}: ${metric.value} (${metric.change})`)}
                >
                  <div className={`
                    bg-gradient-to-br ${metric.color} p-[1px] rounded-2xl
                  `}>
                    <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                        <div className={`
                          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${metric.trend === 'up' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                          }
                        `}>
                          {metric.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                          {metric.change}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500">{metric.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Insights avancés */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Performance par heure */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">🕐 Heures de pointe</h3>
                <div className="space-y-3">
                  {[
                    { hour: '20h-22h', performance: 92, conversions: 156 },
                    { hour: '12h-14h', performance: 78, conversions: 98 },
                    { hour: '18h-20h', performance: 85, conversions: 124 }
                  ].map((time) => (
                    <div key={time.hour} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{time.hour}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-800 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${time.performance}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium">{time.conversions}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 Augmentez les enchères de 25% sur 20h-22h
                </p>
              </motion.div>

              {/* Top audiences */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">👥 Top Audiences</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Femmes 25-34', roas: 4.2, spend: 3456 },
                    { name: 'Lookalike 1%', roas: 3.8, spend: 2890 },
                    { name: 'Remarketing', roas: 5.1, spend: 1234 }
                  ].map((audience) => (
                    <div key={audience.name} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{audience.name}</span>
                        <span className="text-green-400 text-sm font-bold">{audience.roas}x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Dépenses</span>
                        <span className="text-gray-400 text-xs">€{audience.spend}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 Dupliquez la campagne Remarketing
                </p>
              </motion.div>

              {/* Créatives performantes */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">🎨 Top Créatives</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Vidéo 15s', ctr: 3.8, fatigue: 'Faible' },
                    { type: 'Carrousel', ctr: 2.9, fatigue: 'Moyenne' },
                    { type: 'Image statique', ctr: 1.8, fatigue: 'Élevée' }
                  ].map((creative) => (
                    <div key={creative.type} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{creative.type}</span>
                        <span className="text-blue-400 text-sm font-bold">{creative.ctr}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Fatigue</span>
                        <span className={`text-xs font-medium ${
                          creative.fatigue === 'Faible' ? 'text-green-400' :
                          creative.fatigue === 'Moyenne' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>{creative.fatigue}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 Remplacez les images statiques
                </p>
              </motion.div>
            </div>

            {/* Recommandations AI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 mt-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">🎯 Opportunités d'optimisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Audience Overlap",
                    description: `${audienceOverlap.toFixed(1)}% de chevauchement détecté`,
                    action: "Consolider les audiences",
                    impact: "+15% reach",
                    priority: "high"
                  },
                  {
                    title: "Budget Distribution",
                    description: "80% du budget sur 20% des campagnes",
                    action: "Redistribuer le budget",
                    impact: "+€2.3k profit",
                    priority: "medium"
                  },
                  {
                    title: "Creative Refresh",
                    description: "3 créatives en fatigue avancée",
                    action: "Nouvelles variantes",
                    impact: "+0.8% CTR",
                    priority: "high"
                  },
                  {
                    title: "Placement Optimization",
                    description: "Stories 40% moins cher que Feed",
                    action: "Shift vers Stories",
                    impact: "-25% CPA",
                    priority: "medium"
                  },
                  {
                    title: "Dayparting",
                    description: "Nuit = 60% moins de conversions",
                    action: "Pauser 00h-06h",
                    impact: "+18% ROAS",
                    priority: "low"
                  },
                  {
                    title: "Reach Growth",
                    description: `+${reachGrowth.toFixed(1)}% cette semaine`,
                    action: "Augmenter fréquence",
                    impact: "+12% conversions",
                    priority: "medium"
                  }
                ].map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => {
                      setApplyingRecommendation(rec);
                      setTimeout(() => {
                        showNotificationFunc(`✅ ${rec.action} appliqué ! Impact attendu: ${rec.impact}`);
                        setApplyingRecommendation(null);
                      }, 1500);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority === 'high' ? 'Urgent' :
                         rec.priority === 'medium' ? 'Important' : 'Info'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-xs font-medium">
                        {applyingRecommendation?.title === rec.title ? 'Application...' : rec.action}
                      </span>
                      <span className="text-green-400 text-xs font-bold">{rec.impact}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Campaigns Section */}
        {activeSection === 'campaigns' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Gestion des Campagnes</h2>
              <button 
                onClick={() => setShowCreateCampaignModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-600/20"
              >
                + Créer une campagne
              </button>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign, i) => (
                <motion.div 
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          campaign.status === 'ACTIVE' 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                      >
                        {campaign.status}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setNewBudget(campaign.budget);
                          setShowEditBudgetModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                      >
                        Modifier Budget
                      </button>
                      <button 
                        onClick={() => duplicateCampaign(campaign)}
                        className="px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-all"
                      >
                        Dupliquer
                      </button>
                      <button 
                        onClick={() => showNotificationFunc('🤖 Optimisation IA appliquée')}
                        className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all"
                      >
                        Optimiser avec IA
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="text-lg font-bold text-white">€{campaign.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dépensé</p>
                      <p className="text-lg font-bold text-blue-400">€{campaign.spent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CTR</p>
                      <p className="text-lg font-bold text-green-400">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CPC</p>
                      <p className="text-lg font-bold text-purple-400">€{campaign.cpc}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Conversions</p>
                      <p className="text-lg font-bold text-pink-400">{campaign.conversions}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leads Section */}
        {activeSection === 'leads' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Centre de Prospects</h2>
              <div className="flex gap-3">
                <button 
                  onClick={syncLeads}
                  disabled={syncingLeads}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {syncingLeads ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      🔄 Synchroniser Meta Leads
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                >
                  📥 Exporter
                </button>
              </div>
            </div>

            {/* Table de leads */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entreprise</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.slice(0, 10).map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{lead.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{lead.company}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.score >= 80 ? 'bg-green-500/20 text-green-400' : 
                          lead.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {lead.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={lead.status}
                          onChange={(e) => changeLeadStatus(lead.id, e.target.value)}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs cursor-pointer hover:bg-blue-600/30"
                        >
                          <option value="new">Nouveau</option>
                          <option value="contacted">Contacté</option>
                          <option value="qualified">Qualifié</option>
                          <option value="converted">Converti</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDetailsModal(true);
                          }}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Voir détails →
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Insights Section */}
        {activeSection === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Insights Avancés</h2>

            {/* Métriques détaillées des insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Reach Total', value: '1.2M', change: '+23%', icon: '👥' },
                { label: 'Frequency Cap', value: frequencyCap.toFixed(2), change: '+0.2', icon: '📊' },
                { label: 'Video Views', value: `${(videoViews/1000).toFixed(1)}k`, change: '+18%', icon: '🎬' },
                { label: 'Link Clicks', value: `${(linkClicks/1000).toFixed(1)}k`, change: '+15%', icon: '🔗' },
                { label: 'Engagement', value: `${engagementRate.toFixed(1)}%`, change: '+1.2%', icon: '💬' },
                { label: 'Quality Score', value: qualityScore.toFixed(1), change: '+0.5', icon: '⭐' }
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                  onClick={() => showNotificationFunc(`${metric.label}: ${metric.value} (${metric.change})`)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                  <p className="text-lg font-bold text-white">{metric.value}</p>
                  <p className={`text-xs mt-1 ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Analyse comparative des périodes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">📈 Comparaison vs période précédente</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { metric: 'Impressions', current: '2.3M', previous: '1.8M', growth: '+27.8%' },
                  { metric: 'Clicks', current: '45.6k', previous: '38.2k', growth: '+19.4%' },
                  { metric: 'Conversions', current: '892', previous: '712', growth: '+25.3%' },
                  { metric: 'Revenue', current: '€48.5k', previous: '€37.2k', growth: '+30.4%' }
                ].map((data) => (
                  <div key={data.metric} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{data.metric}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">{data.current}</span>
                      <span className="text-xs text-gray-500">vs {data.previous}</span>
                    </div>
                    <p className="text-sm font-medium text-green-400 mt-1">{data.growth}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Démographie interactive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-4">Répartition par âge</h3>
                {demoData.insights.demographics.age.map((age, i) => (
                  <motion.div
                    key={age.range}
                    className="flex items-center justify-between mb-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                    onClick={() => showNotificationFunc(`${age.range} ans: ${age.conversions} conversions, ${age.clicks} clics`)}
                  >
                    <span className="text-gray-300">{age.range} ans</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-800 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${age.percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12 text-right">{age.percentage}%</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-4">Performance par heure</h3>
                <div className="flex items-end gap-2 h-48">
                  {demoData.insights.timeAnalysis.bestHours.map((hour, i) => (
                    <motion.div
                      key={hour.hour}
                      className="flex-1 flex flex-col items-center cursor-pointer group"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => showNotificationFunc(`Planification optimisée pour ${hour.hour}`)}
                    >
                      <div className="hidden group-hover:block absolute -mt-8 bg-gray-700 px-2 py-1 rounded text-xs">
                        {hour.performance}%
                      </div>
                      <motion.div
                        className="w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-t hover:from-green-500 hover:to-emerald-500"
                        initial={{ height: 0 }}
                        animate={{ height: `${hour.performance}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                      <span className="text-xs mt-2 text-gray-400">{hour.hour}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Insights supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Devices Performance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">📱 Performance par appareil</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Mobile', percentage: 72, ctr: 4.2, conversions: 678 },
                    { device: 'Desktop', percentage: 23, ctr: 2.8, conversions: 187 },
                    { device: 'Tablet', percentage: 5, ctr: 3.1, conversions: 27 }
                  ].map((item) => (
                    <div key={item.device} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.device}</span>
                        <span className="text-blue-400 font-bold">{item.percentage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">CTR: </span>
                          <span className="text-gray-300">{item.ctr}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Conv: </span>
                          <span className="text-gray-300">{item.conversions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Placements Analysis */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">📍 Analyse des placements</h3>
                <div className="space-y-3">
                  {[
                    { placement: 'Feed', spend: 5678, roas: 3.4, cpm: 15.20 },
                    { placement: 'Stories', spend: 3456, roas: 4.1, cpm: 8.90 },
                    { placement: 'Reels', spend: 2345, roas: 3.8, cpm: 10.50 },
                    { placement: 'Messenger', spend: 890, roas: 2.9, cpm: 12.30 }
                  ].map((item) => (
                    <div key={item.placement} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{item.placement}</span>
                        <span className="text-green-400 font-bold text-sm">{item.roas}x</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Spend: </span>
                          <span className="text-gray-300">€{item.spend}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CPM: </span>
                          <span className="text-gray-300">€{item.cpm}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Geographic Performance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-4">🗺️ Top régions</h3>
                <div className="space-y-3">
                  {[
                    { region: 'Île-de-France', revenue: 18900, cpa: 22.50, share: 38 },
                    { region: 'PACA', revenue: 12340, cpa: 19.80, share: 25 },
                    { region: 'Rhône-Alpes', revenue: 8760, cpa: 21.20, share: 18 },
                    { region: 'Occitanie', revenue: 5430, cpa: 24.90, share: 11 },
                    { region: 'Autres', revenue: 3070, cpa: 28.50, share: 8 }
                  ].map((item) => (
                    <div key={item.region} className="bg-white/5 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{item.region}</span>
                        <span className="text-purple-400 font-bold text-sm">{item.share}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Rev: </span>
                          <span className="text-gray-300">€{(item.revenue/1000).toFixed(1)}k</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CPA: </span>
                          <span className="text-gray-300">€{item.cpa}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Alertes et anomalies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-600/10 to-orange-600/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 mt-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">⚠️ Alertes et anomalies détectées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    type: 'Fatigue créative',
                    severity: 'high',
                    message: '3 ads avec CTR en baisse de 35% sur 7 jours',
                    action: 'Rafraîchir créatives'
                  },
                  {
                    type: 'Budget inefficace',
                    severity: 'medium',
                    message: 'Campaign "Summer Sale" dépense 40% sans conversions',
                    action: 'Pauser campagne'
                  },
                  {
                    type: 'Audience saturée',
                    severity: 'high',
                    message: 'Fréquence > 3.5 sur audience "Remarketing 30j"',
                    action: 'Élargir audience'
                  },
                  {
                    type: 'Pic de CPA',
                    severity: 'medium',
                    message: 'CPA +45% sur placement Instagram Explore',
                    action: 'Exclure placement'
                  },
                  {
                    type: 'Opportunité manquée',
                    severity: 'low',
                    message: 'Budget non dépensé: €890 hier',
                    action: 'Augmenter enchères'
                  },
                  {
                    type: 'Performance exceptionnelle',
                    severity: 'success',
                    message: 'ROAS 6.2x sur Lookalike 1% Femmes 25-34',
                    action: 'Augmenter budget'
                  }
                ].map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white/5 rounded-xl p-4 border cursor-pointer hover:bg-white/10 transition-all ${
                      alert.severity === 'high' ? 'border-red-500/50' :
                      alert.severity === 'medium' ? 'border-yellow-500/50' :
                      alert.severity === 'success' ? 'border-green-500/50' :
                      'border-blue-500/50'
                    }`}
                    onClick={() => showNotificationFunc(`Action appliquée: ${alert.action}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white font-medium text-sm">{alert.type}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        alert.severity === 'success' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.severity === 'high' ? '🔴 Urgent' :
                         alert.severity === 'medium' ? '🟡 Important' :
                         alert.severity === 'success' ? '🟢 Opportunité' :
                         '🔵 Info'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{alert.message}</p>
                    <button className="text-purple-400 text-xs font-medium hover:text-purple-300 transition-colors">
                      → {alert.action}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Business Manager Section - Facebook business_management Permission */}
        {activeSection === 'business' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="text-3xl">💼</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Business Manager Hub
                  </h2>
                  <p className="text-emerald-400 font-semibold text-lg">
                    🔒 Utilise la permission business_management de Facebook
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs Principaux Business */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-emerald-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📈</span>
                KPIs Business Essentiels
                <span className="bg-emerald-500 text-emerald-900 px-3 py-1 rounded-full text-sm font-bold">
                  BUSINESS MANAGEMENT
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { 
                    title: 'Revenue (MRR)', 
                    value: `€${monthlyRecurringRevenue.toLocaleString()}`, 
                    change: '+18%', 
                    trend: 'up',
                    color: 'from-green-600 to-emerald-600',
                    detail: 'Monthly Recurring Revenue',
                    size: 'large'
                  },
                  { 
                    title: 'Profit', 
                    value: `€${(monthlyRecurringRevenue * 0.35).toLocaleString()}`, 
                    change: '+25%', 
                    trend: 'up',
                    color: 'from-blue-600 to-cyan-600',
                    detail: `${(35).toFixed(1)}% marge`,
                    size: 'large'
                  },
                  { 
                    title: 'LTV', 
                    value: `€${ltv.toFixed(2)}`, 
                    change: '+12%', 
                    trend: 'up',
                    color: 'from-purple-600 to-pink-600',
                    detail: 'Lifetime Value',
                    size: 'large'
                  },
                  { 
                    title: 'CAC', 
                    value: `€${cac.toFixed(2)}`, 
                    change: '-8%', 
                    trend: 'down',
                    color: 'from-orange-600 to-red-600',
                    detail: 'Cost per Acquisition',
                    size: 'large'
                  },
                  { 
                    title: 'LTV/CAC Ratio', 
                    value: `${(ltv/cac).toFixed(2)}x`, 
                    change: '+22%', 
                    trend: 'up',
                    color: 'from-indigo-600 to-purple-600',
                    detail: 'Target: >3.0x',
                    size: 'large'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative overflow-hidden cursor-pointer"
                  >
                    <div className={`
                      bg-gradient-to-br ${metric.color} p-[2px] rounded-2xl shadow-2xl
                    `}>
                      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 h-full">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-gray-300 text-sm font-semibold">{metric.title}</p>
                          <div className={`
                            flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                            ${metric.trend === 'up' 
                              ? 'bg-green-500/30 text-green-300' 
                              : 'bg-red-500/30 text-red-300'
                            }
                          `}>
                            {metric.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                            {metric.change}
                          </div>
                        </div>
                        <p className="text-3xl font-black text-white mb-2">
                          {metric.value}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">{metric.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Projections Financières */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📉</span>
                Projections & Budget Allocation
                <span className="bg-blue-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                  BUSINESS TOOLS
                </span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Projections */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white mb-4">Projections 90 jours</h4>
                  {[
                    { period: 'Mois 1', revenue: monthlyRecurringRevenue * 1.05, growth: '+5%' },
                    { period: 'Mois 2', revenue: monthlyRecurringRevenue * 1.12, growth: '+12%' },
                    { period: 'Mois 3', revenue: monthlyRecurringRevenue * 1.25, growth: '+25%' }
                  ].map((proj) => (
                    <div key={proj.period} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">{proj.period}</span>
                        <p className="text-gray-400 text-sm">Revenue prévue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">€{proj.revenue.toLocaleString()}</p>
                        <p className="text-green-400 text-sm font-medium">{proj.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Budget Allocation */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white mb-4">Répartition Budget</h4>
                  {[
                    { channel: 'Facebook Ads', allocation: 45, budget: 22500, performance: 'excellent' },
                    { channel: 'Google Ads', allocation: 30, budget: 15000, performance: 'good' },
                    { channel: 'LinkedIn Ads', allocation: 15, budget: 7500, performance: 'average' },
                    { channel: 'Autres canaux', allocation: 10, budget: 5000, performance: 'testing' }
                  ].map((channel) => (
                    <div key={channel.channel} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{channel.channel}</span>
                        <span className="text-emerald-400 font-bold">{channel.allocation}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-800 rounded-full h-3 mr-3">
                          <motion.div 
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${channel.allocation}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <span className="text-white text-sm">€{channel.budget.toLocaleString()}</span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        channel.performance === 'excellent' ? 'text-green-400' :
                        channel.performance === 'good' ? 'text-blue-400' :
                        channel.performance === 'average' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        Performance: {channel.performance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROI Analysis & Business Impact */}
            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                ROI Analysis & Business Impact
                <span className="bg-purple-500 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                  IMPACT MEASUREMENT
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'ROI Global',
                    value: `${((ltv/cac - 1) * 100).toFixed(0)}%`,
                    description: 'Retour sur investissement total',
                    impact: '+€425k revenue générée',
                    color: 'from-green-600 to-emerald-600'
                  },
                  {
                    title: 'Payback Period',
                    value: `${(cac / (monthlyRecurringRevenue / 1000)).toFixed(1)} mois`,
                    description: 'Temps de retour sur CAC',
                    impact: 'Amélioration de 2.3 mois',
                    color: 'from-blue-600 to-cyan-600'
                  },
                  {
                    title: 'Customer Lifetime',
                    value: `${customerLifetime.toFixed(1)} mois`,
                    description: 'Durée vie client moyenne',
                    impact: `Churn rate: ${churnRate.toFixed(1)}%`,
                    color: 'from-purple-600 to-pink-600'
                  }
                ].map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-black/40 rounded-xl p-6 border border-white/10"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center mb-4`}>
                      <span className="text-2xl">📈</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{metric.title}</h4>
                    <p className="text-3xl font-black text-white mb-2">{metric.value}</p>
                    <p className="text-gray-400 text-sm mb-2">{metric.description}</p>
                    <p className="text-emerald-400 text-sm font-medium">{metric.impact}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Export Reports Functionality */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-xl">📄</span>
                Export Business Reports
                <span className="bg-gray-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  REPORTING TOOLS
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'P&L Statement', format: 'PDF', icon: '📊', color: 'bg-red-600' },
                  { name: 'ROI Analysis', format: 'Excel', icon: '📈', color: 'bg-green-600' },
                  { name: 'Budget Allocation', format: 'CSV', icon: '💰', color: 'bg-blue-600' },
                  { name: 'KPIs Dashboard', format: 'PDF', icon: '🏆', color: 'bg-purple-600' }
                ].map((report) => (
                  <motion.button
                    key={report.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const businessData = generateBusinessReport(report.name.includes('P&L') ? 'P&L' : 'ROI');
                      showNotificationFunc(`✅ Export ${report.name} (${report.format}) téléchargé !`);
                    }}
                    className={`${report.color} rounded-lg p-4 text-white hover:opacity-90 transition-all`}
                  >
                    <div className="text-2xl mb-2">{report.icon}</div>
                    <div className="text-sm font-bold">{report.name}</div>
                    <div className="text-xs opacity-80">{report.format}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pages & Assets Section - Facebook page_manage_ads Permission */}
        {activeSection === 'pages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-3xl">📄</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Pages & Assets Manager
                  </h2>
                  <p className="text-indigo-400 font-semibold text-lg">
                    🔒 Utilise la permission page_manage_ads de Facebook
                  </p>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  Bulk Operations
                  <span className="bg-indigo-500 text-indigo-900 px-3 py-1 rounded-full text-sm font-bold">
                    PAGE MANAGEMENT
                  </span>
                </h3>
                <div className="text-sm text-gray-400">
                  {selectedPages.length} page(s) sélectionnée(s)
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {[
                  { action: 'Mettre à jour budget', icon: '💰', color: 'bg-green-600' },
                  { action: 'Synchroniser audiences', icon: '🎯', color: 'bg-blue-600' },
                  { action: 'Dupliquer campagnes', icon: '📋', color: 'bg-purple-600' },
                  { action: 'Exporter rapports', icon: '📄', color: 'bg-orange-600' },
                  { action: 'Planifier publications', icon: '📅', color: 'bg-pink-600' }
                ].map((bulk) => (
                  <motion.button
                    key={bulk.action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={selectedPages.length === 0}
                    onClick={() => {
                      if (selectedPages.length > 0) {
                        const actionMap = {
                          'Mettre à jour budget': 'budget',
                          'Synchroniser audiences': 'audience',
                          'Dupliquer campagnes': 'duplicate',
                          'Exporter rapports': 'export',
                          'Planifier publications': 'schedule'
                        };
                        bulkUpdatePages(actionMap[bulk.action], selectedPages);
                        setSelectedPages([]);
                      }
                    }}
                    className={`${bulk.color} disabled:bg-gray-600 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2`}
                  >
                    <span>{bulk.icon}</span>
                    {bulk.action}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Pages List with Performance */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 bg-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                  <span className="text-xl">📈</span>
                  Pages Managées - Performance Publicitaire
                  <span className="bg-blue-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                    AD PERFORMANCE
                  </span>
                </h3>
                
                {/* Select All */}
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedPages.length === managedPages.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPages(managedPages.map(p => p.id));
                      } else {
                        setSelectedPages([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-gray-300 text-sm font-medium">
                    Sélectionner toutes les pages
                  </label>
                </div>
              </div>
              
              <div className="divide-y divide-white/5">
                {managedPages.map((page, i) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages([...selectedPages, page.id]);
                          } else {
                            setSelectedPages(selectedPages.filter(id => id !== page.id));
                          }
                        }}
                        className="mt-2 w-4 h-4 text-blue-600"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-white">{page.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              page.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {page.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => showNotificationFunc(`📊 Rapport détaillé pour ${page.name} généré`)}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-all"
                            >
                              Rapport détaillé
                            </button>
                            <button 
                              onClick={() => showNotificationFunc(`⚙️ Paramètres de ${page.name} ouverts`)}
                              className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-all"
                            >
                              Gérer
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Followers</p>
                            <p className="text-lg font-bold text-white">{page.followers.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Engagement</p>
                            <p className="text-lg font-bold text-blue-400">{page.engagement}%</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Reach</p>
                            <p className="text-lg font-bold text-green-400">{(page.reach/1000).toFixed(0)}k</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Ad Spend</p>
                            <p className="text-lg font-bold text-purple-400">€{page.adSpend.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Conversions</p>
                            <p className="text-lg font-bold text-pink-400">{page.conversions}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Page Views</p>
                            <p className="text-lg font-bold text-orange-400">{(page.pageViews/1000).toFixed(1)}k</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">CTR</p>
                            <p className="text-lg font-bold text-cyan-400">{page.ctr}%</p>
                          </div>
                        </div>
                        
                        {/* Page Engagement Metrics tied to Ads */}
                        <div className="bg-gradient-to-r from-indigo-600/10 to-blue-600/10 rounded-lg p-4">
                          <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <span>📈</span>
                            Métriques d'engagement liées aux publicités
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Likes depuis ads:</span>
                              <span className="text-green-400 font-medium">+{Math.floor(page.conversions * 2.3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Partages depuis ads:</span>
                              <span className="text-blue-400 font-medium">+{Math.floor(page.conversions * 0.8)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Commentaires ads:</span>
                              <span className="text-purple-400 font-medium">+{Math.floor(page.conversions * 0.4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Messages depuis ads:</span>
                              <span className="text-pink-400 font-medium">+{Math.floor(page.conversions * 0.15)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Section - Octavia */}
        {activeSection === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                Octavia AI Analytics
              </h2>
              <p className="text-gray-400">
                Powered by Claude 3.5 Sonnet (Oct 2024) • Dernière génération d'IA
              </p>
            </div>

            {/* Recommandations interactives */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6">
                Recommandations Prioritaires
              </h3>
              
              <div className="space-y-4">
                {demoData.aiRecommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    whileHover={{ x: 10 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-bold
                            ${rec.priority === 'high' 
                              ? 'bg-red-500/20 text-red-400' 
                              : rec.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                            }
                          `}>
                            {rec.priority === 'high' ? 'URGENT' : rec.priority === 'medium' ? 'IMPORTANT' : 'INFO'}
                          </span>
                          <h4 className="text-lg font-bold text-white">{rec.title}</h4>
                        </div>
                        <p className="text-gray-300 mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => applyRecommendation(rec)}
                            disabled={applyingRecommendation === rec}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {applyingRecommendation === rec ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Application...
                              </>
                            ) : (
                              'Appliquer maintenant'
                            )}
                          </button>
                          <span className="text-green-400 text-sm font-medium">
                            Impact: {rec.estimatedImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat avec Octavia */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Chat avec Octavia</h3>
                <button
                  onClick={() => setShowOctaviaChat(!showOctaviaChat)}
                  className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700"
                >
                  {showOctaviaChat ? 'Réduire' : 'Ouvrir le chat'}
                </button>
              </div>
              
              {showOctaviaChat && (
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 bg-gray-900/50 rounded-xl p-4">
                    {chatMessages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.type === 'bot' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-blue-600'
                        }`}>
                          {msg.type === 'bot' ? '🤖' : '👤'}
                        </div>
                        <div className={`flex-1 rounded-lg p-3 ${
                          msg.type === 'bot' ? 'bg-gray-800' : 'bg-blue-900/50'
                        }`}>
                          <p className="text-white">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Posez votre question à Octavia..."
                      className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCreateCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">🚀 Créer une nouvelle campagne publicitaire</h3>
              
              <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                {/* Étape 1: Informations de base */}
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">📝 Informations de base</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom de la campagne *</label>
                      <input
                        type="text"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 transition-colors"
                        placeholder="Ex: Black Friday 2024 - Sneakers"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description du produit/service *</label>
                      <textarea
                        value={newCampaign.productDescription}
                        onChange={(e) => setNewCampaign({...newCampaign, productDescription: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 transition-colors h-20 resize-none"
                        placeholder="Ex: Sneakers de running haute performance avec technologie d'amorti avancée. Prix spécial Black Friday -40%"
                      />
                    </div>
                  </div>
                </div>

                {/* Étape 2: Objectif */}
                <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">🎯 Objectif de campagne</h4>
                  
                  <div className="space-y-3">
                    <select 
                      value={newCampaign.objective}
                      onChange={(e) => setNewCampaign({...newCampaign, objective: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-blue-500 transition-colors"
                    >
                      <option value="CONVERSIONS">💰 Conversions - Ventes directes</option>
                      <option value="LEAD_GENERATION">📧 Génération de leads - Formulaires</option>
                      <option value="TRAFFIC">🚗 Trafic - Visites sur site</option>
                      <option value="BRAND_AWARENESS">👁️ Notoriété - Faire connaître</option>
                      <option value="REACH">📣 Portée - Toucher un maximum</option>
                      <option value="APP_INSTALLS">📱 Installations d'app</option>
                      <option value="VIDEO_VIEWS">🎬 Vues vidéo</option>
                      <option value="ENGAGEMENT">💬 Engagement - Likes & partages</option>
                      <option value="CATALOG_SALES">🛍️ Ventes catalogue</option>
                      <option value="STORE_TRAFFIC">🏪 Visites en magasin</option>
                    </select>
                    
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">
                        {newCampaign.objective === 'CONVERSIONS' && '💡 Optimisé pour générer des achats sur votre site'}
                        {newCampaign.objective === 'LEAD_GENERATION' && '💡 Collectez des contacts qualifiés via formulaires'}
                        {newCampaign.objective === 'TRAFFIC' && '💡 Maximisez les visites sur votre site web'}
                        {newCampaign.objective === 'BRAND_AWARENESS' && '💡 Faites connaître votre marque au plus grand nombre'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Étape 3: Budget */}
                <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">💶 Budget et planning</h4>
                  
                  <div className="space-y-3">
                    {/* Type de budget */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewCampaign({...newCampaign, budgetType: 'daily'})}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          newCampaign.budgetType === 'daily' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        Budget quotidien
                      </button>
                      <button
                        onClick={() => setNewCampaign({...newCampaign, budgetType: 'weekly'})}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          newCampaign.budgetType === 'weekly' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        Budget hebdomadaire
                      </button>
                    </div>
                    
                    {/* Montant du budget */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        {newCampaign.budgetType === 'daily' ? 'Budget quotidien (€)' : 'Budget hebdomadaire (€)'}
                      </label>
                      <input
                        type="number"
                        value={newCampaign.budgetType === 'daily' ? newCampaign.dailyBudget : newCampaign.weeklyBudget}
                        onChange={(e) => setNewCampaign({...newCampaign, 
                          [newCampaign.budgetType === 'daily' ? 'dailyBudget' : 'weeklyBudget']: parseInt(e.target.value)
                        })}
                        className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-green-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Estimation: {newCampaign.budgetType === 'daily' 
                          ? `€${(newCampaign.dailyBudget * 30).toLocaleString()} par mois`
                          : `€${((newCampaign.weeklyBudget * 52) / 12).toFixed(0)} par mois`
                        }
                      </p>
                    </div>
                    
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Date de début</label>
                        <input
                          type="date"
                          value={newCampaign.startDate}
                          onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Date de fin (optionnel)</label>
                        <input
                          type="date"
                          value={newCampaign.endDate}
                          onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 4: Audience */}
                <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-lg p-4 border border-orange-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">👥 Configuration de l'audience</h4>
                  
                  <div className="space-y-3">
                    {/* Type d'audience */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewCampaign({...newCampaign, audienceType: 'ai'})}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          newCampaign.audienceType === 'ai' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <span>🤖</span>
                        <span>IA Octavia (Recommandé)</span>
                      </button>
                      <button
                        onClick={() => setNewCampaign({...newCampaign, audienceType: 'manual'})}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          newCampaign.audienceType === 'manual' 
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <span>⚙️</span>
                        <span>Configuration manuelle</span>
                      </button>
                    </div>
                    
                    {newCampaign.audienceType === 'ai' ? (
                      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">🤖</span>
                          </div>
                          <div>
                            <h5 className="text-white font-medium mb-1">Octavia optimisera votre audience</h5>
                            <p className="text-sm text-gray-400 mb-3">
                              L'IA analysera vos performances et ajustera automatiquement le ciblage pour maximiser vos résultats.
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <span>✓</span>
                                <span>Analyse comportementale en temps réel</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <span>✓</span>
                                <span>Optimisation automatique du ciblage</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <span>✓</span>
                                <span>Audiences lookalike intelligentes</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <span>✓</span>
                                <span>A/B testing automatisé</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Âge et genre */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Tranche d'âge</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={newCampaign.audience.ageMin}
                                onChange={(e) => setNewCampaign({...newCampaign, audience: {...newCampaign.audience, ageMin: parseInt(e.target.value)}})}
                                className="w-20 px-2 py-1 bg-gray-800 rounded text-white text-sm"
                                min="13"
                                max="65"
                              />
                              <span className="text-gray-400">à</span>
                              <input
                                type="number"
                                value={newCampaign.audience.ageMax}
                                onChange={(e) => setNewCampaign({...newCampaign, audience: {...newCampaign.audience, ageMax: parseInt(e.target.value)}})}
                                className="w-20 px-2 py-1 bg-gray-800 rounded text-white text-sm"
                                min="13"
                                max="65"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Genre</label>
                            <select
                              value={newCampaign.audience.gender}
                              onChange={(e) => setNewCampaign({...newCampaign, audience: {...newCampaign.audience, gender: e.target.value}})}
                              className="w-full px-3 py-1.5 bg-gray-800 rounded text-white text-sm"
                            >
                              <option value="all">Tous</option>
                              <option value="male">Hommes</option>
                              <option value="female">Femmes</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Centres d'intérêt */}
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Centres d'intérêt</label>
                          <div className="flex flex-wrap gap-2">
                            {['Sport', 'Mode', 'Tech', 'Voyage', 'Food', 'Gaming', 'Musique', 'Cinéma'].map((interest) => (
                              <button
                                key={interest}
                                onClick={() => {
                                  const interests = selectedInterests.includes(interest)
                                    ? selectedInterests.filter(i => i !== interest)
                                    : [...selectedInterests, interest];
                                  setSelectedInterests(interests);
                                  setNewCampaign({...newCampaign, audience: {...newCampaign.audience, interests}});
                                }}
                                className={`px-3 py-1 rounded-full text-xs transition-all ${
                                  selectedInterests.includes(interest)
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Estimation de l'audience */}
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Taille estimée de l'audience</span>
                            <span className="text-sm font-medium text-white">
                              {audienceSize.min.toLocaleString()} - {audienceSize.max.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Audience optimale pour votre budget</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stratégie d'enchères */}
                <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-lg p-4 border border-violet-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">⚡ Stratégie d'enchères</h4>
                  
                  <select
                    value={newCampaign.bidStrategy}
                    onChange={(e) => setNewCampaign({...newCampaign, bidStrategy: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700"
                  >
                    <option value="lowest_cost">Coût le plus bas (Recommandé)</option>
                    <option value="cost_cap">Plafond de coût</option>
                    <option value="bid_cap">Plafond d'enchère</option>
                    <option value="target_cost">Coût cible</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-800">
                <button
                  onClick={() => {
                    if (!newCampaign.name || !newCampaign.productDescription) {
                      showNotificationFunc('⚠️ Veuillez remplir tous les champs obligatoires');
                      return;
                    }
                    createCampaign();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>Créer la campagne</span>
                </button>
                <button
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all font-medium"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {showEditBudgetModal && editingCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowEditBudgetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Modifier le budget</h3>
              <p className="text-gray-400 mb-4">Campagne: {editingCampaign.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Budget actuel: {editingCampaign.budget}€</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white text-lg"
                  />
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400">Impact estimé:</p>
                  <p className="text-green-400">
                    +{Math.round((newBudget - editingCampaign.budget) * 0.08)} conversions supplémentaires
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={updateBudget}
                    className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowEditBudgetModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Details Modal */}
      <AnimatePresence>
        {showLeadDetailsModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLeadDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Détails du prospect</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nom</p>
                    <p className="font-bold text-white">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-bold text-white">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Téléphone</p>
                    <p className="font-bold text-white">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Entreprise</p>
                    <p className="font-bold text-white">{selectedLead.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Score</p>
                    <p className="font-bold text-green-400">{selectedLead.score}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Valeur estimée</p>
                    <p className="font-bold text-yellow-400">{selectedLead.estimatedValue}€</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      showNotificationFunc('📧 Email envoyé à ' + selectedLead.name);
                      setShowLeadDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Envoyer un email
                  </button>
                  <button 
                    onClick={() => {
                      showNotificationFunc('📞 Appel programmé avec ' + selectedLead.name);
                      setShowLeadDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Appeler
                  </button>
                  <button
                    onClick={() => setShowLeadDetailsModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Exporter les prospects</h3>
              <p className="text-gray-400 mb-4">
                {leads.length} prospects seront exportés
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => exportLeads('csv')}
                  className="w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  📄 Export CSV (Téléchargement réel)
                </button>
                <button
                  onClick={() => exportLeads('pdf')}
                  className="w-full px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  📑 Export PDF
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}