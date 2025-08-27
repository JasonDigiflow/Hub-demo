'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CacheDataPage() {
  const [loading, setLoading] = useState(true);
  const [cacheData, setCacheData] = useState(null);

  useEffect(() => {
    fetchCacheData();
  }, []);

  const fetchCacheData = async () => {
    try {
      const response = await fetch('/api/aids/import-prod-data');
      const data = await response.json();
      
      if (data.success && data.data.insights_cache.length > 0) {
        setCacheData(data.data.insights_cache[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cache data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!cacheData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-white">Aucune donnée en cache</div>
      </div>
    );
  }

  // Calculate totals from campaigns
  const totals = {
    spend: 0,
    clicks: 0,
    impressions: 0,
    reach: 0,
    campaigns: cacheData.campaigns?.length || 0
  };

  cacheData.campaigns?.forEach(campaign => {
    if (campaign.insights) {
      totals.spend += parseFloat(campaign.insights.spend || 0);
      totals.clicks += parseInt(campaign.insights.clicks || 0);
      totals.impressions += parseInt(campaign.insights.impressions || 0);
      totals.reach = Math.max(totals.reach, parseInt(campaign.insights.reach || 0));
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Données Cache Firebase</h1>
        <p className="text-gray-400">
          UserId: {cacheData.userId} | AccountId: {cacheData.accountId}
        </p>
        <p className="text-sm text-gray-400">
          Dernière sync: {new Date(cacheData.lastSync.seconds * 1000).toLocaleString('fr-FR')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20"
        >
          <div className="text-sm text-purple-400">Total Dépenses</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totals.spend)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20"
        >
          <div className="text-sm text-blue-400">Clics</div>
          <div className="text-2xl font-bold text-white">{totals.clicks}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20"
        >
          <div className="text-sm text-green-400">Impressions</div>
          <div className="text-2xl font-bold text-white">{totals.impressions}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20"
        >
          <div className="text-sm text-yellow-400">Portée</div>
          <div className="text-2xl font-bold text-white">{totals.reach}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20"
        >
          <div className="text-sm text-indigo-400">Campagnes</div>
          <div className="text-2xl font-bold text-white">{totals.campaigns}</div>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Campagnes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">Nom</th>
                <th className="text-left py-2 text-gray-400">Statut</th>
                <th className="text-left py-2 text-gray-400">Objectif</th>
                <th className="text-right py-2 text-gray-400">Dépenses</th>
                <th className="text-right py-2 text-gray-400">Clics</th>
                <th className="text-right py-2 text-gray-400">CTR</th>
                <th className="text-right py-2 text-gray-400">CPC</th>
              </tr>
            </thead>
            <tbody>
              {cacheData.campaigns?.map((campaign, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-3 text-white font-medium">{campaign.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">{campaign.objective}</td>
                  <td className="py-3 text-right text-white">
                    {formatCurrency(campaign.insights?.spend || 0)}
                  </td>
                  <td className="py-3 text-right text-white">
                    {campaign.insights?.clicks || 0}
                  </td>
                  <td className="py-3 text-right text-white">
                    {campaign.insights?.ctr?.toFixed(2) || 0}%
                  </td>
                  <td className="py-3 text-right text-white">
                    {formatCurrency(campaign.insights?.cpc || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}