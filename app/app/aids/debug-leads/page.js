'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function DebugLeadsPage() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metaConnected, setMetaConnected] = useState(false);

  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      setMetaConnected(data.connected);
    } catch (error) {
      setMetaConnected(false);
    }
  };

  const runDebug = async () => {
    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      aidsLogger.info(LogCategories.META_API, 'Démarrage diagnostic leads Meta');
      
      const response = await fetch('/api/aids/meta/leadcenter-debug');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        aidsLogger.error(LogCategories.META_API, 'Erreur diagnostic leads', { error: data.error });
      } else {
        setDebugData(data);
        aidsLogger.success(LogCategories.META_API, 'Diagnostic terminé', {
          totalForms: data.summary?.total_forms,
          totalLeads: data.summary?.total_leads_found
        });
      }
    } catch (error) {
      setError(error.message);
      aidsLogger.error(LogCategories.META_API, 'Erreur diagnostic', error);
    } finally {
      setLoading(false);
    }
  };

  const runNormalSync = async () => {
    setLoading(true);
    try {
      aidsLogger.info(LogCategories.PROSPECT, 'Synchronisation normale des leads');
      
      const response = await fetch('/api/aids/meta/leadcenter-v2');
      const data = await response.json();
      
      if (data.leads) {
        alert(`Synchronisation terminée : ${data.leads.length} leads trouvés`);
        aidsLogger.success(LogCategories.PROSPECT, `${data.leads.length} leads synchronisés`);
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
      aidsLogger.error(LogCategories.PROSPECT, 'Erreur sync leads', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Debug Leads Meta</h1>
          <p className="text-gray-400">Diagnostic complet pour identifier les leads manquants</p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={runDebug}
            disabled={loading || !metaConnected}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyse en cours...' : 'Lancer le diagnostic complet'}
          </button>

          <button
            onClick={runNormalSync}
            disabled={loading || !metaConnected}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Synchronisation normale
          </button>

          <button
            onClick={() => window.open('/app/aids/logs', '_blank')}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20"
          >
            Voir les logs
          </button>
        </div>

        {/* Meta Connection Status */}
        {!metaConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">Connexion Meta requise</h3>
                <p className="text-gray-300">Connectez-vous à Meta pour analyser vos leads</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-2">Erreur</h3>
            <p className="text-gray-300">{error}</p>
          </motion.div>
        )}

        {/* Debug Results */}
        {debugData && (
          <div className="space-y-6">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">📊 Résumé</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Formulaires trouvés</p>
                  <p className="text-2xl font-bold text-white">{debugData.summary?.total_forms || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Leads trouvés</p>
                  <p className="text-2xl font-bold text-green-400">{debugData.summary?.total_leads_found || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Pages</p>
                  <p className="text-2xl font-bold text-white">{debugData.summary?.total_pages || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Erreurs</p>
                  <p className="text-2xl font-bold text-red-400">{debugData.summary?.total_errors || 0}</p>
                </div>
              </div>
            </motion.div>

            {/* Forms Details */}
            {debugData.debug?.forms && debugData.debug.forms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">📝 Formulaires détectés</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 text-gray-400">Formulaire</th>
                        <th className="text-left py-2 px-3 text-gray-400">Page</th>
                        <th className="text-center py-2 px-3 text-gray-400">Leads (API)</th>
                        <th className="text-center py-2 px-3 text-gray-400">Leads (Réel)</th>
                        <th className="text-center py-2 px-3 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.debug.forms.map((form, index) => (
                        <tr key={form.id} className="border-b border-white/5">
                          <td className="py-2 px-3">
                            <div>
                              <p className="text-white font-medium">{form.name}</p>
                              <p className="text-xs text-gray-500">{form.id}</p>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-300">{form.page_name || 'N/A'}</td>
                          <td className="py-2 px-3 text-center text-white">{form.leads_count || 0}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={form.actual_leads_count > 0 ? 'text-green-400' : 'text-gray-400'}>
                              {form.actual_leads_count || 0}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {form.discrepancy ? (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                Écart détecté
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Errors */}
            {debugData.debug?.errors && debugData.debug.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-red-400 mb-4">⚠️ Erreurs détectées</h2>
                <div className="space-y-3">
                  {debugData.debug.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-500/10 rounded-lg">
                      <p className="text-sm font-medium text-red-400">
                        {error.step} {error.form_name && `- ${error.form_name}`}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {error.error?.message || JSON.stringify(error.error)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* API Calls Log */}
            {debugData.debug?.apiCalls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">🔗 Appels API ({debugData.debug.apiCalls.length})</h2>
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {debugData.debug.apiCalls.map((call, index) => (
                      <div key={index} className="p-2 bg-white/5 rounded text-xs">
                        <span className="text-purple-400">{call.type}</span>
                        {call.form_name && <span className="text-gray-400 ml-2">- {call.form_name}</span>}
                        <p className="text-gray-500 mt-1 truncate">{call.url}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}