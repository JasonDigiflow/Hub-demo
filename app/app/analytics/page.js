'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

// Register ChartJS components
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);

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

  const performanceData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Revenus',
        data: [12500, 13800, 11200, 14500, 16200, 18500, 17300],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Dépenses Pub',
        data: [2500, 2800, 2200, 2900, 3200, 3700, 3400],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const conversionData = {
    labels: ['Leads', 'Prospects', 'Opportunités', 'Clients', 'Fidèles'],
    datasets: [{
      data: [1250, 890, 456, 234, 178],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const sourceData = {
    labels: ['Facebook Ads', 'Google Ads', 'Instagram', 'SEO', 'Direct', 'Email'],
    datasets: [{
      data: [35, 25, 20, 10, 7, 3],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Vue d'ensemble de vos performances marketing
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'day' ? 'Jour' : range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-6 border border-purple-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Revenu Total</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">98,543€</div>
          <div className="text-xs text-green-400 mt-1">↑ 22% vs période précédente</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Taux de conversion</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-white">3.8%</div>
          <div className="text-xs text-green-400 mt-1">↑ 0.5% vs période précédente</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">ROI Global</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">5.2x</div>
          <div className="text-xs text-green-400 mt-1">↑ 0.8x vs période précédente</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Clients actifs</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">1,234</div>
          <div className="text-xs text-green-400 mt-1">↑ 156 nouveaux ce mois</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Performance Revenus vs Dépenses</h2>
          <div className="h-80">
            <Line data={performanceData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Funnel de Conversion</h2>
          <div className="h-80">
            <Bar data={conversionData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </motion.div>
      </div>

      {/* Source Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Sources de Trafic</h2>
          <div className="h-64">
            <Doughnut data={sourceData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, position: 'right', labels: { color: '#fff' } } } }} />
          </div>
        </motion.div>

        {/* Top Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Top Campagnes</h2>
          <div className="space-y-3">
            {[
              { name: 'Black Friday 2024', roi: '8.5x', budget: '5,000€', status: 'active' },
              { name: 'Summer Collection', roi: '6.2x', budget: '3,500€', status: 'active' },
              { name: 'Brand Awareness Q1', roi: '4.1x', budget: '2,800€', status: 'paused' },
              { name: 'Product Launch X', roi: '3.8x', budget: '4,200€', status: 'active' },
              { name: 'Retargeting Pool', roi: '3.2x', budget: '1,500€', status: 'active' }
            ].map((campaign, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{campaign.name}</p>
                    <p className="text-xs text-gray-400">Budget: {campaign.budget}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-purple-400">ROI: {campaign.roi}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Activité Récente</h2>
        <div className="space-y-3">
          {[
            { action: 'Nouvelle campagne créée', app: 'AIDs', time: 'Il y a 2h', icon: '🎯' },
            { action: 'Rapport mensuel généré', app: 'Analytics', time: 'Il y a 4h', icon: '📊' },
            { action: '45 avis traités', app: 'Fidalyz', time: 'Il y a 6h', icon: '⭐' },
            { action: 'Budget optimisé automatiquement', app: 'AIDs', time: 'Il y a 8h', icon: '💰' }
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.app}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}