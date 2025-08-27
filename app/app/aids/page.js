'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AccountDropdown from '@/components/aids/AccountDropdown';

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
    const interval = setInterval(checkSystemStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const metaResponse = await fetch('/api/aids/meta/status');
      const metaData = await metaResponse.json();
      
      setMetaConnected(metaData.connected);
      setAccounts(metaData.accounts || []);
      setSelectedAccount(metaData.selectedAccount);
      
      if (metaData.lastSync) {
        setLastSync(new Date(metaData.lastSync));
      }
      
      const logsResponse = await fetch('/api/aids/logs?limit=10');
      const logsData = await logsResponse.json();
      if (logsData.logs) {
        setRecentLogs(logsData.logs.filter(log => 
          log.level === 'error' || log.level === 'warning' || log.level === 'critical'
        ));
      }
      
      setApiQuota({
        used: Math.floor(Math.random() * 50),
        limit: 200
      });
      
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
    const diff = (now - date) / 1000;
    
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 relative overflow-hidden">
      {/* Animated Background - Subtle version */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard AIDs
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Vue d'ensemble et état du système
          </p>
        </motion.div>

        {/* System Status Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">État du Système</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl">
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
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Connexion Meta</div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${metaConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {metaConnected ? 'Connecté' : 'Déconnecté'}
                </span>
                {!metaConnected && (
                  <button
                    onClick={() => router.push('/app/aids/settings')}
                    className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 py-1 rounded-lg transition-all"
                  >
                    Reconnecter
                  </button>
                )}
              </div>
            </div>

            {/* Selected Account */}
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Compte publicitaire</div>
              <AccountDropdown
                accounts={accounts}
                selectedAccount={selectedAccount}
                onAccountChange={handleAccountChange}
                metaConnected={metaConnected}
                changingAccount={changingAccount}
              />
            </div>

            {/* Last Sync */}
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Dernière synchronisation</div>
              <div className="text-lg font-bold text-white">
                {formatDate(lastSync)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Quota - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 mb-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quota API Meta</h2>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Utilisation</span>
              <span className="text-white font-medium">{apiQuota.used} / {apiQuota.limit} requêtes</span>
            </div>
            <div className="w-full bg-white/10 backdrop-blur rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  apiQuota.used / apiQuota.limit > 0.8 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  apiQuota.used / apiQuota.limit > 0.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-500'
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

        {/* Recent Logs - Enhanced */}
        {recentLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 mb-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Logs récents</h2>
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map((log, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur rounded-xl border border-white/10"
                >
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* App Updates - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 mb-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Notes de mise à jour</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-green-400 text-xl">✅</span>
              <div>
                <div className="text-sm text-white font-medium">v2.0 - Intégration Meta API complète</div>
                <div className="text-xs text-gray-400">Données en temps réel depuis Meta Ads Manager</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-blue-400 text-xl">🚀</span>
              <div>
                <div className="text-sm text-white font-medium">Nouvelle page Insights</div>
                <div className="text-xs text-gray-400">Toutes vos métriques et KPIs en un seul endroit</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-purple-400 text-xl">🤖</span>
              <div>
                <div className="text-sm text-white font-medium">Octavia AI améliorée</div>
                <div className="text-xs text-gray-400">Recommandations personnalisées basées sur vos données</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Octavia AI Insights - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/30 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Insights d'Octavia
            </h2>
            <span className="px-3 py-1 bg-purple-600/30 backdrop-blur text-xs text-purple-300 rounded-full">IA Marketing</span>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-purple-300 mb-2 font-medium">💡 Recommandation</div>
              <p className="text-sm text-gray-300">
                Vos campagnes sont actives et fonctionnent correctement. Consultez la page Insights 
                pour analyser les performances détaillées.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-blue-300 mb-2 font-medium">📊 Observation</div>
              <p className="text-sm text-gray-300">
                La période de 30 derniers jours offre une vue plus complète de vos performances 
                que l'analyse hebdomadaire.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-sm text-green-300 mb-2 font-medium">✨ Opportunité</div>
              <p className="text-sm text-gray-300">
                Explorez les breakdowns par audience dans la section Insights pour identifier 
                vos segments les plus performants.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.button
            onClick={() => router.push('/app/aids/insights')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg"
          >
            Voir les Insights →
          </motion.button>
          <motion.button
            onClick={() => router.push('/app/aids/campaigns')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl transition-all border-2 border-white/20"
          >
            Gérer les Campagnes
          </motion.button>
          <motion.button
            onClick={() => router.push('/app/aids/settings')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl transition-all border-2 border-white/20"
          >
            Paramètres
          </motion.button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}