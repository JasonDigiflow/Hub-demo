'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metaConnected, setMetaConnected] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      aidsLogger.info(LogCategories.CAMPAIGN, 'Vérification connexion Meta pour les campagnes');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setMetaConnected(true);
        setSelectedAccount(data.selectedAccount);
        fetchCampaigns();
      } else {
        setMetaConnected(false);
        setError('Non connecté à Meta');
        aidsLogger.warning(LogCategories.CAMPAIGN, 'Meta non connecté pour afficher les campagnes');
      }
    } catch (error) {
      aidsLogger.error(LogCategories.CAMPAIGN, 'Erreur vérification connexion Meta', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      aidsLogger.info(LogCategories.CAMPAIGN, 'Récupération des campagnes Meta');
      const response = await fetch('/api/aids/meta/campaigns');
      const data = await response.json();
      
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        aidsLogger.success(LogCategories.CAMPAIGN, `${data.campaigns.length} campagnes récupérées`);
      } else if (data.error) {
        setError(data.error);
        aidsLogger.error(LogCategories.CAMPAIGN, 'Erreur récupération campagnes', { error: data.error });
      }
    } catch (error) {
      aidsLogger.error(LogCategories.CAMPAIGN, 'Erreur fetch campagnes', error);
      setError('Erreur lors de la récupération des campagnes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Campagnes</h1>
          <p className="text-gray-400">Gérez vos campagnes publicitaires Meta</p>
        </div>

        {/* Status Card */}
        {!metaConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">Connexion Meta requise</h3>
                <p className="text-gray-300 mt-1">
                  Connectez votre compte Meta pour accéder à vos campagnes publicitaires.
                </p>
                <button
                  onClick={() => router.push('/app/aids/connect')}
                  className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
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
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-400">Erreur</h3>
                <p className="text-gray-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-400">Aucune campagne trouvée</h3>
                <p className="text-gray-300 mt-1">
                  Vous n'avez pas encore de campagnes publicitaires. Créez votre première campagne dans Meta Business Manager.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Campaigns Grid */
          <div className="grid gap-6">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">ID: {campaign.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'ACTIVE' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Objectif</p>
                    <p className="text-sm font-medium text-white">{campaign.objective || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-sm font-medium text-white">
                      {campaign.daily_budget ? `€${(campaign.daily_budget / 100).toFixed(2)}/jour` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Dépenses</p>
                    <p className="text-sm font-medium text-white">
                      {campaign.spend ? `€${campaign.spend}` : '€0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Impressions</p>
                    <p className="text-sm font-medium text-white">
                      {campaign.impressions || '0'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}