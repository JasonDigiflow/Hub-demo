'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import CampaignDrilldownTable from '@/components/aids/CampaignDrilldownTable';
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

export default function AIDsInsights() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last_30d');
  const [insights, setInsights] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [audienceBreakdown, setAudienceBreakdown] = useState(null);
  const [showBreakdownType, setShowBreakdownType] = useState('age,gender');
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadInsightsData();
    fetchSyncStatus();
  }, [timeRange, showBreakdownType]);

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
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      // Use original API with proper time_range
      const [insightsRes, campaignsRes, breakdownRes, revenueRes] = await Promise.all([
        fetch(`/api/aids/meta/insights?time_range=${timeRange}&time_increment=1`),
        fetch(`/api/aids/meta/campaigns?include_insights=true&time_range=${timeRange}`),
        fetch(`/api/aids/meta/insights?time_range=${timeRange}&breakdowns=${showBreakdownType}`),
        fetch(`/api/aids/insights/revenues?time_range=${timeRange}`)
      ]);

      const [insightsData, campaignsData, breakdownData, revData] = await Promise.all([
        insightsRes.json(),
        campaignsRes.json(),
        breakdownRes.json(),
        revenueRes.json()
      ]);

      if (insightsData.success) {
        setInsights(insightsData.insights);
      }

      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns || []);
      }

      if (breakdownData.success && breakdownData.insights?.breakdown_data) {
        setAudienceBreakdown(breakdownData.insights.breakdown_data);
      }

      if (revData.success) {
        console.log('[Insights] Revenue data loaded:', revData.revenues);
        setRevenueData(revData.revenues || { total: 0, count: 0, daily_data: [] });
      }
      
      // Debug logs for data
      console.log('[Insights] Time range:', timeRange);
      console.log('[Insights] Insights data:', insightsData.insights);
      console.log('[Insights] Campaigns data:', campaignsData.campaigns);

      setLoading(false);
    } catch (error) {
      console.error('Error loading insights:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num?.toString() || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: title, color: 'white' }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } }
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Chargement des données...</div>
      </div>
    );
  }

  // Prepare chart data with real revenue data
  const spendRevenueChart = insights?.daily_data ? {
    labels: insights.daily_data.map(d => new Date(d.date).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })),
    datasets: [
      {
        label: 'Dépenses',
        data: insights.daily_data.map(d => d.spend),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4
      },
      {
        label: 'Revenus (Réels)',
        data: insights.daily_data.map(d => {
          // Use real revenue data from our database
          if (revenueData?.daily_data) {
            const dayRevenue = revenueData.daily_data.find(r => r.date === d.date);
            return dayRevenue ? dayRevenue.amount : 0;
          }
          return 0;
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4
      }
    ]
  } : { labels: [], datasets: [] };

  const ctrChart = insights?.daily_data ? {
    labels: insights.daily_data.map(d => new Date(d.date).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })),
    datasets: [{
      label: 'CTR %',
      data: insights.daily_data.map(d => d.ctr),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      tension: 0.4
    }]
  } : { labels: [], datasets: [] };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Period Selector */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Insights</h1>
            <p className="text-gray-400">
              Métriques et performances détaillées
              {insights?.date_range && (
                <span className="text-sm ml-2 text-purple-400">
                  ({new Date(insights.date_range.start).toLocaleDateString('fr-FR')} - {new Date(insights.date_range.end).toLocaleDateString('fr-FR')})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['today', 'yesterday', 'last_7d', 'last_30d', 'last_90d', 'lifetime'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {range === 'today' && 'Aujourd\'hui'}
                {range === 'yesterday' && 'Hier'}
                {range === 'last_7d' && '7 jours'}
                {range === 'last_30d' && '30 jours'}
                {range === 'last_90d' && '90 jours'}
                {range === 'lifetime' && 'Tout'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Status Bar */}
      <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                syncing 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {syncing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Synchronisation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Synchroniser maintenant
                </>
              )}
            </button>
            
            {syncStatus && (
              <>
                <div className="text-sm">
                  <span className="text-gray-400">Dernière sync:</span>
                  <span className="text-white ml-2">
                    {syncStatus.lastSync 
                      ? new Date(syncStatus.lastSync).toLocaleString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })
                      : 'Jamais'}
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-400">Prochaine sync:</span>
                  <span className="text-white ml-2">
                    {syncStatus.nextSync 
                      ? new Date(syncStatus.nextSync).toLocaleString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })
                      : 'Non programmée'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {syncStatus?.syncInProgress && (
              <span className="text-yellow-400">Synchronisation en cours...</span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Dépenses</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(insights?.spend || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Impressions</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.impressions || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Clics</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.clicks || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">CTR</div>
          <div className="text-xl font-bold text-white">
            {typeof insights?.ctr === 'number' ? insights.ctr.toFixed(2) : (insights?.ctr || '0')}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">CPC</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(insights?.cpc || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">CPM</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(insights?.cpm || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20"
        >
          <div className="text-xs text-blue-400 mb-1">Leads Générés</div>
          <div className="text-xl font-bold text-blue-400">
            {formatNumber(insights?.leads || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Ventes</div>
          <div className="text-xl font-bold text-white">
            {revenueData?.count || 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {insights?.spend && revenueData?.count > 0 
              ? `${formatCurrency(parseFloat(insights.spend) / revenueData.count)}/vente`
              : 'N/A'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Portée</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.reach || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20"
        >
          <div className="text-xs text-green-400 mb-1">Revenus Réels</div>
          <div className="text-xl font-bold text-green-400">
            {formatCurrency(revenueData?.total || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {revenueData?.count || 0} ventes
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20"
        >
          <div className="text-xs text-purple-400 mb-1">ROAS Réel</div>
          <div className="text-xl font-bold text-purple-400">
            {insights?.spend && revenueData?.total 
              ? (parseFloat(revenueData.total) / parseFloat(insights.spend)).toFixed(2) 
              : '0.00'}x
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {insights?.spend && revenueData?.total 
              ? `${((parseFloat(revenueData.total) / parseFloat(insights.spend) - 1) * 100).toFixed(0)}% ROI`
              : 'N/A'}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <div className="h-64">
            <Line 
              data={spendRevenueChart} 
              options={getChartOptions('Dépenses vs Revenus')} 
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <div className="h-64">
            <Line 
              data={ctrChart} 
              options={getChartOptions('Evolution du CTR')} 
            />
          </div>
        </motion.div>
      </div>

      {/* Campaign Drill-down Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <CampaignDrilldownTable timeRange={timeRange} />
      </motion.div>

      {/* Audience Breakdown Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Matrice de Performance Audience</h2>
          <select
            value={showBreakdownType}
            onChange={(e) => setShowBreakdownType(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white"
          >
            <option value="age,gender">Age & Genre</option>
            <option value="publisher_platform">Plateforme</option>
            <option value="impression_device">Appareil</option>
            <option value="region">Région</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {audienceBreakdown && audienceBreakdown.length > 0 ? (
            audienceBreakdown.map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10"
              >
                <h4 className="font-medium text-white mb-3">
                  {segment.age && `${segment.age} ans`}
                  {segment.gender && ` • ${segment.gender === 'male' ? 'Homme' : segment.gender === 'female' ? 'Femme' : 'Inconnu'}`}
                  {segment.publisher_platform}
                  {segment.impression_device}
                  {segment.region}
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Portée</span>
                    <span className="text-white font-medium">
                      {formatNumber(segment.metrics?.reach || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Impressions</span>
                    <span className="text-white font-medium">
                      {formatNumber(segment.metrics?.impressions || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clics</span>
                    <span className="text-white font-medium">
                      {formatNumber(segment.metrics?.clicks || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CTR</span>
                    <span className="text-white font-medium">
                      {typeof segment.metrics?.ctr === 'number' ? segment.metrics.ctr.toFixed(2) : (segment.metrics?.ctr || '0')}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions</span>
                    <span className="text-white font-medium">
                      {segment.metrics?.conversions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dépenses</span>
                    <span className="text-green-400 font-medium">
                      {formatCurrency(segment.metrics?.spend || 0)}
                    </span>
                  </div>
                </div>

                {/* Performance bar */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Efficacité</span>
                    <span className="text-xs text-white font-medium">
                      {segment.metrics?.ctr > 2 ? 'Élevée' : 
                       segment.metrics?.ctr > 1 ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        segment.metrics?.ctr > 2 ? 'bg-green-500' :
                        segment.metrics?.ctr > 1 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((segment.metrics?.ctr || 0) * 20, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-400">
              Aucune donnée de breakdown disponible pour cette période
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}