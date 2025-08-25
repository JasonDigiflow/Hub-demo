'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function PagesAssetsPage() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metaConnected, setMetaConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      aidsLogger.info(LogCategories.META_API, 'Vérification connexion Meta pour Pages & Assets');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setMetaConnected(true);
        fetchPagesAndAssets();
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

  const fetchPagesAndAssets = async () => {
    try {
      aidsLogger.info(LogCategories.META_API, 'Récupération Pages & Assets');
      const response = await fetch('/api/aids/meta/pages-assets');
      const data = await response.json();
      
      if (data.pages) {
        setPages(data.pages || []);
        setPixels(data.pixels || []);
        aidsLogger.success(LogCategories.META_API, `${data.pages?.length || 0} pages et ${data.pixels?.length || 0} pixels récupérés`);
      } else if (data.error) {
        setError(data.error);
        aidsLogger.error(LogCategories.META_API, 'Erreur récupération Pages & Assets', { error: data.error });
      }
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur fetch Pages & Assets', error);
      setError('Erreur lors de la récupération des données');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement des pages et assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📄 Pages & Assets</h1>
          <p className="text-gray-400">Gérez vos pages Facebook et pixels de conversion</p>
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
                  Connectez votre compte Meta pour gérer vos pages et assets.
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
        ) : (
          <div className="space-y-6">
            {/* Pages Facebook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Pages Facebook</h2>
              {pages.length === 0 ? (
                <p className="text-gray-400">Aucune page Facebook trouvée</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pages.map((page, index) => (
                    <div key={page.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        {page.picture && (
                          <img 
                            src={page.picture.data?.url || page.picture} 
                            alt={page.name}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-white">{page.name}</p>
                          <p className="text-sm text-gray-400">{page.category || 'Page'}</p>
                          {page.fan_count && (
                            <p className="text-xs text-purple-400 mt-1">
                              {page.fan_count.toLocaleString('fr-FR')} fans
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">ID: {page.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pixels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Pixels de conversion</h2>
              {pixels.length === 0 ? (
                <div>
                  <p className="text-gray-400 mb-3">Aucun pixel de conversion trouvé</p>
                  <p className="text-sm text-gray-500">
                    Les pixels permettent de suivre les conversions sur votre site web.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pixels.map((pixel, index) => (
                    <div key={pixel.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{pixel.name}</p>
                          <p className="text-sm text-gray-400">ID: {pixel.id}</p>
                          {pixel.last_fired_time && (
                            <p className="text-xs text-green-400 mt-1">
                              Dernière activité: {new Date(pixel.last_fired_time).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {pixel.code && (
                            <button className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors">
                              Voir le code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Custom Audiences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Audiences personnalisées</h2>
              <div className="flex items-center gap-4">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-gray-400">
                    Les audiences personnalisées vous permettent de cibler des groupes spécifiques.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Gérez vos audiences depuis le Business Manager de Meta.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}