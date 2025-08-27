'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ProdDataPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProdData();
  }, []);

  const fetchProdData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/import-prod-data');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Chargement des données de production...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-red-400 text-xl font-bold mb-2">Erreur</h2>
          <p className="text-white">{error}</p>
          <button
            onClick={fetchProdData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Données de Production</h1>
        <p className="text-gray-400">Données en temps réel depuis Firebase (production)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20"
        >
          <div className="text-sm text-purple-400 mb-2">Total Prospects</div>
          <div className="text-3xl font-bold text-white">{data?.summary?.totalProspects || 0}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20"
        >
          <div className="text-sm text-green-400 mb-2">Total Revenus</div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(data?.summary?.totalRevenueAmount || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20"
        >
          <div className="text-sm text-blue-400 mb-2">Nombre de Ventes</div>
          <div className="text-3xl font-bold text-white">{data?.summary?.totalRevenues || 0}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/20"
        >
          <div className="text-sm text-yellow-400 mb-2">Cache Insights</div>
          <div className="text-3xl font-bold text-white">
            {data?.summary?.hasInsightsCache ? '✓' : '✗'}
          </div>
        </motion.div>
      </div>

      {/* Recent Revenues */}
      {data?.data?.revenues && data.data.revenues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Derniers Revenus</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-gray-400">Date</th>
                  <th className="text-left py-2 text-gray-400">Montant</th>
                  <th className="text-left py-2 text-gray-400">Campaign</th>
                  <th className="text-left py-2 text-gray-400">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.data.revenues.slice(0, 10).map((revenue, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-2 text-white">{formatDate(revenue.createdAt)}</td>
                    <td className="py-2 text-green-400 font-bold">{formatCurrency(revenue.amount)}</td>
                    <td className="py-2 text-gray-300">{revenue.campaignName || 'N/A'}</td>
                    <td className="py-2 text-gray-300">{revenue.source || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recent Prospects */}
      {data?.data?.prospects && data.data.prospects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Derniers Prospects</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-gray-400">Date</th>
                  <th className="text-left py-2 text-gray-400">Nom</th>
                  <th className="text-left py-2 text-gray-400">Email</th>
                  <th className="text-left py-2 text-gray-400">Campaign</th>
                  <th className="text-left py-2 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.prospects.slice(0, 10).map((prospect, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-2 text-white">{formatDate(prospect.createdAt)}</td>
                    <td className="py-2 text-white font-medium">{prospect.name || 'N/A'}</td>
                    <td className="py-2 text-gray-300">{prospect.email || 'N/A'}</td>
                    <td className="py-2 text-gray-300">{prospect.campaignName || 'N/A'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        prospect.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                        prospect.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {prospect.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Revenue Chart Data */}
      {data?.chartData?.revenuesByDate && data.chartData.revenuesByDate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Revenus par Jour</h2>
          <div className="space-y-2">
            {data.chartData.revenuesByDate.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-black/20 rounded">
                <span className="text-gray-300">{formatDate(item.date)}</span>
                <span className="text-green-400 font-bold">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={fetchProdData}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Rafraîchir les données
        </button>
      </div>
    </div>
  );
}