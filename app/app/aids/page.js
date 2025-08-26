'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Line, Bar } from 'react-chartjs-2';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AIDsDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');
  const [metaConnected, setMetaConnected] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [showAutopilotModal, setShowAutopilotModal] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Nouvelles métriques avancées
  const [performanceScore, setPerformanceScore] = useState(87);
  const [adSpendToday, setAdSpendToday] = useState(1234.56);
  const [activeCampaigns, setActiveCampaigns] = useState(12);
  const [totalLeads, setTotalLeads] = useState(892);
  const [conversionRate, setConversionRate] = useState(3.45);
  const [avgCostPerLead, setAvgCostPerLead] = useState(18.50);
  const [bestPerformingAd, setBestPerformingAd] = useState('Black Friday Special');
  const [worstPerformingAd, setWorstPerformingAd] = useState('Generic Sale');
  
  // Métriques ROI
  const [totalRevenue, setTotalRevenue] = useState(48567.89);
  const [totalSpend, setTotalSpend] = useState(12456.78);
  const [roi, setRoi] = useState(0);
  const [roiTrend, setRoiTrend] = useState([]);

  useEffect(() => {
    checkMetaConnection();
    aidsLogger.info(LogCategories.UI, 'Dashboard AIDs initialisé');
  }, []);
  
  useEffect(() => {
    if (selectedAccount || !metaConnected) {
      if (timeRange !== 'custom') {
        loadDashboardData();
      }
    }
  }, [timeRange, selectedAccount, metaConnected]);
  
  // Calcul du ROI
  useEffect(() => {
    if (totalRevenue && totalSpend) {
      const calculatedRoi = ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(2);
      setRoi(calculatedRoi);
      aidsLogger.info(LogCategories.ANALYTICS, 'ROI calculé', { 
        revenue: totalRevenue, 
        spend: totalSpend, 
        roi: calculatedRoi 
      });
    }
  }, [totalRevenue, totalSpend]);

  const checkMetaConnection = async () => {
    try {
      aidsLogger.info(LogCategories.META_API, 'Vérification connexion Meta');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      setMetaConnected(data.connected);
      setUserInfo(data.user);
      setAccounts(data.accounts || []);
      setSelectedAccount(data.selectedAccount);
      aidsLogger.success(LogCategories.META_API, 'Connexion Meta vérifiée', { 
        connected: data.connected, 
        accountsCount: data.accounts?.length 
      });
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur vérification connexion Meta', {}, error);
      console.error('Error checking Meta connection:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    aidsLogger.info(LogCategories.UI, 'Chargement des données du dashboard', { timeRange, selectedAccount });
    try {
      // Load real data from Firebase first
      try {
        const statsResponse = await fetch(`/api/aids/dashboard-stats?range=${timeRange}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success && statsData.stats) {
          // Use real data from Firebase
          const stats = statsData.stats;
          
          const realMetrics = {
            overview: {
              totalSpend: stats.totalRevenue * 0.25, // Estimate spend as 25% of revenue
              totalRevenue: stats.totalRevenue,
              totalLeads: stats.totalProspects,
              conversions: stats.convertedProspects,
              ctr: stats.conversionRate.toFixed(2),
              cpc: stats.totalProspects > 0 ? (stats.totalRevenue * 0.25 / stats.totalProspects).toFixed(2) : 0,
              roas: stats.totalRevenue > 0 ? (stats.totalRevenue / (stats.totalRevenue * 0.25)).toFixed(2) : 4,
              activeAds: 0
            },
            trend: {
              chartData: {
                labels: stats.prospectsPerDay.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
                datasets: [{
                  label: 'Prospects',
                  data: stats.prospectsPerDay.map(d => d.count),
                  borderColor: '#9333ea',
                  backgroundColor: 'rgba(147, 51, 234, 0.2)',
                  tension: 0.4
                }]
              },
              revenueData: {
                labels: stats.revenuePerDay.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
                datasets: [{
                  label: 'Revenus',
                  data: stats.revenuePerDay.map(d => d.amount),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  tension: 0.4
                }]
              }
            }
          };
          
          setMetrics(realMetrics);
          setTotalRevenue(stats.totalRevenue);
          setTotalSpend(stats.totalRevenue * 0.25);
          setRecentActions(generateRecentActions(realMetrics));
          analyzeWithAI(realMetrics);
          setLoading(false);
          
          aidsLogger.success(LogCategories.META_API, 'Données réelles chargées depuis Firebase', { 
            totalProspects: stats.totalProspects,
            totalRevenue: stats.totalRevenue
          });
          return;
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
      
      // Try to load real Meta Ads data if connected
      if (metaConnected && selectedAccount) {
        try {
          let url = `/api/aids/meta/insights?range=${timeRange}`;
          if (timeRange === 'custom') {
            url += `&start_date=${customDateRange.start}&end_date=${customDateRange.end}`;
          }
          const insightsResponse = await fetch(url);
          const insightsData = await insightsResponse.json();
          
          console.log('Insights response for', timeRange, ':', insightsData);
          
          if (insightsData.success && insightsData.metrics) {
            // Use real Meta Ads data with fallback trend if missing
            const metricsWithTrend = {
              ...insightsData.metrics,
              trend: insightsData.metrics.trend || getDefaultTrend()
            };
            setMetrics(metricsWithTrend);
            setRecentActions(generateRecentActions(metricsWithTrend));
            analyzeWithAI(metricsWithTrend);
            
            // Update revenue and spend for ROI calculation
            if (insightsData.metrics.overview) {
              setTotalRevenue(insightsData.metrics.overview.totalRevenue || 48567.89);
              setTotalSpend(insightsData.metrics.overview.totalSpend || 12456.78);
            }
            
            aidsLogger.success(LogCategories.META_API, 'Données Meta chargées avec succès', { 
              hasData: true,
              metricsCount: Object.keys(insightsData.metrics).length 
            });
            setLoading(false);
            return;
          } else {
            aidsLogger.warning(LogCategories.META_API, 'Échec chargement données Meta', { 
              error: insightsData.error || 'Unknown error' 
            });
            console.error('Failed to get real data:', insightsData.error || 'Unknown error');
          }
        } catch (metaError) {
          aidsLogger.error(LogCategories.META_API, 'Erreur lors de la récupération des insights Meta', {}, metaError);
          console.error('Could not fetch Meta insights, falling back to demo:', metaError);
        }
      }
      
      // Fallback to demo metrics
      const metricsResponse = await fetch(`/api/aids/metrics?range=${timeRange}`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics || getDemoMetrics());
      setRecentActions(metricsData.recentActions || getDemoActions());

      // Analyze with AI
      analyzeWithAI(metricsData.metrics || getDemoMetrics());
    } catch (error) {
      aidsLogger.error(LogCategories.UI, 'Erreur chargement dashboard', {}, error);
      console.error('Error loading dashboard:', error);
      // Load demo data as fallback
      const demoMetrics = getDemoMetrics();
      setMetrics(demoMetrics);
      setRecentActions(getDemoActions());
      analyzeWithAI(demoMetrics);
    }
    setLoading(false);
  };

  const analyzeWithAI = async (metricsData) => {
    setAnalyzingAI(true);
    aidsLogger.info(LogCategories.OCTAVIA_AI, 'Analyse IA des métriques en cours');
    try {
      const response = await fetch('/api/aids/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsData })
      });
      const analysis = await response.json();
      
      setInsights(analysis.insights || []);
      setRecommendations(analysis.recommendations || []);
      aidsLogger.success(LogCategories.OCTAVIA_AI, 'Analyse IA terminée', {
        insightsCount: analysis.insights?.length || 0,
        recommendationsCount: analysis.recommendations?.length || 0
      });
    } catch (error) {
      aidsLogger.error(LogCategories.OCTAVIA_AI, 'Erreur analyse IA', {}, error);
      console.error('Error analyzing with AI:', error);
      // Fallback to demo insights
      setInsights(getDemoInsights());
      setRecommendations(getDemoRecommendations());
    }
    setAnalyzingAI(false);
  };

  const getDefaultTrend = () => ({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    spend: [650, 720, 680, 590, 710, 670, 600],
    revenue: [2600, 2880, 2720, 2360, 2840, 2680, 2400],
    ctr: [2.5, 2.6, 2.8, 2.4, 2.9, 2.7, 2.6]
  });

  const getDemoMetrics = () => ({
    overview: {
      totalSpend: 4567.89,
      totalRevenue: 18271.56,
      roas: 4.0,
      campaigns: 8,
      activeAds: 24,
      impressions: 456789,
      clicks: 12345,
      ctr: 2.7,
      cpc: 0.37,
      conversions: 234,
      conversionRate: 1.9
    },
    trend: getDefaultTrend()
  });

  const generateRecentActions = (metrics) => {
    const actions = [];
    
    if (metrics.hasRealData) {
      // Generate actions based on real data
      if (metrics.overview.ctr < 1) {
        actions.push({
          id: Date.now(),
          type: 'ALERTE_CTR_BAS',
          status: 'warning',
          message: `CTR faible détecté (${metrics.overview.ctr}%), optimisation recommandée`,
          time: 'à l\'instant'
        });
      }
      
      if (metrics.overview.roas > 3) {
        actions.push({
          id: Date.now() + 1,
          type: 'PERFORMANCE_EXCELLENTE',
          status: 'success',
          message: `ROAS exceptionnel: ${metrics.overview.roas.toFixed(1)}x`,
          time: '5 min'
        });
      }
      
      if (metrics.overview.activeAds > 0) {
        actions.push({
          id: Date.now() + 2,
          type: 'ANALYSE_TERMINÉE',
          status: 'info',
          message: `${metrics.overview.activeAds} publicités actives analysées`,
          time: '10 min'
        });
      }
    }
    
    // Add some default actions
    actions.push({
      id: Date.now() + 3,
      type: 'SYNC_META',
      status: 'success',
      message: 'Synchronisation avec Meta Ads réussie',
      time: '15 min'
    });
    
    return actions.length > 0 ? actions : getDemoActions();
  };

  const getDemoActions = () => [
    { id: 1, type: 'ANALYSE_PERFORMANCE', status: 'success', message: 'Analyse IA des performances terminée', time: 'à l\'instant' },
    { id: 2, type: 'BUDGET_OPTIMISÉ', status: 'success', message: 'Budget réalloué vers les top performers', time: '15 min' },
    { id: 3, type: 'AUDIENCE_AFFINÉE', status: 'info', message: 'Nouvelle audience lookalike créée', time: '1h' },
    { id: 4, type: 'CREATIVE_TESTÉE', status: 'success', message: 'Test A/B lancé sur 3 nouvelles créatives', time: '3h' },
    { id: 5, type: 'ALERTE_FATIGUE', status: 'warning', message: 'Baisse de CTR détectée sur 2 ads', time: '5h' }
  ];

  const getDemoInsights = () => [
    {
      title: "ROAS exceptionnel ce mois",
      description: "Vos campagnes génèrent 4€ pour chaque euro dépensé, 25% au-dessus de la moyenne",
      priority: "high",
      metric: "ROAS",
      impact: "+25%"
    },
    {
      title: "Performance mobile dominante",
      description: "72% de vos conversions viennent du mobile avec un CPA 30% inférieur",
      priority: "medium",
      metric: "Mobile",
      impact: "+72%"
    },
    {
      title: "Fatigue créative détectée",
      description: "3 de vos créatives montrent une baisse de CTR de 15% après 2 semaines",
      priority: "high",
      metric: "Creative",
      impact: "-15%"
    }
  ];

  const getDemoRecommendations = () => [
    {
      title: "Augmenter budget weekend",
      description: "Vos conversions sont 40% plus élevées le weekend. Augmentez les enchères de 25% du vendredi au dimanche",
      priority: "high",
      metric: "Budget",
      impact: "+40%"
    },
    {
      title: "Rafraîchir les créatives",
      description: "Remplacez vos 3 créatives fatiguées par de nouvelles variantes pour regagner 0.5% de CTR",
      priority: "medium",
      metric: "Creative",
      impact: "+0.5% CTR"
    },
    {
      title: "Cibler les lookalike 1%",
      description: "Créez une audience lookalike 1% de vos meilleurs clients pour réduire le CPA de 20%",
      priority: "high",
      metric: "Audience",
      impact: "-20% CPA"
    }
  ];

  const handleAutopilotToggle = () => {
    if (!autopilotEnabled) {
      aidsLogger.info(LogCategories.UI, 'Ouverture modal Autopilot');
      setShowAutopilotModal(true);
    } else {
      aidsLogger.info(LogCategories.UI, 'Désactivation Autopilot');
      setAutopilotEnabled(false);
    }
  };

  const confirmAutopilot = () => {
    aidsLogger.success(LogCategories.OCTAVIA_AI, 'Autopilot activé avec succès');
    setAutopilotEnabled(true);
    setShowAutopilotModal(false);
  };

  const handleAccountChange = async (accountId) => {
    try {
      const response = await fetch('/api/aids/meta/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedAccount(accountId);
        setShowAccountSelector(false);
        aidsLogger.success(LogCategories.META_API, 'Compte publicitaire changé', { accountId });
        // Reload dashboard data with new account
        loadDashboardData();
      }
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur changement de compte', { accountId }, error);
      console.error('Error switching account:', error);
    }
  };

  const getCurrentAccountName = () => {
    const account = accounts.find(acc => acc.id === selectedAccount);
    return account ? account.name : 'Sélectionner un compte';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Chargement du dashboard...</div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#888' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888' } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Autopilot */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AIDs</span> Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Octavia analyse et optimise vos campagnes Meta en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Logs Button */}
          <button
            onClick={() => router.push('/app/aids/logs')}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 flex items-center gap-2 shadow-lg shadow-orange-600/20"
            title="Consulter les logs et diagnostics"
          >
            <span>🔍</span>
            <span>Logs & Diagnostics</span>
          </button>

          {/* Autopilot Toggle */}
          <button
            onClick={handleAutopilotToggle}
            className={`
              relative px-6 py-3 rounded-xl font-medium transition-all duration-300
              flex items-center gap-3 shadow-lg
              ${autopilotEnabled 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/20' 
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/20 hover:from-red-700 hover:to-red-800'
              }
            `}
          >
            <div className={`w-2 h-2 rounded-full ${autopilotEnabled ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            <span>AIDs Autopilot</span>
            <span className={`font-bold ${autopilotEnabled ? 'text-white' : 'text-white'}`}>
              {autopilotEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setShowDatePicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range === 'daily' ? 'Jour' : range === 'weekly' ? 'Semaine' : 'Mois'}
                </button>
              ))}
              <button
                onClick={() => {
                  setTimeRange('custom');
                  setShowDatePicker(true);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === 'custom'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Personnalisé
              </button>
            </div>
            
            {/* Custom Date Range Picker */}
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-white/5 rounded-lg p-2"
              >
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-white/10 text-white rounded px-2 py-1 text-sm"
                  max={customDateRange.end}
                />
                <span className="text-gray-400 text-sm">à</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-white/10 text-white rounded px-2 py-1 text-sm"
                  min={customDateRange.start}
                  max={new Date().toISOString().split('T')[0]}
                />
                <button
                  onClick={() => {
                    loadDashboardData();
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Appliquer
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Autopilot Modal */}
      <AnimatePresence>
        {showAutopilotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAutopilotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Activation de l'Autopilot
                </h2>
                <p className="text-gray-300">
                  Vous vous apprêtez à passer dans une nouvelle dimension !
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">
                  L'autopilotage avec Octavia inclut :
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Optimisation automatique des enchères 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Réallocation intelligente des budgets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Création et test de nouvelles audiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Génération automatique de créatives IA</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAutopilotModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Pas maintenant
                </button>
                <button
                  onClick={confirmAutopilot}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
                >
                  C'est parti ! 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Selector for connected users */}
      {metaConnected && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Compte publicitaire actif</p>
                <p className="text-lg font-semibold text-white">
                  {getCurrentAccountName()}
                </p>
              </div>
              {selectedAccount && (
                <div className="text-xs text-gray-500">
                  ID: {selectedAccount}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAccountSelector(!showAccountSelector)}
                className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center gap-2 border border-purple-600/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                Changer de compte
              </button>
              <a
                href="/app/aids/connect"
                className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-600/30"
              >
                Gérer la connexion
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Selector Dropdown */}
      <AnimatePresence>
        {showAccountSelector && accounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-900 rounded-xl border border-white/10 p-4"
          >
            <h3 className="text-white font-semibold mb-3">Sélectionner un compte publicitaire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountChange(account.id)}
                  className={`
                    p-3 rounded-lg border transition-all text-left
                    ${selectedAccount === account.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{account.name}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {account.id}</p>
                      {account.currency && (
                        <p className="text-xs text-gray-500 mt-1">
                          {account.currency} • {account.timezone_name}
                        </p>
                      )}
                    </div>
                    {selectedAccount === account.id && (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAccountSelector(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta Connection Banner */}
      {!metaConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Connectez votre compte Meta Ads</h3>
              <p className="text-gray-300">
                Liez votre compte Facebook Business pour analyser vos vraies campagnes
              </p>
            </div>
            <a
              href="/app/aids/connect"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              Connecter Meta
            </a>
          </div>
        </motion.div>
      )}

      {/* ROI Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-xl p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Retour sur Investissement (ROI)</h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-400">Revenus</p>
                <p className="text-2xl font-bold text-green-400">
                  €{totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-3xl text-gray-600">-</div>
              <div>
                <p className="text-sm text-gray-400">Dépenses</p>
                <p className="text-2xl font-bold text-red-400">
                  €{totalSpend.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-3xl text-gray-600">=</div>
              <div>
                <p className="text-sm text-gray-400">Profit</p>
                <p className="text-2xl font-bold text-white">
                  €{(totalRevenue - totalSpend).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">ROI</p>
            <p className={`text-4xl font-bold ${
              roi > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {roi}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {roi > 0 ? '↑ Profitable' : '↓ Non profitable'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Real Data Indicator */}
      {metrics?.hasRealData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">
            Données réelles de {metrics?.accountInfo?.name || 'votre compte'}
          </span>
        </motion.div>
      )}

      {/* Performance Score Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-2xl p-6 border border-purple-500/30 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Score de Performance Global</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-800 rounded-full h-4">
                  <motion.div
                    className={`h-4 rounded-full bg-gradient-to-r ${
                      performanceScore >= 80 ? 'from-green-500 to-emerald-500' :
                      performanceScore >= 60 ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-pink-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${performanceScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-3xl font-bold text-white">{performanceScore}%</span>
              </div>
              <div className="text-sm text-gray-400">
                <p>📈 +5% vs hier</p>
                <p>🎯 Objectif: 90%</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Temps réel</p>
            <p className="text-2xl font-bold text-white">€{adSpendToday.toFixed(2)}</p>
            <p className="text-xs text-gray-500">dépensé aujourd'hui</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'Campagnes', value: activeCampaigns, icon: '📊', change: '+2' },
          { label: 'Leads Totaux', value: totalLeads, icon: '👥', change: '+45' },
          { label: 'Conv. Rate', value: `${conversionRate}%`, icon: '📈', change: '+0.3%' },
          { label: 'CPL Moyen', value: `€${avgCostPerLead}`, icon: '💰', change: '-€2.5' },
          { label: 'Impressions', value: '1.2M', icon: '👁️', change: '+15%' },
          { label: 'Clicks', value: '45.6k', icon: '👆', change: '+8%' },
          { label: 'CTR Moyen', value: '3.8%', icon: '🎯', change: '+0.2%' },
          { label: 'CPC Moyen', value: '€0.27', icon: '💵', change: '-€0.03' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Dépenses totales</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.overview.totalSpend?.toLocaleString('fr-FR', { 
              style: 'currency', 
              currency: metrics?.accountInfo?.currency || 'EUR' 
            })}
          </div>
          <div className="text-xs text-green-400 mt-1">↑ 12% vs période précédente</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">ROAS</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.overview.roas?.toFixed(1)}x
          </div>
          <div className="text-xs text-green-400 mt-1">↑ 0.5x amélioration</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-6 border border-purple-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">CTR</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.overview.ctr?.toFixed(2)}%
          </div>
          <div className="text-xs text-green-400 mt-1">↑ 0.3% augmentation</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Conversions</span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.overview.conversions || 0}
          </div>
          <div className="text-xs text-blue-400 mt-1">
            {metrics?.overview.conversionRate?.toFixed(2) || 0}% taux
          </div>
        </motion.div>
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">🧠 Insights IA d'Octavia</h3>
            {analyzingAI && (
              <div className="animate-pulse text-purple-400 text-sm">Analyse en cours...</div>
            )}
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.priority === 'high' 
                      ? 'bg-red-600/20 text-red-400' 
                      : insight.priority === 'medium'
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {insight.priority === 'high' ? 'Urgent' : insight.priority === 'medium' ? 'Important' : 'Info'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{insight.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">{insight.metric}</span>
                  <span className={`font-semibold ${
                    String(insight.impact || '').startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Recommandations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{rec.title}</h4>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 text-xs hover:text-purple-300">
                    Appliquer →
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">{rec.metric}</span>
                  <span className="font-semibold text-green-400">{rec.impact}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend & Revenue Chart */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Dépenses vs Revenus</h3>
          <div className="h-64">
            <Line
              data={{
                labels: metrics?.trend?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [
                  {
                    label: 'Dépenses',
                    data: metrics?.trend?.spend || [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  },
                  {
                    label: 'Revenus',
                    data: metrics?.trend?.revenue || [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* CTR Performance */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Performance CTR</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: metrics?.trend?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [
                  {
                    label: 'CTR %',
                    data: metrics?.trend?.ctr || [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(168, 85, 247, 0.5)',
                    borderColor: '#A855F7',
                    borderWidth: 1
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Top & Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-xl p-6 border border-green-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Top Performers
          </h3>
          <div className="space-y-3">
            {[
              { name: bestPerformingAd, roas: 5.8, spend: 2340, conversions: 156, trend: '+23%' },
              { name: 'Summer Collection', roas: 4.9, spend: 1890, conversions: 98, trend: '+18%' },
              { name: 'Flash Sale 48h', roas: 4.2, spend: 1560, conversions: 76, trend: '+15%' }
            ].map((campaign, i) => (
              <motion.div
                key={campaign.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{campaign.name}</h4>
                  <span className="text-green-400 text-sm font-bold">{campaign.trend}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">ROAS</span>
                    <p className="text-white font-bold">{campaign.roas}x</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Dépensé</span>
                    <p className="text-white font-bold">€{campaign.spend}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Conv.</span>
                    <p className="text-white font-bold">{campaign.conversions}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Worst Performers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-xl p-6 border border-red-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            À Optimiser
          </h3>
          <div className="space-y-3">
            {[
              { name: worstPerformingAd, roas: 0.8, spend: 890, conversions: 12, issue: 'CTR faible' },
              { name: 'Old Product Line', roas: 1.2, spend: 670, conversions: 18, issue: 'CPA élevé' },
              { name: 'Broad Audience Test', roas: 1.5, spend: 450, conversions: 15, issue: 'Audience large' }
            ].map((campaign, i) => (
              <motion.div
                key={campaign.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                whileHover={{ x: -5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{campaign.name}</h4>
                  <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded">{campaign.issue}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">ROAS</span>
                    <p className="text-red-400 font-bold">{campaign.roas}x</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Dépensé</span>
                    <p className="text-white font-bold">€{campaign.spend}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Conv.</span>
                    <p className="text-white font-bold">{campaign.conversions}</p>
                  </div>
                </div>
                <button className="mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  → Optimiser maintenant
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Audience Performance Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10 mt-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Matrice de Performance des Audiences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              segment: 'Femmes 25-34',
              reach: '234k',
              engagement: '8.2%',
              conversions: 456,
              revenue: '€28.9k',
              performance: 95
            },
            { 
              segment: 'Hommes 35-44',
              reach: '189k',
              engagement: '6.5%',
              conversions: 312,
              revenue: '€19.8k',
              performance: 78
            },
            { 
              segment: 'Lookalike 1%',
              reach: '156k',
              engagement: '9.1%',
              conversions: 523,
              revenue: '€35.2k',
              performance: 98
            },
            { 
              segment: 'Interests: Tech',
              reach: '298k',
              engagement: '5.8%',
              conversions: 234,
              revenue: '€15.6k',
              performance: 65
            }
          ].map((audience, i) => (
            <motion.div
              key={audience.segment}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              whileHover={{ y: -5 }}
            >
              <h4 className="font-medium text-white mb-3">{audience.segment}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Reach</span>
                  <span className="text-sm text-white font-medium">{audience.reach}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Engagement</span>
                  <span className="text-sm text-white font-medium">{audience.engagement}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Conversions</span>
                  <span className="text-sm text-white font-medium">{audience.conversions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Revenue</span>
                  <span className="text-sm text-green-400 font-medium">{audience.revenue}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Performance</span>
                    <span className={`text-xs font-bold ${
                      audience.performance >= 80 ? 'text-green-400' :
                      audience.performance >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{audience.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        audience.performance >= 80 ? 'from-green-500 to-emerald-500' :
                        audience.performance >= 60 ? 'from-yellow-500 to-orange-500' :
                        'from-red-500 to-pink-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${audience.performance}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Actions */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Actions récentes</h3>
        <div className="space-y-3">
          {recentActions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  action.status === 'success' ? 'bg-green-400' :
                  action.status === 'warning' ? 'bg-yellow-400' :
                  action.status === 'error' ? 'bg-red-400' :
                  'bg-blue-400'
                }`} />
                <div>
                  <div className="text-sm font-medium text-white">{action.type.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-400">{action.message}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{action.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Autopilot Status Footer */}
      {autopilotEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-600/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">Autopilot actif</span>
              <span className="text-gray-400 text-sm">• Octavia optimise vos campagnes en continu</span>
            </div>
            <button
              onClick={() => setAutopilotEnabled(false)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Désactiver
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}