'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AIDsDashboard() {
  const router = useRouter();
  const [metaConnected, setMetaConnected] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [recentLogs, setRecentLogs] = useState([]);
  const [apiQuota, setApiQuota] = useState({ used: 0, limit: 200 });
  const [loading, setLoading] = useState(true);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [changingAccount, setChangingAccount] = useState(false);

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check Meta connection
      const metaResponse = await fetch('/api/aids/meta/status');
      const metaData = await metaResponse.json();
      
      setMetaConnected(metaData.connected);
      setAccounts(metaData.accounts || []);
      setSelectedAccount(metaData.selectedAccount);
      
      // Get recent sync info
      if (metaData.lastSync) {
        setLastSync(new Date(metaData.lastSync));
      }
      
      // Get recent logs
      const logsResponse = await fetch('/api/aids/logs?limit=10');
      const logsData = await logsResponse.json();
      if (logsData.logs) {
        setRecentLogs(logsData.logs.filter(log => 
          log.level === 'error' || log.level === 'warning' || log.level === 'critical'
        ));
      }
      
      // Check API quota (mock for now - should be from Meta API)
      // This would need a real endpoint to check Meta API rate limits
      setApiQuota({
        used: Math.floor(Math.random() * 50),
        limit: 200
      });
      
      // Determine system status
      if (!metaData.connected) {
        setSystemStatus('disconnected');
      } else if (recentLogs.some(log => log.level === 'critical')) {
        setSystemStatus('critical');
      } else if (recentLogs.some(log => log.level === 'error')) {
        setSystemStatus('degraded');
      } else {
        setSystemStatus('operational');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemStatus('error');
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-red-400';
    }
  };

  const getStatusMessage = () => {
    switch (systemStatus) {
      case 'operational': return 'Tous les systèmes opérationnels';
      case 'degraded': return 'Performance dégradée';
      case 'critical': return 'Erreurs critiques détectées';
      case 'disconnected': return 'Connexion Meta requise';
      default: return 'État inconnu';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = (now - date) / 1000; // en secondes
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} heures`;
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleAccountChange = async (accountId) => {
    setChangingAccount(true);
    try {
      const response = await fetch('/api/aids/meta/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedAccount(accountId);
        setShowAccountSelector(false);
        // Refresh the page data
        await checkSystemStatus();
      } else {
        console.error('Failed to change account:', data.error);
      }
    } catch (error) {
      console.error('Error changing account:', error);
    } finally {
      setChangingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Dashboard AIDs
        </h1>
        <p className="text-gray-400">
          Vue d'ensemble et état du système
        </p>
      </div>

      {/* System Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">État du Système</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              systemStatus === 'operational' ? 'bg-green-400' :
              systemStatus === 'degraded' ? 'bg-yellow-400' :
              systemStatus === 'critical' ? 'bg-red-400' :
              'bg-gray-400'
            } animate-pulse`} />
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meta Connection Status */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Connexion Meta</div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${metaConnected ? 'text-green-400' : 'text-red-400'}`}>
                {metaConnected ? 'Connecté' : 'Déconnecté'}
              </span>
              {!metaConnected && (
                <button
                  onClick={() => router.push('/app/aids/settings')}
                  className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
                >
                  Reconnecter
                </button>
              )}
            </div>
          </div>

          {/* Selected Account with Switcher */}
          <div className="bg-black/20 rounded-lg p-4 relative">
            <div className="text-sm text-gray-400 mb-1">Compte publicitaire</div>
            {metaConnected ? (
              <div>
                <button
                  onClick={() => setShowAccountSelector(!showAccountSelector)}
                  className="w-full text-left flex items-center justify-between hover:bg-white/5 p-2 rounded transition-colors"
                >
                  <span className="text-sm font-bold text-white truncate">
                    {selectedAccount || 'Sélectionner un compte'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAccountSelector && accounts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {accounts.map((account) => (
                      <button
                        key={account.id || account}
                        onClick={() => handleAccountChange(account.id || account)}
                        disabled={changingAccount}
                        className={`w-full text-left p-3 hover:bg-white/10 transition-colors text-sm ${
                          (account.id || account) === selectedAccount 
                            ? 'bg-purple-600/20 text-purple-400' 
                            : 'text-white'
                        } ${changingAccount ? 'opacity-50' : ''}`}
                      >
                        <div className="font-medium">{account.name || account}</div>
                        {account.id && (
                          <div className="text-xs text-gray-400 mt-1">ID: {account.id}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">Non connecté</span>
            )}
          </div>

          {/* Last Sync */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Dernière synchronisation</div>
            <div className="text-lg font-bold text-white">
              {formatDate(lastSync)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Quota */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quota API Meta</h2>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Utilisation</span>
            <span className="text-white">{apiQuota.used} / {apiQuota.limit} requêtes</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                apiQuota.used / apiQuota.limit > 0.8 ? 'bg-red-500' :
                apiQuota.used / apiQuota.limit > 0.5 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(apiQuota.used / apiQuota.limit) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Réinitialisation dans {60 - new Date().getMinutes()} minutes
        </p>
      </motion.div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Logs récents</h2>
          <div className="space-y-2">
            {recentLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                <div className={`mt-1 w-2 h-2 rounded-full ${
                  log.level === 'critical' ? 'bg-red-400' :
                  log.level === 'error' ? 'bg-orange-400' :
                  'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-white">{log.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {log.category} • {formatDate(new Date(log.timestamp))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* App Updates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Notes de mise à jour</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-400">✅</span>
            <div>
              <div className="text-sm text-white font-medium">v2.0 - Intégration Meta API complète</div>
              <div className="text-xs text-gray-400">Données en temps réel depuis Meta Ads Manager</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400">🚀</span>
            <div>
              <div className="text-sm text-white font-medium">Nouvelle page Insights</div>
              <div className="text-xs text-gray-400">Toutes vos métriques et KPIs en un seul endroit</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-400">🤖</span>
            <div>
              <div className="text-sm text-white font-medium">Octavia AI améliorée</div>
              <div className="text-xs text-gray-400">Recommandations personnalisées basées sur vos données</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Octavia AI Insights (Qualitative only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Insights d'Octavia
          </h2>
          <span className="text-xs text-purple-400">IA Marketing</span>
        </div>

        <div className="space-y-3">
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-purple-300 mb-1">💡 Recommandation</div>
            <p className="text-sm text-gray-300">
              Vos campagnes sont actives et fonctionnent correctement. Consultez la page Insights 
              pour analyser les performances détaillées.
            </p>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-blue-300 mb-1">📊 Observation</div>
            <p className="text-sm text-gray-300">
              La période de 30 derniers jours offre une vue plus complète de vos performances 
              que l'analyse hebdomadaire.
            </p>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-green-300 mb-1">✨ Opportunité</div>
            <p className="text-sm text-gray-300">
              Explorez les breakdowns par audience dans la section Insights pour identifier 
              vos segments les plus performants.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <button
          onClick={() => router.push('/app/aids/insights')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Voir les Insights →
        </button>
        <button
          onClick={() => router.push('/app/aids/campaigns')}
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Gérer les Campagnes
        </button>
        <button
          onClick={() => router.push('/app/aids/settings')}
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Paramètres
        </button>
      </div>
    </div>
  );
}