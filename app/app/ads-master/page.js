'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis,
  ComposedChart, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/ui/Sidebar';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function AdsMasterDemo() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('META');
  const [selectedAccount, setSelectedAccount] = useState('act_1234567890');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [selectedAdSet, setSelectedAdSet] = useState(null);
  const [credits, setCredits] = useState(9850);
  const [liveMetrics, setLiveMetrics] = useState({
    impressions: 2456789,
    clicks: 48901,
    conversions: 1234,
    spend: 45678,
    revenue: 189012,
    roas: 4.14,
    ctr: 1.99,
    cpc: 0.93,
    cpm: 18.6,
    cpa: 37.02
  });

  // Live sync simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 2000);
    }, 30000);

    const metricsInterval = setInterval(() => {
      setLiveMetrics(prev => ({
        impressions: prev.impressions + Math.floor(Math.random() * 100),
        clicks: prev.clicks + Math.floor(Math.random() * 5),
        conversions: prev.conversions + (Math.random() > 0.7 ? 1 : 0),
        spend: prev.spend + Math.random() * 10,
        revenue: prev.revenue + Math.random() * 50,
        roas: parseFloat(((prev.revenue / prev.spend) || 4.14).toFixed(2)),
        ctr: parseFloat(((prev.clicks / prev.impressions * 100) || 1.99).toFixed(2)),
        cpc: parseFloat((prev.spend / prev.clicks || 0.93).toFixed(2)),
        cpm: parseFloat((prev.spend / prev.impressions * 1000 || 18.6).toFixed(2)),
        cpa: parseFloat((prev.spend / prev.conversions || 37.02).toFixed(2))
      }));
    }, 3000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  // Enhanced campaign data with drilldown
  const campaigns = [
    { 
      id: 'camp_001', 
      name: 'Black Friday Mega Sale', 
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      learningPhase: false,
      budget: 15000, 
      spent: 12456.78,
      impressions: 1234567, 
      clicks: 24567, 
      ctr: 1.99, 
      cpc: 0.51,
      cpm: 10.09,
      conversions: 1234, 
      cpa: 10.09,
      roas: 5.2,
      results: 1234,
      costPerResult: 10.09,
      adSets: [
        { id: 'adset_001', name: 'Lookalike FR 1%', ads: 4, spent: 4152, roas: 5.8 },
        { id: 'adset_002', name: 'Retargeting 30d', ads: 3, spent: 3890, roas: 6.2 },
        { id: 'adset_003', name: 'Broad Interest', ads: 5, spent: 4414, roas: 4.1 }
      ]
    },
    { 
      id: 'camp_002', 
      name: 'Premium Brand Awareness', 
      objective: 'REACH',
      status: 'ACTIVE',
      learningPhase: true,
      budget: 8000, 
      spent: 6789.12,
      impressions: 987654, 
      clicks: 18765, 
      ctr: 1.90, 
      cpc: 0.36,
      cpm: 6.87,
      conversions: 789, 
      cpa: 8.60,
      roas: 4.8,
      results: 987654,
      costPerResult: 0.007,
      adSets: [
        { id: 'adset_004', name: 'Video Views', ads: 2, spent: 2263, roas: 3.9 },
        { id: 'adset_005', name: 'Broad Reach', ads: 3, spent: 2263, roas: 5.1 },
        { id: 'adset_006', name: 'High Income', ads: 3, spent: 2263, roas: 5.4 }
      ]
    },
    {
      id: 'camp_003',
      name: 'Elite Retargeting Strategy',
      objective: 'CONVERSIONS',
      status: 'PAUSED',
      learningPhase: false,
      budget: 5000,
      spent: 4321.56,
      impressions: 543210,
      clicks: 15432,
      ctr: 2.84,
      cpc: 0.28,
      cpm: 7.95,
      conversions: 654,
      cpa: 6.61,
      roas: 6.3,
      results: 654,
      costPerResult: 6.61,
      adSets: [
        { id: 'adset_007', name: 'Cart Abandoners', ads: 2, spent: 1440, roas: 8.2 },
        { id: 'adset_008', name: 'Product Viewers', ads: 2, spent: 1440, roas: 5.7 },
        { id: 'adset_009', name: 'Email List', ads: 2, spent: 1441, roas: 5.0 }
      ]
    }
  ];

  // Audience matrix data (age x gender)
  const audienceMatrix = [
    { ageGroup: '18-24', male: { cpa: 25, roas: 3.2, volume: 15000 }, female: { cpa: 22, roas: 4.1, volume: 18000 }, other: { cpa: 24, roas: 3.8, volume: 2000 } },
    { ageGroup: '25-34', male: { cpa: 28, roas: 4.5, volume: 22000 }, female: { cpa: 24, roas: 5.2, volume: 28000 }, other: { cpa: 26, roas: 4.8, volume: 3000 } },
    { ageGroup: '35-44', male: { cpa: 32, roas: 5.8, volume: 18000 }, female: { cpa: 28, roas: 6.4, volume: 20000 }, other: { cpa: 30, roas: 6.0, volume: 2500 } },
    { ageGroup: '45-54', male: { cpa: 38, roas: 4.2, volume: 12000 }, female: { cpa: 35, roas: 4.8, volume: 14000 }, other: { cpa: 36, roas: 4.5, volume: 1500 } },
    { ageGroup: '55-64', male: { cpa: 42, roas: 3.5, volume: 8000 }, female: { cpa: 40, roas: 3.9, volume: 9000 }, other: { cpa: 41, roas: 3.7, volume: 1000 } },
    { ageGroup: '65+', male: { cpa: 48, roas: 2.8, volume: 5000 }, female: { cpa: 45, roas: 3.2, volume: 6000 }, other: { cpa: 46, roas: 3.0, volume: 800 } }
  ];

  // Placement data
  const placementData = [
    { name: 'Feed', value: 45, spend: 20520, conversions: 555, cpa: 36.97 },
    { name: 'Stories', value: 25, spend: 11400, conversions: 342, cpa: 33.33 },
    { name: 'Reels', value: 20, spend: 9120, conversions: 285, cpa: 32.00 },
    { name: 'Audience Network', value: 10, spend: 4560, conversions: 102, cpa: 44.71 }
  ];

  // Creative assets gallery
  const creativeAssets = [
    { 
      id: 'cr_001', 
      type: 'video',
      thumbnail: '/api/placeholder/200/200',
      name: 'Black Friday Teaser',
      format: 'MP4 1080x1920',
      impressions: 345678,
      ctr: 3.2,
      cpc: 0.45,
      cpa: 8.90,
      fatigue: 15,
      hook: 'Limited time only!',
      cta: 'Shop Now',
      landingPage: '/black-friday'
    },
    { 
      id: 'cr_002', 
      type: 'carousel',
      thumbnail: '/api/placeholder/200/200',
      name: 'Product Showcase',
      format: 'Carousel 1080x1080',
      impressions: 289012,
      ctr: 2.8,
      cpc: 0.52,
      cpa: 10.20,
      fatigue: 32,
      hook: 'Best sellers collection',
      cta: 'Learn More',
      landingPage: '/collections/best-sellers'
    },
    { 
      id: 'cr_003', 
      type: 'image',
      thumbnail: '/api/placeholder/200/200',
      name: 'Premium Banner',
      format: 'Image 1200x628',
      impressions: 234567,
      ctr: 2.1,
      cpc: 0.68,
      cpa: 12.50,
      fatigue: 8,
      hook: 'Premium quality guaranteed',
      cta: 'Get Started',
      landingPage: '/premium'
    },
    { 
      id: 'cr_004', 
      type: 'video',
      thumbnail: '/api/placeholder/200/200',
      name: 'Customer Testimonial',
      format: 'MP4 1080x1080',
      impressions: 198765,
      ctr: 2.9,
      cpc: 0.48,
      cpa: 9.80,
      fatigue: 45,
      hook: 'Real customer story',
      cta: 'Try It Now',
      landingPage: '/testimonials'
    },
    { 
      id: 'cr_005', 
      type: 'collection',
      thumbnail: '/api/placeholder/200/200',
      name: 'Dynamic Product Feed',
      format: 'Collection Dynamic',
      impressions: 167890,
      ctr: 3.5,
      cpc: 0.42,
      cpa: 7.60,
      fatigue: 5,
      hook: 'Personalized for you',
      cta: 'Explore',
      landingPage: '/shop'
    },
    { 
      id: 'cr_006', 
      type: 'video',
      thumbnail: '/api/placeholder/200/200',
      name: 'How-To Tutorial',
      format: 'MP4 1080x1350',
      impressions: 145678,
      ctr: 2.6,
      cpc: 0.55,
      cpa: 11.30,
      fatigue: 22,
      hook: 'Learn in 30 seconds',
      cta: 'Watch More',
      landingPage: '/tutorials'
    }
  ];

  // AI Insights
  const aiInsights = {
    strengths: [
      { label: 'CTR élevé sur Reels 18-24', evidence: 'CTR 2.9% vs 1.4% global', impact: 'high' },
      { label: 'Lookalike 1% surperforme', evidence: 'ROAS 5.8 vs moyenne 4.2', impact: 'high' },
      { label: 'Vidéos courtes engageantes', evidence: '3.5% CTR sur <15s', impact: 'medium' }
    ],
    weaknesses: [
      { label: 'CPA élevé campagne Awareness', evidence: '€42 vs cible €25', impact: 'high' },
      { label: 'Fatigue créative sur 3 assets', evidence: 'CTR -45% sur 30j', impact: 'medium' },
      { label: 'Audience Network sous-performe', evidence: 'CPA +35% vs autres placements', impact: 'low' }
    ],
    actions: [
      { type: 'budget_shift', from: 'camp_002', to: 'camp_001', percent: 15, expectedImpact: '+€2,340 revenue' },
      { type: 'pause', target: 'cr_004', reason: 'Fatigue élevée (45%)', expectedImpact: 'Économie €450/jour' },
      { type: 'increase_bid', target: 'adset_001', percent: 10, expectedImpact: '+180 conversions/jour' }
    ]
  };

  // Optimizations panel
  const handleOptimization = (action) => {
    setCredits(prev => prev - 50);
    // Simulate optimization
    alert(`${locale === 'fr' ? 'Optimisation lancée' : 'Optimization started'}: ${action}`);
  };

  // Lead forms integration
  const leadFormsStats = {
    total: 3456,
    qualified: 2890,
    converted: 567,
    conversionRate: 19.6,
    avgQualityScore: 8.2,
    topSources: [
      { campaign: 'Black Friday', leads: 1234, quality: 8.5 },
      { campaign: 'Brand Awareness', leads: 890, quality: 7.8 },
      { campaign: 'Retargeting', leads: 1332, quality: 8.4 }
    ]
  };

  const tabs = [
    { id: 'campaigns', name: locale === 'fr' ? 'Campagnes' : 'Campaigns', icon: '🎯' },
    { id: 'audiences', name: locale === 'fr' ? 'Audiences' : 'Audiences', icon: '👥' },
    { id: 'creatives', name: locale === 'fr' ? 'Créatifs' : 'Creatives', icon: '🎨' },
    { id: 'optimizations', name: locale === 'fr' ? 'Optimisations' : 'Optimizations', icon: '⚡' },
    { id: 'insights', name: locale === 'fr' ? 'Insights IA' : 'AI Insights', icon: '🤖', badge: '3' },
    { id: 'leads', name: locale === 'fr' ? 'Lead Forms' : 'Lead Forms', icon: '📝' }
  ];

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-72'}`}>
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        moduleIcon="🚀"
        moduleName="Ads Master"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="p-6">
          {/* Header with Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Platform Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                {[
                  { id: 'META', label: 'META', icon: '📘', active: true },
                  { id: 'GOOGLE', label: 'Google', icon: '🔍', active: false },
                  { id: 'TIKTOK', label: 'TikTok', icon: '🎵', active: false }
                ].map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => platform.active && setSelectedPlatform(platform.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      platform.active 
                        ? (selectedPlatform === platform.id 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                          : 'hover:bg-white/10 text-white/70')
                        : 'opacity-50 cursor-not-allowed text-white/30'
                    }`}
                    disabled={!platform.active}
                  >
                    <span>{platform.icon}</span>
                    <span className="font-medium">{platform.label}</span>
                    {!platform.active && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        {locale === 'fr' ? 'Bientôt' : 'Soon'}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Account & Period Selectors */}
              <div className="flex items-center gap-3">
                {/* Account Selector */}
                <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 transition-colors outline-none">
                  <option value="act_1234567890">DigiFlow Main (act_1234567890)</option>
                  <option value="act_0987654321">DigiFlow Secondary (act_0987654321)</option>
                </select>

                {/* Period Selector */}
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 transition-colors outline-none"
                >
                  <option value="today">{locale === 'fr' ? 'Aujourd\'hui' : 'Today'}</option>
                  <option value="7d">{locale === 'fr' ? '7 derniers jours' : 'Last 7 days'}</option>
                  <option value="30d">{locale === 'fr' ? '30 derniers jours' : 'Last 30 days'}</option>
                  <option value="90d">{locale === 'fr' ? '90 derniers jours' : 'Last 90 days'}</option>
                  <option value="mtd">{locale === 'fr' ? 'Mois en cours' : 'Month to date'}</option>
                  <option value="ytd">{locale === 'fr' ? 'Année en cours' : 'Year to date'}</option>
                </select>

                {/* Sync Button */}
                <Button 
                  variant="outline"
                  className={`flex items-center gap-2 ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`}
                  onClick={() => {
                    setSyncStatus('syncing');
                    setTimeout(() => setSyncStatus('synced'), 2000);
                  }}
                >
                  <span className={`${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                    {syncStatus === 'syncing' ? '🔄' : '✅'}
                  </span>
                  {syncStatus === 'syncing' 
                    ? (locale === 'fr' ? 'Synchronisation...' : 'Syncing...') 
                    : (locale === 'fr' ? 'Synchronisé' : 'Synced')
                  }
                </Button>

                {/* AI Insights Button */}
                <Button 
                  variant="gradient" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2"
                  onClick={() => {
                    setAiAnalyzing(true);
                    setCredits(prev => prev - 20);
                    setTimeout(() => setAiAnalyzing(false), 3000);
                  }}
                >
                  <span className={`${aiAnalyzing ? 'animate-spin' : ''}`}>🤖</span>
                  {locale === 'fr' ? 'Analyse IA' : 'AI Analysis'}
                </Button>

                {/* Credits Display */}
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">⚡</span>
                    <span className="text-white font-bold">{credits.toLocaleString()}</span>
                    <span className="text-white/60 text-sm">{locale === 'fr' ? 'crédits' : 'credits'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <motion.h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Ads Master Pro
              </motion.h1>
              <p className="text-white/70 mt-1">{locale === 'fr' ? 'Centre de commande publicitaire unifié' : 'Unified Advertising Command Center'}</p>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'campaigns' && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Campaigns Table */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span>🎯</span> {locale === 'fr' ? 'Campagnes' : 'Campaigns'}
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-purple-500 transition-colors outline-none"
                      />
                      <Button variant="gradient" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        ➕ {locale === 'fr' ? 'Nouvelle' : 'New'}
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">{locale === 'fr' ? 'Nom' : 'Name'}</th>
                          <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">{locale === 'fr' ? 'Objectif' : 'Objective'}</th>
                          <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Status</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">{locale === 'fr' ? 'Dépenses' : 'Spend'}</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">CPM</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">CPC</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">CTR</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">{locale === 'fr' ? 'Résultats' : 'Results'}</th>
                          <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">ROAS</th>
                          <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign, i) => (
                          <motion.tr
                            key={campaign.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowDrilldown(true);
                            }}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-white font-medium">{campaign.name}</p>
                                <p className="text-white/40 text-xs mt-1">{campaign.id}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white/70 text-sm">{campaign.objective}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  campaign.status === 'ACTIVE' ? 'bg-green-500' : 
                                  campaign.status === 'PAUSED' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                <span className="text-white/70 text-sm">{campaign.status}</span>
                                {campaign.learningPhase && (
                                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                                    Learning
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-white font-medium">€{campaign.spent.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">/ €{campaign.budget.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4 text-right text-white/70">€{campaign.cpm.toFixed(2)}</td>
                            <td className="py-4 px-4 text-right text-white/70">€{campaign.cpc.toFixed(2)}</td>
                            <td className="py-4 px-4 text-right text-blue-400 font-medium">{campaign.ctr}%</td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-white font-medium">{campaign.results.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">€{campaign.costPerResult.toFixed(2)} / result</p>
                            </td>
                            <td className="py-4 px-4 text-right text-green-400 font-bold">{campaign.roas}x</td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOptimization(`pause_${campaign.id}`);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  ⏸️
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOptimization(`boost_${campaign.id}`);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  🚀
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOptimization(`edit_${campaign.id}`);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  ✏️
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-white/60 text-sm">
                      {locale === 'fr' ? 'Affichage 1-3 sur 3 campagnes' : 'Showing 1-3 of 3 campaigns'}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white/10 text-white/60 rounded hover:bg-white/20 transition-colors">←</button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded">1</button>
                      <button className="px-3 py-1 bg-white/10 text-white/60 rounded hover:bg-white/20 transition-colors">→</button>
                    </div>
                  </div>
                </GlassCard>

                {/* Campaign Drilldown */}
                {showDrilldown && selectedCampaign && (
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">
                        {locale === 'fr' ? 'Ensembles de publicités' : 'Ad Sets'} - {selectedCampaign.name}
                      </h3>
                      <button 
                        onClick={() => setShowDrilldown(false)}
                        className="text-white/40 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedCampaign.adSets.map(adSet => (
                        <div key={adSet.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="text-white font-medium mb-2">{adSet.name}</h4>
                          <p className="text-white/60 text-sm mb-3">{adSet.ads} {locale === 'fr' ? 'publicités actives' : 'active ads'}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/40 text-sm">{locale === 'fr' ? 'Dépensé' : 'Spent'}</span>
                              <span className="text-white">€{adSet.spent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40 text-sm">ROAS</span>
                              <span className="text-green-400 font-bold">{adSet.roas}x</span>
                            </div>
                          </div>
                          <button className="w-full mt-4 px-3 py-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors text-sm">
                            {locale === 'fr' ? 'Voir les publicités' : 'View Ads'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'audiences' && (
              <motion.div
                key="audiences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Audience Matrix */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span>👥</span> {locale === 'fr' ? 'Matrice d\'Audiences' : 'Audience Matrix'}
                  </h3>
                  
                  {/* Heatmap Age x Gender */}
                  <div className="mb-8">
                    <h4 className="text-white/60 text-sm mb-4">{locale === 'fr' ? 'Performance par Âge et Genre (CPA)' : 'Performance by Age and Gender (CPA)'}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-2 px-4 text-white/60 text-sm">{locale === 'fr' ? 'Âge' : 'Age'}</th>
                            <th className="text-center py-2 px-4 text-white/60 text-sm">{locale === 'fr' ? 'Homme' : 'Male'}</th>
                            <th className="text-center py-2 px-4 text-white/60 text-sm">{locale === 'fr' ? 'Femme' : 'Female'}</th>
                            <th className="text-center py-2 px-4 text-white/60 text-sm">{locale === 'fr' ? 'Autre' : 'Other'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {audienceMatrix.map((row, i) => (
                            <tr key={i}>
                              <td className="py-2 px-4 text-white font-medium">{row.ageGroup}</td>
                              {['male', 'female', 'other'].map(gender => {
                                const data = row[gender];
                                const intensity = Math.min(100, Math.max(0, 100 - (data.cpa - 20) * 2));
                                return (
                                  <td key={gender} className="py-2 px-4">
                                    <div
                                      className="p-3 rounded-lg text-center transition-all hover:scale-105 cursor-pointer"
                                      style={{
                                        background: `linear-gradient(135deg, rgba(139, 92, 246, ${intensity/100 * 0.5}), rgba(59, 130, 246, ${intensity/100 * 0.3}))`,
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                      }}
                                    >
                                      <p className="text-white font-bold">€{data.cpa}</p>
                                      <p className="text-white/60 text-xs">ROAS {data.roas}x</p>
                                      <p className="text-white/40 text-xs">{(data.volume/1000).toFixed(0)}k</p>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Placement Split */}
                  <div>
                    <h4 className="text-white/60 text-sm mb-4">{locale === 'fr' ? 'Répartition par Placement' : 'Placement Distribution'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {placementData.map((placement, i) => (
                        <motion.div
                          key={placement.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10"
                        >
                          <h5 className="text-white font-medium mb-3">{placement.name}</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/40">{locale === 'fr' ? 'Part' : 'Share'}</span>
                              <span className="text-white font-bold">{placement.value}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/40">{locale === 'fr' ? 'Dépenses' : 'Spend'}</span>
                              <span className="text-white">€{placement.spend.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/40">CPA</span>
                              <span className={`font-bold ${placement.cpa < 35 ? 'text-green-400' : placement.cpa < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                €{placement.cpa.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      💡 {locale === 'fr' 
                        ? 'Top 3 segments rentables : Femmes 25-34 (ROAS 5.2x), Femmes 35-44 (ROAS 6.4x), Hommes 35-44 (ROAS 5.8x)'
                        : 'Top 3 profitable segments: Female 25-34 (ROAS 5.2x), Female 35-44 (ROAS 6.4x), Male 35-44 (ROAS 5.8x)'}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'creatives' && (
              <motion.div
                key="creatives"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Creative Gallery */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span>🎨</span> {locale === 'fr' ? 'Galerie Créative' : 'Creative Gallery'}
                    </h3>
                    <div className="flex gap-3">
                      <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 transition-colors outline-none">
                        <option>{locale === 'fr' ? 'Tous les formats' : 'All formats'}</option>
                        <option>Video</option>
                        <option>Image</option>
                        <option>Carousel</option>
                        <option>Collection</option>
                      </select>
                      <Button variant="gradient" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        ⬆️ {locale === 'fr' ? 'Uploader' : 'Upload'}
                      </Button>
                    </div>
                  </div>

                  {/* Creative Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {creativeAssets.map((creative, i) => (
                      <motion.div
                        key={creative.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-8">
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              creative.type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                              creative.type === 'carousel' ? 'bg-purple-500/20 text-purple-400' :
                              creative.type === 'collection' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {creative.type.toUpperCase()}
                            </span>
                          </div>
                          {creative.fatigue > 30 && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                                ⚠️ Fatigue {creative.fatigue}%
                              </span>
                            </div>
                          )}
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-6xl">
                                {creative.type === 'video' ? '🎥' :
                                 creative.type === 'carousel' ? '🎠' :
                                 creative.type === 'collection' ? '🛍️' : '🖼️'}
                              </span>
                              <p className="text-white/60 text-sm mt-4">{creative.format}</p>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="text-white font-medium mb-2">{creative.name}</h4>
                          <p className="text-white/40 text-xs mb-3">ID: {creative.id}</p>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-white/40 text-xs">CTR</p>
                              <p className="text-white font-bold">{creative.ctr}%</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-white/40 text-xs">CPC</p>
                              <p className="text-white font-bold">€{creative.cpc}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-white/40 text-xs">CPA</p>
                              <p className="text-white font-bold">€{creative.cpa}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-white/40 text-xs">{locale === 'fr' ? 'Impr.' : 'Impr.'}</p>
                              <p className="text-white font-bold">{(creative.impressions/1000).toFixed(0)}k</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-1 text-xs mb-3">
                            <p className="text-white/60">Hook: "{creative.hook}"</p>
                            <p className="text-white/60">CTA: {creative.cta}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-white/10 text-white/70 rounded hover:bg-white/20 transition-colors text-sm">
                              {locale === 'fr' ? 'Dupliquer' : 'Duplicate'}
                            </button>
                            <button className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors text-sm">
                              A/B Test
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'optimizations' && (
              <motion.div
                key="optimizations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Optimizations Panel */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span>⚡</span> {locale === 'fr' ? 'Centre d\'Optimisation' : 'Optimization Center'}
                  </h3>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => handleOptimization('pause_underperforming')}
                      className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">⏸️</span>
                        <h4 className="text-white font-medium">{locale === 'fr' ? 'Pause Sous-performants' : 'Pause Underperformers'}</h4>
                      </div>
                      <p className="text-white/60 text-sm">
                        {locale === 'fr' ? '3 campagnes avec ROAS < 2.0' : '3 campaigns with ROAS < 2.0'}
                      </p>
                      <p className="text-red-400 text-xs mt-2">-0.5 {locale === 'fr' ? 'crédits' : 'credits'}</p>
                    </button>

                    <button
                      onClick={() => handleOptimization('boost_top')}
                      className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🚀</span>
                        <h4 className="text-white font-medium">{locale === 'fr' ? 'Booster Top Performers' : 'Boost Top Performers'}</h4>
                      </div>
                      <p className="text-white/60 text-sm">
                        {locale === 'fr' ? '+20% budget sur ROAS > 5.0' : '+20% budget on ROAS > 5.0'}
                      </p>
                      <p className="text-green-400 text-xs mt-2">-0.5 {locale === 'fr' ? 'crédits' : 'credits'}</p>
                    </button>

                    <button
                      onClick={() => handleOptimization('shift_budget')}
                      className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔄</span>
                        <h4 className="text-white font-medium">{locale === 'fr' ? 'Réallocation Budget' : 'Budget Reallocation'}</h4>
                      </div>
                      <p className="text-white/60 text-sm">
                        {locale === 'fr' ? 'Optimiser la distribution' : 'Optimize distribution'}
                      </p>
                      <p className="text-blue-400 text-xs mt-2">-0.5 {locale === 'fr' ? 'crédits' : 'credits'}</p>
                    </button>
                  </div>

                  {/* Optimization History */}
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white/60 text-sm mb-4">{locale === 'fr' ? 'Historique des Optimisations' : 'Optimization History'}</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅</span>
                          <div>
                            <p className="text-white text-sm">{locale === 'fr' ? 'Budget augmenté' : 'Budget increased'} - Black Friday Mega Sale</p>
                            <p className="text-white/40 text-xs">{locale === 'fr' ? 'Il y a 2 heures' : '2 hours ago'}</p>
                          </div>
                        </div>
                        <p className="text-green-400 text-sm">+€234 {locale === 'fr' ? 'revenue' : 'revenue'}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400">⏸️</span>
                          <div>
                            <p className="text-white text-sm">{locale === 'fr' ? 'Campagne pausée' : 'Campaign paused'} - Low CTR Campaign</p>
                            <p className="text-white/40 text-xs">{locale === 'fr' ? 'Il y a 5 heures' : '5 hours ago'}</p>
                          </div>
                        </div>
                        <p className="text-yellow-400 text-sm">€89 {locale === 'fr' ? 'économisés' : 'saved'}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* AI Insights */}
                <GlassCard className="p-6 backdrop-blur-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {locale === 'fr' ? 'Insights IA Octavia' : 'Octavia AI Insights'}
                      </h3>
                      <p className="text-white/60 mt-1">
                        {locale === 'fr' ? 'Analyse en temps réel de vos campagnes' : 'Real-time analysis of your campaigns'}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mb-6">
                    <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                      <span>💪</span> {locale === 'fr' ? 'Points Forts' : 'Strengths'}
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.strengths.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{insight.label}</p>
                              <p className="text-white/60 text-sm mt-1">{insight.evidence}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              insight.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                              insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {insight.impact.toUpperCase()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="mb-6">
                    <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                      <span>⚠️</span> {locale === 'fr' ? 'Points d\'Amélioration' : 'Areas for Improvement'}
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.weaknesses.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{insight.label}</p>
                              <p className="text-white/60 text-sm mt-1">{insight.evidence}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {insight.impact.toUpperCase()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                      <span>🎯</span> {locale === 'fr' ? 'Actions Recommandées' : 'Recommended Actions'}
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.actions.map((action, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">
                                {action.type === 'budget_shift' && `${locale === 'fr' ? 'Transférer' : 'Shift'} ${action.percent}% ${locale === 'fr' ? 'du budget de' : 'budget from'} ${action.from} ${locale === 'fr' ? 'vers' : 'to'} ${action.to}`}
                                {action.type === 'pause' && `${locale === 'fr' ? 'Pauser' : 'Pause'} ${action.target} - ${action.reason}`}
                                {action.type === 'increase_bid' && `${locale === 'fr' ? 'Augmenter l\'enchère de' : 'Increase bid by'} ${action.percent}% ${locale === 'fr' ? 'pour' : 'for'} ${action.target}`}
                              </p>
                              <p className="text-white/60 text-sm mt-1">{locale === 'fr' ? 'Impact attendu' : 'Expected impact'}: {action.expectedImpact}</p>
                            </div>
                            <button
                              onClick={() => handleOptimization(action.type)}
                              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                            >
                              {locale === 'fr' ? 'Appliquer' : 'Apply'}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-400 text-sm">
                      💡 {locale === 'fr' 
                        ? 'Coût de l\'analyse : 0.2 crédits. Prochaine analyse disponible dans 24h.'
                        : 'Analysis cost: 0.2 credits. Next analysis available in 24h.'}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Lead Forms Integration */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span>📝</span> {locale === 'fr' ? 'Lead Forms → HubCRM' : 'Lead Forms → HubCRM'}
                    </h3>
                    <Button 
                      variant="gradient" 
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={() => router.push('/app/demo/hubcrm')}
                    >
                      {locale === 'fr' ? 'Ouvrir HubCRM' : 'Open HubCRM'} →
                    </Button>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm mb-2">{locale === 'fr' ? 'Total Leads' : 'Total Leads'}</p>
                      <p className="text-3xl font-bold text-white">{leadFormsStats.total.toLocaleString()}</p>
                      <p className="text-green-400 text-sm mt-1">+23% {locale === 'fr' ? 'ce mois' : 'this month'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm mb-2">{locale === 'fr' ? 'Qualifiés' : 'Qualified'}</p>
                      <p className="text-3xl font-bold text-white">{leadFormsStats.qualified.toLocaleString()}</p>
                      <p className="text-white/40 text-sm mt-1">{((leadFormsStats.qualified/leadFormsStats.total)*100).toFixed(1)}% {locale === 'fr' ? 'du total' : 'of total'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm mb-2">{locale === 'fr' ? 'Convertis' : 'Converted'}</p>
                      <p className="text-3xl font-bold text-white">{leadFormsStats.converted}</p>
                      <p className="text-blue-400 text-sm mt-1">{leadFormsStats.conversionRate}% {locale === 'fr' ? 'taux' : 'rate'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm mb-2">{locale === 'fr' ? 'Score Qualité' : 'Quality Score'}</p>
                      <p className="text-3xl font-bold text-white">{leadFormsStats.avgQualityScore}/10</p>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${leadFormsStats.avgQualityScore * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Sources */}
                  <div>
                    <h4 className="text-white/60 text-sm mb-4">{locale === 'fr' ? 'Top Sources de Leads' : 'Top Lead Sources'}</h4>
                    <div className="space-y-3">
                      {leadFormsStats.topSources.map((source, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{source.campaign}</p>
                            <p className="text-white/60 text-sm">{source.leads} leads • Score qualité: {source.quality}/10</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-lg">{((source.leads/leadFormsStats.total)*100).toFixed(1)}%</p>
                            <p className="text-white/40 text-xs">{locale === 'fr' ? 'du total' : 'of total'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-purple-400 text-sm">
                      🔄 {locale === 'fr' 
                        ? 'Synchronisation automatique avec HubCRM activée. Les leads sont transférés en temps réel.'
                        : 'Automatic sync with HubCRM enabled. Leads are transferred in real-time.'}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Guide - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <GlassCard className="backdrop-blur-xl bg-gradient-to-r from-blue-900/10 to-purple-900/10 border-blue-500/20">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">
                      {locale === 'fr' ? 'Guide d\'utilisation - Ads Master Pro' : 'User Guide - Ads Master Pro'}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {locale === 'fr' ? 'Cliquez pour afficher le guide complet' : 'Click to show the complete guide'}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showGuide ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/60"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">🎯 Campagnes</h4>
                          <p className="text-white/60">
                            {locale === 'fr' 
                              ? 'Table complète avec tri, recherche, drilldown vers ad sets et ads. Sauvegardez vos vues personnalisées.'
                              : 'Complete table with sorting, search, drilldown to ad sets and ads. Save your custom views.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">👥 Audiences</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Matrice âge × genre avec heatmap CPA/ROAS. Analyse des placements (Feed, Stories, Reels).'
                              : 'Age × gender matrix with CPA/ROAS heatmap. Placement analysis (Feed, Stories, Reels).'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">🎨 Créatifs</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Galerie d\'assets avec performances. Détection de fatigue créative. Duplication rapide pour A/B tests.'
                              : 'Asset gallery with performance metrics. Creative fatigue detection. Quick duplication for A/B tests.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">⚡ Optimisations</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Actions d\'optimisation sans code. Pause/Boost/Réallocation de budget. Journal des actions avec impact.'
                              : 'No-code optimization actions. Pause/Boost/Budget reallocation. Action log with impact tracking.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">🤖 Insights IA</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Recommandations Octavia IA. Analyse forces/faiblesses. Actions one-click. Coût: 0.1-0.2 crédits.'
                              : 'Octavia AI recommendations. Strengths/weaknesses analysis. One-click actions. Cost: 0.1-0.2 credits.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-blue-400 font-semibold mb-2">📝 Lead Forms</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Intégration directe avec HubCRM. Webhook Meta Leadgen. Qualification automatique et alertes.'
                              : 'Direct integration with HubCRM. Meta Leadgen webhook. Automatic qualification and alerts.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-green-400 text-sm flex items-center gap-2">
                          <span>✨</span>
                          {locale === 'fr'
                            ? 'Astuce Pro : Utilisez les vues sauvegardées pour accéder rapidement à vos métriques préférées.'
                            : 'Pro Tip: Use saved views to quickly access your favorite metrics.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}