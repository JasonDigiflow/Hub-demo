'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import CampaignDrilldownTable from '@/components/aids/CampaignDrilldownTable';
import PeriodSelector from '@/app/components/aids/PeriodSelector';
import ComparisonBadge from '@/app/components/aids/ComparisonBadge';
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
  const [mounted, setMounted] = useState(false);
  // Initialize with current month
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
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [leadsSyncMessage, setLeadsSyncMessage] = useState('');

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
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncLeads = async () => {
    setSyncingLeads(true);
    setLeadsSyncMessage('');
    try {
      const response = await fetch('/api/aids/sync-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange })
      });
      const data = await response.json();
      
      if (data.success) {
        setLeadsSyncMessage(`✅ ${data.message}`);
        // Reload data to show new leads
        await loadInsightsData();
      } else {
        setLeadsSyncMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Error syncing leads:', error);
      setLeadsSyncMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setSyncingLeads(false);
      setTimeout(() => setLeadsSyncMessage(''), 5000);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Helper function to get date range from period
  const getPeriodDates = () => {
    if (period.type === 'month') {
      const monthStart = `${period.year}-${String(period.month + 1).padStart(2, '0')}-01`;
      const monthEnd = new Date(period.year, period.month + 1, 0);
      const monthEndStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
      return { startDate: monthStart, endDate: monthEndStr };
    } else if (period.type === 'custom') {
      return { startDate: period.start, endDate: period.end };
    }
    // For predefined periods, return null and use timeRange
    return { startDate: null, endDate: null };
  };

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      // Build API URL based on period type
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
      apiUrl += `&compare=${compare}`;
      
      // Build URL parameters for campaigns and breakdown APIs
      let campaignsUrl = '/api/aids/meta/campaigns?include_insights=true&';
      let breakdownUrl = `/api/aids/meta/insights?breakdowns=${showBreakdownType}&`;
      
      if (period.type === 'predefined') {
        campaignsUrl += `time_range=${period.period}`;
        breakdownUrl += `time_range=${period.period}`;
      } else if (period.type === 'month') {
        const monthStart = `${period.year}-${String(period.month + 1).padStart(2, '0')}-01`;
        const monthEnd = new Date(period.year, period.month + 1, 0);
        const monthEndStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
        campaignsUrl += `start_date=${monthStart}&end_date=${monthEndStr}`;
        breakdownUrl += `start_date=${monthStart}&end_date=${monthEndStr}`;
      } else if (period.type === 'custom') {
        campaignsUrl += `start_date=${period.start}&end_date=${period.end}`;
        breakdownUrl += `start_date=${period.start}&end_date=${period.end}`;
      }
      
      const [combinedRes, campaignsRes, breakdownRes] = await Promise.all([
        fetch(apiUrl),
        fetch(campaignsUrl),
        fetch(breakdownUrl)
      ]);

      const [combinedData, campaignsData, breakdownData] = await Promise.all([
        combinedRes.json(),
        campaignsRes.json(),
        breakdownRes.json()
      ]);

      if (combinedData.success) {
        // Set current period insights
        setInsights(combinedData.current);
        
        // Set comparison data if available
        if (combinedData.comparison) {
          setComparison(combinedData.comparison);
          setPercentChanges(combinedData.percentChanges);
        }
        
        // Set revenue data from combined response
        setRevenueData({
          total: combinedData.current.revenues || 0,
          count: combinedData.current.revenueCount || 0,
          convertedProspects: combinedData.current.convertedProspects || 0,
          conversionRate: combinedData.current.conversionRate || 0,
          roas: combinedData.current.roas || 0
        });
      }

      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns || []);
      }

      if (breakdownData.success && breakdownData.insights?.breakdown_data) {
        setAudienceBreakdown(breakdownData.insights.breakdown_data);
      }
      
      // Debug logs for data
      console.log('[Insights] Period:', period);
      console.log('[Insights] Combined data:', combinedData);
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

  // Prepare chart data - Create 4 important charts
  
  // 1. Dépenses vs Revenus (ROAS visuel)
  const spendRevenueChart = {
    labels: ['Dépenses', 'Revenus'],
    datasets: [{
      label: 'Montant (€)',
      data: [
        insights?.spend || 0,
        insights?.revenues || revenueData?.total || 0
      ],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ],
      borderColor: [
        '#9333ea',
        '#10b981'
      ],
      borderWidth: 2
    }]
  };

  // 2. Performance des métriques clés
  const performanceChart = {
    labels: ['Impressions (k)', 'Clics', 'Leads', 'Ventes'],
    datasets: [{
      label: 'Entonnoir de conversion',
      data: [
        (insights?.impressions || 0) / 1000, // Diviser par 1000 pour l'échelle
        insights?.clicks || 0,
        insights?.leads || 0,
        insights?.revenueCount || revenueData?.count || 0
      ],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(6, 182, 212, 0.8)'
      ],
      borderColor: [
        '#6366f1',
        '#3b82f6',
        '#0ea5e9',
        '#06b6d4'
      ],
      borderWidth: 2
    }]
  };

  // 3. Comparaison avec période précédente
  const comparisonChart = compare && comparison ? {
    labels: ['Dépenses', 'Impressions (k)', 'Clics', 'Leads', 'Revenus (€)', 'ROAS'],
    datasets: [
      {
        label: 'Période actuelle',
        data: [
          insights?.spend || 0,
          (insights?.impressions || 0) / 1000,
          insights?.clicks || 0,
          insights?.leads || 0,
          insights?.revenues || revenueData?.total || 0,
          parseFloat(insights?.roas || 0) * 100 // Multiplier par 100 pour l'échelle
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: '#9333ea',
        borderWidth: 2
      },
      {
        label: 'Période précédente',
        data: [
          comparison?.spend || 0,
          (comparison?.impressions || 0) / 1000,
          comparison?.clicks || 0,
          comparison?.leads || 0,
          comparison?.revenues || 0,
          parseFloat(comparison?.roas || 0) * 100
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: '#9ca3af',
        borderWidth: 2
      }
    ]
  } : { labels: [], datasets: [] };

  // 4. Métriques de coût (CPM, CPC, CPL)
  const costMetricsChart = {
    labels: ['CPM', 'CPC', 'CPL', 'CAC'],
    datasets: [{
      label: 'Coût (€)',
      data: [
        insights?.cpm || 0,
        insights?.cpc || 0,
        insights?.costPerLead || (insights?.spend && insights?.leads ? (insights.spend / insights.leads) : 0),
        insights?.costPerConversion || (insights?.spend && revenueData?.count ? (insights.spend / revenueData.count) : 0)
      ],
      backgroundColor: [
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(163, 230, 53, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        '#fb923c',
        '#facc15',
        '#a3e635',
        '#22c55e'
      ],
      borderWidth: 2
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
      {/* Header with Period Selector */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">Insights</h1>
            <p className="text-gray-300">
              Métriques et performances détaillées
              {insights?.date_range && (
                <span className="text-sm ml-2 text-purple-400">
                  ({new Date(insights.date_range.start).toLocaleDateString('fr-FR')} - {new Date(insights.date_range.end).toLocaleDateString('fr-FR')})
                </span>
              )}
            </p>
          </div>
          
          <PeriodSelector 
            value={period}
            onChange={handlePeriodChange}
            showComparison={true}
            onCompareToggle={(enabled) => setCompare(enabled)}
          />
        </div>
      </motion.div>

      {/* Sync Status Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-xl"
      >
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

            <button
              onClick={handleSyncLeads}
              disabled={syncingLeads}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                syncingLeads 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {syncingLeads ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Synchronisation leads...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Synchroniser les Leads
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
        
        {/* Messages de synchronisation */}
        {leadsSyncMessage && (
          <div className="mt-4">
            <div className={`px-4 py-3 rounded-lg text-sm ${
              leadsSyncMessage.includes('Erreur') || leadsSyncMessage.includes('Failed') ? 
              'bg-red-500/20 text-red-400 border border-red-500/30' : 
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>{leadsSyncMessage}</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* KPIs Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-xl"
        >
          <div className="text-xs text-gray-300 mb-1">Dépenses</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(insights?.spend || 0)}
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={insights?.spend || 0}
              previousValue={comparison?.spend || 0}
              format="currency"
            />
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-xl"
        >
          <div className="text-xs text-gray-300 mb-1">Impressions</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.impressions || 0)}
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={insights?.impressions || 0}
              previousValue={comparison?.impressions || 0}
              format="number"
            />
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-xl"
        >
          <div className="text-xs text-gray-300 mb-1">Clics</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.clicks || 0)}
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={insights?.clicks || 0}
              previousValue={comparison?.clicks || 0}
              format="number"
            />
          )}
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
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30 shadow-xl"
        >
          <div className="text-xs text-blue-300 mb-1">Leads Générés</div>
          <div className="text-xl font-bold text-blue-300">
            {formatNumber(insights?.leads || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            CPL: {insights?.leads && insights?.spend 
              ? formatCurrency(parseFloat(insights.spend) / insights.leads)
              : 'N/A'}
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={insights?.leads || 0}
              previousValue={comparison?.leads || 0}
              format="number"
            />
          )}
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
            {revenueData?.total && revenueData?.count > 0 
              ? `${formatCurrency(revenueData.total / revenueData.count)} moy.`
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
            {formatCurrency(revenueData?.total || insights?.revenues || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {revenueData?.count || 0} ventes
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={revenueData?.total || insights?.revenues || 0}
              previousValue={comparison?.revenues || 0}
              format="currency"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20"
        >
          <div className="text-xs text-purple-400 mb-1">ROAS Réel</div>
          <div className="text-xl font-bold text-purple-400">
            {insights?.roas ? `${insights.roas}x` :
             insights?.spend && revenueData?.total 
              ? `${(parseFloat(revenueData.total) / parseFloat(insights.spend)).toFixed(2)}x`
              : '0.00x'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {insights?.conversionRate 
              ? `Taux conv: ${insights.conversionRate}%`
              : revenueData?.conversionRate
                ? `Taux conv: ${revenueData.conversionRate}%`
                : insights?.spend && revenueData?.total 
                  ? `${((parseFloat(revenueData.total) / parseFloat(insights.spend) - 1) * 100).toFixed(0)}% ROI`
                  : 'N/A'}
          </div>
          {compare && comparison && (
            <ComparisonBadge 
              value={parseFloat(insights?.roas || (insights?.spend && revenueData?.total ? (parseFloat(revenueData.total) / parseFloat(insights.spend)) : 0))}
              previousValue={parseFloat(comparison?.roas || 0)}
              format="number"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-lg p-4 border border-indigo-500/20"
        >
          <div className="text-xs text-indigo-400 mb-1">TTD Moyen</div>
          <div className="text-xl font-bold text-indigo-400">
            {insights?.averageTTD ? `${insights.averageTTD}j` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {insights?.ttdCount > 0 
              ? `Sur ${insights.ttdCount} deals`
              : 'Pas de données'}
          </div>
        </motion.div>
      </motion.div>

      {/* 4 Charts - Full Width */}
      {mounted && (
        <div className="space-y-6 mb-8">
          {/* Chart 1: Dépenses vs Revenus (ROAS visuel) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="h-80">
              <Bar 
              data={spendRevenueChart} 
              options={{
                ...getChartOptions('💰 Dépenses vs Revenus - ROAS Visuel'),
                indexAxis: 'y',
                plugins: {
                  ...getChartOptions('').plugins,
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Chart 2: Entonnoir de Conversion */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="h-80">
            <Bar 
              data={performanceChart} 
              options={{
                ...getChartOptions('🎯 Entonnoir de Conversion'),
                plugins: {
                  ...getChartOptions('').plugins,
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Chart 3: Comparaison Périodes */}
        {compare && comparison && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-2xl"
          >
            <div className="h-80">
              <Bar 
                data={comparisonChart} 
                options={{
                  ...getChartOptions('📊 Comparaison avec la Période Précédente'),
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
        )}

        {/* Chart 4: Métriques de Coût */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="h-80">
            <Bar 
              data={costMetricsChart} 
              options={{
                ...getChartOptions('💸 Métriques de Coût par Action'),
                indexAxis: 'y',
                plugins: {
                  ...getChartOptions('').plugins,
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </motion.div>
        </div>
      )}

      {/* Campaign Drill-down Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <CampaignDrilldownTable 
          timeRange={period.type === 'predefined' ? period.period : 'last_30d'}
          startDate={getPeriodDates().startDate}
          endDate={getPeriodDates().endDate}
        />
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
    </div>
  );
}