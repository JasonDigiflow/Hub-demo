'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import CampaignDrilldownTable from '@/components/aids/CampaignDrilldownTable';
import PeriodSelector from '@/app/components/aids/PeriodSelector';
import ComparisonBadge from '@/app/components/aids/ComparisonBadge';
import {
  TrendingUp, TrendingDown, Activity, Users, 
  DollarSign, Target, Eye, MousePointer,
  RefreshCw, Download, Filter, ChevronRight,
  BarChart3, PieChart, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AIDsInsights() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const now = new Date();
  const [period, setPeriod] = useState({ 
    type: 'month', 
    month: now.getMonth(), 
    year: now.getFullYear() 
  });
  const [compare, setCompare] = useState(true);
  const [insights, setInsights] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [percentChanges, setPercentChanges] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [audienceBreakdown, setAudienceBreakdown] = useState(null);
  const [showBreakdownType, setShowBreakdownType] = useState('age,gender');
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadInsightsData();
    fetchSyncStatus();
  }, [period, compare, showBreakdownType]);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/aids/insights/sync');
      const data = await response.json();
      if (data.success) {
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/aids/insights/sync', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await loadInsightsData();
        await fetchSyncStatus();
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsightsData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getPeriodDates = () => {
    if (period.type === 'month') {
      const monthStart = `${period.year}-${String(period.month + 1).padStart(2, '0')}-01`;
      const monthEnd = new Date(period.year, period.month + 1, 0);
      const monthEndStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
      return { startDate: monthStart, endDate: monthEndStr };
    } else if (period.type === 'custom') {
      return { startDate: period.start, endDate: period.end };
    }
    return { startDate: null, endDate: null };
  };

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      let apiUrl = '/api/aids/combined-insights-v2?';
      if (period.type === 'predefined') {
        apiUrl += `period=${period.period}`;
      } else if (period.type === 'month') {
        const monthStart = `${period.year}-${String(period.month + 1).padStart(2, '0')}-01`;
        const monthEnd = new Date(period.year, period.month + 1, 0);
        const monthEndStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
        apiUrl += `start_date=${monthStart}&end_date=${monthEndStr}`;
      } else if (period.type === 'custom') {
        apiUrl += `start_date=${period.start}&end_date=${period.end}`;
      }
      
      if (compare) {
        apiUrl += '&compare=true';
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.current);
        setCampaigns(data.campaigns || []);
        setAudienceBreakdown(data.audienceBreakdown);
        setRevenueData(data.revenueData);
        
        if (compare && data.comparison) {
          setComparison(data.comparison);
          setPercentChanges(data.percentChanges);
        }
      } else {
        console.error('Error loading insights:', data.error);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    const value = Number(num);
    if (isNaN(value)) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return '€0';
    const value = Number(num);
    if (isNaN(value)) return '€0';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPercentageChange = (metric) => {
    if (!percentChanges || !percentChanges[metric]) return null;
    const change = Number(percentChanges[metric]);
    if (isNaN(change)) return null;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  const kpiCards = [
    {
      title: 'Dépenses',
      value: formatCurrency(insights?.spend || 0),
      change: getPercentageChange('spend'),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Revenus',
      value: formatCurrency(revenueData?.total || 0),
      change: getPercentageChange('revenues'),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'ROAS',
      value: (Number(insights?.roas) || 0).toFixed(2) + 'x',
      change: getPercentageChange('roas'),
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Conversions',
      value: formatNumber(insights?.leads || 0),
      change: getPercentageChange('leads'),
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Chart configurations with glassmorphism style
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff',
          font: { size: 12 },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // Performance over time chart
  const performanceChart = campaigns.length > 0 ? {
    labels: campaigns.slice(0, 7).map(c => c.name.substring(0, 15)),
    datasets: [
      {
        label: 'Dépenses (€)',
        data: campaigns.slice(0, 7).map(c => c.spend || 0),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4
      },
      {
        label: 'Revenus (€)',
        data: campaigns.slice(0, 7).map(c => (c.conversions || 0) * 50),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  } : { labels: [], datasets: [] };

  // Audience breakdown chart
  const audienceChart = audienceBreakdown?.age ? {
    labels: Object.keys(audienceBreakdown.age),
    datasets: [{
      data: Object.values(audienceBreakdown.age),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(99, 102, 241, 0.8)'
      ],
      borderWidth: 0
    }]
  } : { labels: [], datasets: [] };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des insights...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
      </div>

      {/* Glass overlay pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-6xl font-black text-white mb-3">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  Insights
                </span>
              </h1>
              <p className="text-gray-300 text-xl">
                Métriques et performances détaillées
                {insights?.date_range && (
                  <span className="text-sm ml-2 text-purple-400">
                    ({new Date(insights.date_range.start).toLocaleDateString('fr-FR')} - {new Date(insights.date_range.end).toLocaleDateString('fr-FR')})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <PeriodSelector 
                value={period}
                onChange={handlePeriodChange}
                showComparison={true}
                onCompareToggle={(enabled) => setCompare(enabled)}
              />

              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-4 bg-white/10 backdrop-blur-2xl rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border-2 border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Synchronisation...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Synchroniser</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    {kpi.icon}
                  </div>
                  {kpi.change && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                      kpi.change.isPositive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {kpi.change.isPositive ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">{Number(kpi.change.value).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm mb-1">{kpi.title}</p>
                <p className="text-white text-3xl font-bold">{kpi.value}</p>
                
                {comparison && (
                  <p className="text-gray-500 text-xs mt-2">
                    vs. {kpi.title === 'Dépenses' ? formatCurrency(comparison.spend) :
                        kpi.title === 'Revenus' ? formatCurrency(comparison.revenues) :
                        kpi.title === 'ROAS' ? (Number(comparison?.roas) || 0).toFixed(2) + 'x' :
                        formatNumber(comparison.leads)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Performance des Campagnes</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              {performanceChart.labels.length > 0 && (
                <Line data={performanceChart} options={chartOptions} />
              )}
            </div>
          </motion.div>

          {/* Audience Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Répartition de l'Audience</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80 flex items-center justify-center">
              {audienceChart.labels.length > 0 ? (
                <Doughnut 
                  data={audienceChart} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} 
                />
              ) : (
                <p className="text-gray-500">Aucune donnée d'audience disponible</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Impressions', value: formatNumber(insights?.impressions || 0), icon: <Eye className="w-5 h-5" /> },
            { label: 'Clics', value: formatNumber(insights?.clicks || 0), icon: <MousePointer className="w-5 h-5" /> },
            { label: 'CTR', value: `${(Number(insights?.ctr) || 0).toFixed(2)}%`, icon: <Activity className="w-5 h-5" /> },
            { label: 'CPC', value: formatCurrency(insights?.cpc || 0), icon: <DollarSign className="w-5 h-5" /> }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{metric.label}</span>
                <div className="text-gray-500">{metric.icon}</div>
              </div>
              <p className="text-white text-2xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Campaign Details Table */}
        {campaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Détails des Campagnes</h3>
            <CampaignDrilldownTable 
              campaigns={campaigns}
              expandedCampaign={expandedCampaign}
              setExpandedCampaign={setExpandedCampaign}
            />
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}