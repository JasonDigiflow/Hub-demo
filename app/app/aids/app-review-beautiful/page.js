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

export default function AppReviewBeautiful() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [campaigns, setCampaigns] = useState(demoData.campaigns);
  const [leads, setLeads] = useState(demoData.leads);
  const [metrics, setMetrics] = useState(getRealtimeMetrics());
  const [octaviaAnalysis, setOctaviaAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // États pour les modals et interactions
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [hoveredMetric, setHoveredMetric] = useState(null);
  
  // Nouveaux états pour les métriques avancées
  const [roas, setRoas] = useState(3.2);
  const [cpm, setCpm] = useState(12.45);
  const [qualityScore, setQualityScore] = useState(8.7);
  const [adSpend, setAdSpend] = useState(12456.78);
  
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
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Analyse Octavia au chargement
  useEffect(() => {
    performOctaviaAnalysis();
  }, []);

  const performOctaviaAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simuler l'analyse
    setTimeout(() => {
      const analyses = [
        {
          insight: "📈 Performance exceptionnelle détectée",
          detail: "Votre CTR de 3.6% dépasse la moyenne du secteur de 45%. Les campagnes de conversion performent particulièrement bien.",
          action: "Augmentez le budget de 30% pour capitaliser sur cette performance",
          impact: "+42 conversions estimées"
        },
        {
          insight: "🎯 Opportunité d'audience identifiée",
          detail: "Les femmes 25-34 ans convertissent 2.3x mieux que votre moyenne. Cette segment représente 35% de votre audience mais 58% de vos ventes.",
          action: "Créez une campagne dédiée avec des créatives adaptées",
          impact: "ROI potentiel: 4.2x"
        },
        {
          insight: "⚡ Optimisation horaire recommandée",
          detail: "80% de vos conversions arrivent entre 19h et 23h, mais seulement 40% de votre budget y est alloué.",
          action: "Activez le dayparting pour concentrer les enchères le soir",
          impact: "-25% de CPA estimé"
        }
      ];
      
      setOctaviaAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Calculer les métriques dérivées
  const conversionRate = ((metrics.conversions / metrics.clicks) * 100).toFixed(2);
  const avgOrderValue = (metrics.conversions * 125).toFixed(0);
  const revenue = (metrics.conversions * 125).toFixed(0);
  const profit = (revenue - metrics.spent).toFixed(0);
  const profitMargin = ((profit / revenue) * 100).toFixed(1);

  const sections = [
    { id: 'dashboard', name: 'Vue d\'ensemble', icon: '🎯', color: 'from-purple-600 to-pink-600' },
    { id: 'campaigns', name: 'Campagnes', icon: '📊', color: 'from-blue-600 to-cyan-600' },
    { id: 'leads', name: 'Prospects', icon: '👥', color: 'from-green-600 to-emerald-600' },
    { id: 'insights', name: 'Insights', icon: '📈', color: 'from-orange-600 to-red-600' },
    { id: 'ai', name: 'IA Octavia', icon: '🤖', color: 'from-violet-600 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
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
                <p className="text-sm text-gray-400">Powered by Octavia AI • Claude 3.5 Sonnet</p>
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
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  relative px-6 py-3 rounded-lg font-medium transition-all
                  ${activeSection === section.id 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                  }
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
                          <button className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-all">
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

            {/* Métriques principales avec design premium */}
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
                  title: 'Dépenses Pub', 
                  value: `€${metrics.spent.toFixed(0)}`, 
                  change: '+12%', 
                  trend: 'up',
                  color: 'from-blue-600 to-cyan-600',
                  detail: `€${cpm.toFixed(2)} CPM`
                },
                { 
                  title: 'Conversions', 
                  value: metrics.conversions, 
                  change: '+18%', 
                  trend: 'up',
                  color: 'from-purple-600 to-pink-600',
                  detail: `${conversionRate}% CVR`
                },
                { 
                  title: 'Profit', 
                  value: `€${profit}`, 
                  change: `${profitMargin}%`, 
                  trend: 'up',
                  color: 'from-orange-600 to-red-600',
                  detail: `${profitMargin}% marge`
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
                  className="relative overflow-hidden"
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
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Graphiques avancés */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance temporelle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Performance Temporelle</h3>
                  <div className="flex gap-2">
                    {['1d', '7d', '30d', '90d'].map(range => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`
                          px-3 py-1 rounded-lg text-sm font-medium transition-all
                          ${selectedTimeRange === range
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }
                        `}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Graphique interactif */}
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-end gap-2">
                    {demoData.insights.performance.daily.map((day, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 flex flex-col items-center group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          className="relative w-full"
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.clicks / 700) * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Tooltip au hover */}
                          <div className="hidden group-hover:block absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                            <p className="text-white font-bold">{day.clicks} clics</p>
                            <p className="text-gray-400">€{day.cost}</p>
                            <p className="text-green-400">{day.conversions} conv.</p>
                          </div>
                        </motion.div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('fr', { day: 'numeric', month: 'short' })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Lignes de grille */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map(percentage => (
                      <div key={percentage} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-8">{percentage}%</span>
                        <div className="flex-1 border-t border-gray-800/50" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Légende */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full" />
                    <span className="text-xs text-gray-400">Clics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-600 rounded-full" />
                    <span className="text-xs text-gray-400">Conversions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <span className="text-xs text-gray-400">Revenue</span>
                  </div>
                </div>
              </motion.div>

              {/* Répartition du budget */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-6">Répartition du Budget</h3>
                
                {/* Donut chart simulé */}
                <div className="relative h-64 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Cercle principal */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="24"
                        fill="none"
                        className="text-gray-800"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="72"
                        stroke="url(#gradient1)"
                        strokeWidth="24"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 72}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 72 * 0.3 }}
                        transition={{ duration: 1 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Texte au centre */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-white">€{metrics.spent.toFixed(0)}</p>
                      <p className="text-sm text-gray-400">Total dépensé</p>
                    </div>
                  </div>
                </div>
                
                {/* Légende détaillée */}
                <div className="space-y-3 mt-6">
                  {campaigns.map((campaign, i) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          i === 0 ? 'from-purple-600 to-pink-600' :
                          i === 1 ? 'from-blue-600 to-cyan-600' :
                          'from-green-600 to-emerald-600'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-white">{campaign.name}</p>
                          <p className="text-xs text-gray-500">{campaign.objective}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">€{campaign.spent.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">
                          {((campaign.spent / metrics.spent) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Métriques détaillées */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Métriques Avancées</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: 'CTR', value: `${metrics.ctr}%`, color: 'text-blue-400' },
                  { label: 'CPC', value: `€${metrics.cpc}`, color: 'text-green-400' },
                  { label: 'CPM', value: `€${cpm.toFixed(2)}`, color: 'text-purple-400' },
                  { label: 'Frequency', value: metrics.frequency.toFixed(2), color: 'text-orange-400' },
                  { label: 'Reach', value: `${(metrics.reach / 1000).toFixed(1)}k`, color: 'text-pink-400' },
                  { label: 'Impressions', value: `${(metrics.impressions / 1000).toFixed(0)}k`, color: 'text-cyan-400' }
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Section IA Octavia améliorée */}
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
                Powered by Claude 3.5 Sonnet • Analyse prédictive avancée
              </p>
            </div>

            {/* Score de santé des campagnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Santé Globale', 
                  score: 87, 
                  color: 'from-green-600 to-emerald-600',
                  details: 'Performances excellentes, ROI optimal'
                },
                { 
                  title: 'Potentiel d\'Optimisation', 
                  score: 65, 
                  color: 'from-orange-600 to-yellow-600',
                  details: '3 opportunités identifiées'
                },
                { 
                  title: 'Prédiction 30J', 
                  score: 92, 
                  color: 'from-purple-600 to-pink-600',
                  details: '+28% de croissance estimée'
                }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  
                  {/* Circular progress */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-800"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={`url(#gradient-${i})`}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - item.score / 100) }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id={`gradient-${i}`}>
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{item.score}%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 text-center">{item.details}</p>
                </motion.div>
              ))}
            </div>

            {/* Recommandations intelligentes */}
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
                          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                            Appliquer maintenant
                          </button>
                          <span className="text-green-400 text-sm font-medium">
                            Impact: {rec.estimatedImpact}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-4xl opacity-20">
                        {rec.type === 'budget' ? '💰' : 
                         rec.type === 'audience' ? '🎯' :
                         rec.type === 'creative' ? '🎨' : '⏰'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}