'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function BusinessManagerPage() {
  const router = useRouter();
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaConnected, setMetaConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      aidsLogger.info(LogCategories.META_API, 'Vérification connexion Meta pour Business Manager');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setMetaConnected(true);
        fetchBusinessData();
      } else {
        setMetaConnected(false);
        setError('Non connecté à Meta');
      }
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur vérification connexion', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessData = async () => {
    try {
      aidsLogger.info(LogCategories.META_API, 'Récupération données Business Manager');
      const response = await fetch('/api/aids/meta/business');
      const data = await response.json();
      
      if (data.business) {
        setBusinessData(data.business);
        aidsLogger.success(LogCategories.META_API, 'Données Business Manager récupérées');
      } else if (data.error) {
        setError(data.error);
        aidsLogger.error(LogCategories.META_API, 'Erreur récupération Business Manager', { error: data.error });
      }
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur fetch Business Manager', error);
      setError('Erreur lors de la récupération des données');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement du Business Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💼 Business Manager</h1>
          <p className="text-gray-400">Gérez vos paramètres business et permissions</p>
        </div>

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
                  Connectez votre compte Meta pour accéder au Business Manager.
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
        ) : !businessData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-400">Pas de Business Manager</h3>
                <p className="text-gray-300 mt-1">
                  Aucun Business Manager associé à ce compte. Créez-en un dans Meta Business Suite.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Business Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Informations Business</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Nom</p>
                  <p className="text-white font-medium">{businessData.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="text-white font-medium">{businessData.id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date de création</p>
                  <p className="text-white font-medium">
                    {businessData.created_time 
                      ? new Date(businessData.created_time).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timezone</p>
                  <p className="text-white font-medium">{businessData.timezone || 'N/A'}</p>
                </div>
              </div>
            </motion.div>

            {/* Ad Accounts */}
            {businessData.ad_accounts && businessData.ad_accounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Comptes publicitaires</h2>
                <div className="space-y-3">
                  {businessData.ad_accounts.map((account, index) => (
                    <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{account.name}</p>
                          <p className="text-sm text-gray-400">ID: {account.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          account.account_status === 1
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {account.account_status === 1 ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Users */}
            {businessData.users && businessData.users.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Utilisateurs</h2>
                <div className="space-y-3">
                  {businessData.users.map((user, index) => (
                    <div key={user.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 font-medium">
                            {user.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.role || 'Utilisateur'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}