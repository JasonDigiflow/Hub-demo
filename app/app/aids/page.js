'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AccountDropdown from '@/components/aids/AccountDropdown';
import { 
  Activity, TrendingUp, Users, DollarSign, 
  AlertCircle, CheckCircle, XCircle, Clock,
  Zap, Database, Shield, Sparkles, 
  ChevronRight, RefreshCw, Settings
} from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSystemStatus();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'from-green-500 to-emerald-500';
      case 'degraded': return 'from-yellow-500 to-orange-500';
      case 'critical': return 'from-red-500 to-pink-500';
      case 'disconnected': return 'from-gray-500 to-gray-600';
      default: return 'from-red-500 to-pink-500';
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'operational': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertCircle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'disconnected': return <Shield className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
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
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const quickStats = [
    {
      title: 'Campagnes Actives',
      value: '12',
      change: '+3',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Budget Dépensé',
      value: '€2,456',
      change: '+12%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Conversions',
      value: '342',
      change: '+24%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Leads Générés',
      value: '1,234',
      change: '+18%',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const quickActions = [
    { name: 'Insights', icon: '📈', path: '/app/aids/insights', color: 'from-purple-600 to-pink-600' },
    { name: 'Campagnes', icon: '📊', path: '/app/aids/campaigns', color: 'from-blue-600 to-cyan-600' },
    { name: 'Prospects', icon: '👥', path: '/app/aids/prospects', color: 'from-green-600 to-emerald-600' },
    { name: 'Octavia AI', icon: '🤖', path: '/app/aids/octavia', color: 'from-indigo-600 to-purple-600' }
  ];

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
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
      </div>

      {/* Glass overlay pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black text-white mb-3">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  AIDs Dashboard
                </span>
              </h1>
              <p className="text-gray-300 text-xl">Intelligence publicitaire alimentée par Octavia AI</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-4 bg-white/10 backdrop-blur-2xl rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border-2 border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/app/aids/settings')}
                className="p-4 bg-white/10 backdrop-blur-2xl rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border-2 border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className={`relative p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} opacity-10`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${getStatusColor()} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {getStatusIcon()}
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold">État du Système</h3>
                  <p className="text-gray-300">{getStatusMessage()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Dernière sync</p>
                  <p className="text-white font-medium">{formatDate(lastSync)}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-400 text-sm">API Quota</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${apiQuota.used / apiQuota.limit > 0.8 ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500'} transition-all duration-500`}
                        style={{ width: `${(apiQuota.used / apiQuota.limit) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">{apiQuota.used}/{apiQuota.limit}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Compte Publicitaire</h3>
                  <AccountDropdown />
                </div>
              </div>

              {metaConnected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-xl rounded-2xl border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Connecté</span>
                </div>
              ) : (
                <motion.button
                  onClick={() => router.push('/app/aids/connect')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Connecter Meta
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    {stat.icon}
                  </div>
                  <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-white text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.name}
                onClick={() => router.push(action.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-8 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-20 transition-all duration-300`} />
                
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="text-5xl">{action.icon}</div>
                  <span className="text-white font-semibold text-lg">{action.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {recentLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Activité Récente</h2>
            
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 p-6">
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`p-4 bg-white/5 rounded-xl border ${
                      log.level === 'critical' ? 'border-red-500/30' :
                      log.level === 'error' ? 'border-orange-500/30' :
                      'border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {log.level === 'critical' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : log.level === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white">{log.message || 'Événement système'}</p>
                          <p className="text-gray-400 text-sm">{log.timestamp ? formatDate(new Date(log.timestamp)) : 'Maintenant'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-2xl rounded-3xl border-2 border-purple-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-[100px] opacity-30" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Octavia AI Assistant</h3>
                  <p className="text-gray-300">Optimisation automatique 24/7 de vos campagnes</p>
                </div>
              </div>
              
              <motion.button
                onClick={() => router.push('/app/aids/octavia')}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-5 h-5" />
                Activer l'autopilot
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
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