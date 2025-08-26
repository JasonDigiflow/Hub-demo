'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [timeRange, setTimeRange] = useState('last_30d'); // Default to 30 days
  const [insights, setInsights] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [audienceBreakdown, setAudienceBreakdown] = useState(null);
  const [showBreakdownType, setShowBreakdownType] = useState('age,gender');
  const [expandedCampaign, setExpandedCampaign] = useState(null);

  useEffect(() => {
    loadInsightsData();
  }, [timeRange, showBreakdownType]);

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      // Load insights with time series
      const [insightsRes, campaignsRes, breakdownRes] = await Promise.all([
        fetch(`/api/aids/meta/insights?time_range=${timeRange}&time_increment=1`),
        fetch('/api/aids/meta/campaigns?include_insights=true'),
        fetch(`/api/aids/meta/insights?time_range=${timeRange}&breakdowns=${showBreakdownType}`)
      ]);

      const [insightsData, campaignsData, breakdownData] = await Promise.all([
        insightsRes.json(),
        campaignsRes.json(),
        breakdownRes.json()
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

  // Prepare chart data
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
      ...(insights.has_revenue_data ? [{
        label: 'Revenus',
        data: insights.daily_data.map(d => {
          if (d.action_values) {
            const purchase = d.action_values.find(a => a.action_type === 'purchase');
            return purchase ? parseFloat(purchase.value) : 0;
          }
          return 0;
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4
      }] : [])
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
            <p className="text-gray-400">Métriques et performances détaillées</p>
          </div>
          
          <div className="flex gap-2">
            {['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'].map((range) => (
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
                {range === 'lifetime' && 'Tout'}
              </button>
            ))}
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
            {insights?.ctr || '0'}%
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
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Conversions</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(insights?.conversions || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <div className="text-xs text-gray-400 mb-1">Coût/Conv.</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(insights?.cost_per_conversion || 0)}
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

        {insights?.has_revenue_data && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div className="text-xs text-gray-400 mb-1">Revenus</div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(insights?.conversion_value || 0)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div className="text-xs text-gray-400 mb-1">ROAS</div>
              <div className="text-xl font-bold text-green-400">
                {insights?.roas || '0'}x
              </div>
            </motion.div>
          </>
        )}

        {!insights?.has_revenue_data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="col-span-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
          >
            <div className="text-xs text-gray-400 mb-1">Revenus</div>
            <div className="text-sm text-gray-500">
              Données de revenu non disponibles
            </div>
          </motion.div>
        )}
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

      {/* Campaigns List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Campagnes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Nom</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Dépenses</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Impressions</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Clics</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">CTR</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Conversions</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">CPC</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr 
                  key={campaign.id} 
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  onClick={() => setExpandedCampaign(
                    expandedCampaign === campaign.id ? null : campaign.id
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">{campaign.name}</div>
                    <div className="text-xs text-gray-400">{campaign.objective}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      campaign.effective_status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.effective_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {formatCurrency(campaign.insights?.spend || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {formatNumber(campaign.insights?.impressions || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {formatNumber(campaign.insights?.clicks || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {campaign.insights?.ctr || '0'}%
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {campaign.insights?.conversions || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {formatCurrency(campaign.insights?.cpc || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      {segment.metrics?.ctr || '0'}%
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