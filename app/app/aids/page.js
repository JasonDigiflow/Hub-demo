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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/aids/metrics?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data.metrics);
      setRecentActions(data.recentActions || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Load demo data as fallback
      setMetrics(getDemoMetrics());
      setRecentActions(getDemoActions());
    }
    setLoading(false);
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
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      spend: [650, 720, 680, 590, 710, 670, 600],
      revenue: [2600, 2880, 2720, 2360, 2840, 2680, 2400],
      ctr: [2.5, 2.6, 2.8, 2.4, 2.9, 2.7, 2.6]
    }
  });

  const getDemoActions = () => [
    { id: 1, type: 'GENERATE_CREATIVE', status: 'success', message: 'New creative generated for Summer Sale campaign', time: '2 min ago' },
    { id: 2, type: 'PAUSE_UNDERPERFORMER', status: 'warning', message: 'Paused "Generic Banner 02" - CTR below 1%', time: '15 min ago' },
    { id: 3, type: 'BUDGET_REALLOCATE', status: 'success', message: 'Moved $200 budget to winning ad set', time: '1 hour ago' },
    { id: 4, type: 'PROMOTE_WINNER', status: 'success', message: 'A/B Test winner promoted: "Dynamic Product Ads"', time: '3 hours ago' },
    { id: 5, type: 'DUPLICATE_ADSET_FOR_TEST', status: 'info', message: 'Started new A/B test for audience segmentation', time: '5 hours ago' }
  ];

  const seedDemoData = async () => {
    try {
      await fetch('/api/aids/demo/seed', { method: 'POST' });
      loadDashboardData();
    } catch (error) {
      console.error('Error seeding demo data:', error);
    }
  };

  const runPipeline = async () => {
    try {
      await fetch('/api/aids/pipeline/run', { method: 'POST' });
      loadDashboardData();
    } catch (error) {
      console.error('Error running pipeline:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading dashboard...</div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AIDs Dashboard
          </h1>
          <p className="text-gray-400">
            Octavia is optimizing your Meta campaigns in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={seedDemoData}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🌱 Seed Demo Data
          </button>
          <button
            onClick={runPipeline}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
          >
            🚀 Run Full Pipeline
          </button>
        </div>
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
            <span className="text-gray-400 text-sm">Total Spend</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${metrics?.overview.totalSpend.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-green-400 mt-1">↑ 12% vs last period</div>
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
          <div className="text-xs text-green-400 mt-1">↑ 0.5x improvement</div>
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
          <div className="text-xs text-green-400 mt-1">↑ 0.3% increase</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Ads</span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.overview.activeAds}
          </div>
          <div className="text-xs text-blue-400 mt-1">{metrics?.overview.campaigns} campaigns</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend & Revenue Chart */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Spend vs Revenue</h3>
          <div className="h-64">
            <Line
              data={{
                labels: metrics?.trend.labels || [],
                datasets: [
                  {
                    label: 'Spend',
                    data: metrics?.trend.spend || [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  },
                  {
                    label: 'Revenue',
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
          <h3 className="text-lg font-semibold text-white mb-4">CTR Performance</h3>
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
        <h3 className="text-lg font-semibold text-white mb-4">Recent Pipeline Actions</h3>
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
    </div>
  );
}