'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
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

  useEffect(() => {
    checkMetaConnection();
    loadDashboardData();
  }, [timeRange]);

  const checkMetaConnection = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      setMetaConnected(data.connected);
      setUserInfo(data.user);
    } catch (error) {
      console.error('Error checking Meta connection:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load metrics
      const metricsResponse = await fetch(`/api/aids/metrics?range=${timeRange}`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics || getDemoMetrics());
      setRecentActions(metricsData.recentActions || getDemoActions());

      // Analyze with AI
      analyzeWithAI(metricsData.metrics || getDemoMetrics());
    } catch (error) {
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
    try {
      const response = await fetch('/api/aids/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsData })
      });
      const analysis = await response.json();
      
      setInsights(analysis.insights || []);
      setRecommendations(analysis.recommendations || []);
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      // Fallback to demo insights
      setInsights(getDemoInsights());
      setRecommendations(getDemoRecommendations());
    }
    setAnalyzingAI(false);
  };

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
    trend: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      spend: [650, 720, 680, 590, 710, 670, 600],
      revenue: [2600, 2880, 2720, 2360, 2840, 2680, 2400],
      ctr: [2.5, 2.6, 2.8, 2.4, 2.9, 2.7, 2.6]
    }
  });

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
      setShowAutopilotModal(true);
    } else {
      setAutopilotEnabled(false);
    }
  };

  const confirmAutopilot = () => {
    setAutopilotEnabled(true);
    setShowAutopilotModal(false);
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
          {/* Autopilot Toggle */}
          <button
            onClick={handleAutopilotToggle}
            className={`
              relative px-6 py-3 rounded-xl font-medium transition-all duration-300
              flex items-center gap-3
              ${autopilotEnabled 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20' 
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }
            `}
          >
            <div className={`w-2 h-2 rounded-full ${autopilotEnabled ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
            <span>AIDs Autopilot</span>
            <span className={`font-bold ${autopilotEnabled ? 'text-white' : 'text-gray-500'}`}>
              {autopilotEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'daily' ? 'Jour' : range === 'weekly' ? 'Semaine' : 'Mois'}
              </button>
            ))}
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
            {metrics?.overview.totalSpend.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
            {metrics?.overview.roas.toFixed(1)}x
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
            {metrics?.overview.ctr}%
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
            {metrics?.overview.conversions}
          </div>
          <div className="text-xs text-blue-400 mt-1">{metrics?.overview.conversionRate}% taux</div>
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
                labels: metrics?.trend.labels || [],
                datasets: [
                  {
                    label: 'Dépenses',
                    data: metrics?.trend.spend || [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  },
                  {
                    label: 'Revenus',
                    data: metrics?.trend.revenue || [],
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
                labels: metrics?.trend.labels || [],
                datasets: [
                  {
                    label: 'CTR %',
                    data: metrics?.trend.ctr || [],
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