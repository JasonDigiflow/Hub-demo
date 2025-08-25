'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function InsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaConnected, setMetaConnected] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last_7d');

  useEffect(() => {
    checkMetaConnection();
  }, []);

  useEffect(() => {
    if (metaConnected) {
      fetchInsights();
    }
  }, [timeRange, metaConnected]);

  const checkMetaConnection = async () => {
    try {
      aidsLogger.info(LogCategories.ANALYTICS, 'Vérification connexion Meta pour insights');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setMetaConnected(true);
        fetchInsights();
      } else {
        setMetaConnected(false);
        setError('Non connecté à Meta');
      }
    } catch (error) {
      aidsLogger.error(LogCategories.ANALYTICS, 'Erreur vérification connexion', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      aidsLogger.info(LogCategories.ANALYTICS, `Récupération insights: ${timeRange}`);
      const response = await fetch(`/api/aids/meta/insights?time_range=${timeRange}`);
      const data = await response.json();
      
      if (data.insights) {
        setInsights(data.insights);
        aidsLogger.success(LogCategories.ANALYTICS, 'Insights récupérés avec succès');
      } else if (data.error) {
        setError(data.error);
        aidsLogger.error(LogCategories.ANALYTICS, 'Erreur récupération insights', { error: data.error });
      }
    } catch (error) {
      aidsLogger.error(LogCategories.ANALYTICS, 'Erreur fetch insights', error);
      setError('Erreur lors de la récupération des insights');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#9333ea',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement des insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📈 Insights</h1>
          <p className="text-gray-400">Analysez les performances de vos campagnes</p>
        </div>

        {/* Time Range Selector */}
        {metaConnected && (
          <div className="mb-6 flex gap-2">
            {[
              { value: 'today', label: 'Aujourd\'hui' },
              { value: 'yesterday', label: 'Hier' },
              { value: 'last_7d', label: '7 derniers jours' },
              { value: 'last_30d', label: '30 derniers jours' },
              { value: 'lifetime', label: 'Tout' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {!metaConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">Connexion Meta requise</h3>
                <p className="text-gray-300 mt-1">
                  Connectez votre compte Meta pour accéder aux insights de vos campagnes.
                </p>
                <button
                  onClick={() => router.push('/app/aids/connect')}
                  className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
                >
                  Se connecter à Meta
                </button>
              </div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-400">Erreur</h3>
                <p className="text-gray-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : !insights ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-400">Pas de données disponibles</h3>
                <p className="text-gray-300 mt-1">
                  Aucune donnée d'insights disponible pour la période sélectionnée.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <p className="text-sm text-gray-400 mb-1">Dépenses</p>
                <p className="text-2xl font-bold text-white">
                  €{insights.spend || '0'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <p className="text-sm text-gray-400 mb-1">Impressions</p>
                <p className="text-2xl font-bold text-white">
                  {insights.impressions || '0'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <p className="text-sm text-gray-400 mb-1">Clics</p>
                <p className="text-2xl font-bold text-white">
                  {insights.clicks || '0'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <p className="text-sm text-gray-400 mb-1">CTR</p>
                <p className="text-2xl font-bold text-white">
                  {insights.ctr || '0'}%
                </p>
              </motion.div>
            </div>

            {/* Charts */}
            {insights.daily_data && insights.daily_data.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Évolution des dépenses</h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: insights.daily_data.map(d => d.date),
                        datasets: [{
                          label: 'Dépenses',
                          data: insights.daily_data.map(d => d.spend),
                          borderColor: '#9333ea',
                          backgroundColor: 'rgba(147, 51, 234, 0.1)',
                          tension: 0.4
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['Impressions', 'Clics', 'Conversions'],
                        datasets: [{
                          label: 'Métriques',
                          data: [
                            insights.impressions || 0,
                            insights.clicks || 0,
                            insights.conversions || 0
                          ],
                          backgroundColor: [
                            'rgba(147, 51, 234, 0.5)',
                            'rgba(236, 72, 153, 0.5)',
                            'rgba(34, 197, 94, 0.5)'
                          ],
                          borderColor: [
                            '#9333ea',
                            '#ec4899',
                            '#22c55e'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}