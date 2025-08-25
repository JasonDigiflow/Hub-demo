'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function AIDsLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [serverLogs, setServerLogs] = useState([]);
  const [viewMode, setViewMode] = useState('local'); // local or server

  useEffect(() => {
    loadLogs();
    const interval = autoRefresh ? setInterval(loadLogs, 2000) : null;
    return () => interval && clearInterval(interval);
  }, [autoRefresh, viewMode]);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedLevel, selectedCategory, searchTerm]);

  const loadLogs = async () => {
    if (viewMode === 'local') {
      // Charger les logs locaux
      const localLogs = aidsLogger.getLogs();
      setLogs(localLogs);
      const localStats = aidsLogger.getStats();
      setStats(localStats);
    } else {
      // Charger les logs serveur
      try {
        const response = await fetch('/api/aids/logs');
        const data = await response.json();
        if (data.success) {
          setServerLogs(data.logs);
          setLogs(data.logs);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading server logs:', error);
      }
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trier par timestamp décroissant (plus récent en premier)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    if (confirm('Voulez-vous vraiment effacer tous les logs locaux ?')) {
      aidsLogger.clearLogs();
      loadLogs();
    }
  };

  const exportLogs = (format) => {
    const data = format === 'json' 
      ? aidsLogger.exportLogs('json')
      : aidsLogger.exportLogs('csv');
    
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aids-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'DEBUG': return 'text-gray-400';
      case 'INFO': return 'text-blue-400';
      case 'WARNING': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      case 'CRITICAL': return 'text-red-600 font-bold';
      case 'SUCCESS': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelBg = (level) => {
    switch(level) {
      case 'DEBUG': return 'bg-gray-600/20';
      case 'INFO': return 'bg-blue-600/20';
      case 'WARNING': return 'bg-yellow-600/20';
      case 'ERROR': return 'bg-red-600/20';
      case 'CRITICAL': return 'bg-red-800/30 animate-pulse';
      case 'SUCCESS': return 'bg-green-600/20';
      default: return 'bg-gray-600/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'META_API': return '🔗';
      case 'CAMPAIGN': return '📊';
      case 'PROSPECT': return '👥';
      case 'REVENUE': return '💰';
      case 'AUTH': return '🔐';
      case 'UI': return '🎨';
      case 'ANALYTICS': return '📈';
      case 'OCTAVIA_AI': return '🤖';
      case 'BUDGET': return '💵';
      case 'PERFORMANCE': return '⚡';
      case 'EXPORT': return '📤';
      case 'SYNC': return '🔄';
      case 'ERROR_HANDLER': return '⚠️';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🔍 Logs & Diagnostics AIDs
          </h1>
          <p className="text-gray-400">
            Surveillez et analysez tous les événements de votre système AIDs en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('local')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'local'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setViewMode('server')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'server'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Serveur
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>📤</span>
            Exporter
          </button>

          {/* Clear Button */}
          {viewMode === 'local' && (
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30"
            >
              Effacer tout
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <p className="text-xs text-gray-400 mb-1">Total logs</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-600/10 rounded-lg p-4 border border-red-600/20"
          >
            <p className="text-xs text-gray-400 mb-1">Erreurs</p>
            <p className="text-2xl font-bold text-red-400">{stats.errors?.length || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-600/10 rounded-lg p-4 border border-yellow-600/20"
          >
            <p className="text-xs text-gray-400 mb-1">Warnings</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.byLevel?.WARNING || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-600/10 rounded-lg p-4 border border-green-600/20"
          >
            <p className="text-xs text-gray-400 mb-1">Succès</p>
            <p className="text-2xl font-bold text-green-400">{stats.byLevel?.SUCCESS || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20"
          >
            <p className="text-xs text-gray-400 mb-1">Dernière heure</p>
            <p className="text-2xl font-bold text-blue-400">{stats.lastHour || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-purple-600/10 rounded-lg p-4 border border-purple-600/20"
          >
            <p className="text-xs text-gray-400 mb-1">24h</p>
            <p className="text-2xl font-bold text-purple-400">{stats.last24Hours || 0}</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="ALL">Tous les niveaux</option>
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="SUCCESS">SUCCESS</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="ALL">Toutes les catégories</option>
            {Object.keys(LogCategories).map(cat => (
              <option key={cat} value={LogCategories[cat]}>{LogCategories[cat]}</option>
            ))}
          </select>

          <div className="text-sm text-gray-400">
            {filteredLogs.length} logs affichés
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Aucun log trouvé avec ces filtres
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className={`p-4 hover:bg-white/5 transition-colors ${getLevelBg(log.level)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Level Badge */}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)} ${getLevelBg(log.level)}`}>
                          {log.level}
                        </span>

                        {/* Category */}
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <span>{getCategoryIcon(log.category)}</span>
                          {log.category}
                        </span>

                        {/* Timestamp */}
                        <span className="text-gray-500 text-xs">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>

                      {/* Message */}
                      <div className="text-white font-medium mb-2">
                        {log.message}
                      </div>

                      {/* Data */}
                      {log.data && Object.keys(log.data).length > 0 && (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-gray-400 hover:text-gray-300">
                            Voir les détails
                          </summary>
                          <pre className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}

                      {/* Error Details */}
                      {log.error && (
                        <details className="cursor-pointer mt-2">
                          <summary className="text-xs text-red-400 hover:text-red-300">
                            Détails de l'erreur
                          </summary>
                          <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-600/30">
                            <p className="text-sm text-red-400 mb-1">{log.error.message}</p>
                            {log.error.stack && (
                              <pre className="text-xs text-gray-400 overflow-x-auto">
                                {log.error.stack}
                              </pre>
                            )}
                          </div>
                        </details>
                      )}

                      {/* Stack Info */}
                      {log.stackInfo && (
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {log.stackInfo.file}:{log.stackInfo.line}:{log.stackInfo.column}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-8 max-w-md w-full border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Exporter les logs
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => exportLogs('json')}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium flex items-center justify-between"
                >
                  <span>Export JSON</span>
                  <span className="text-gray-400">📄</span>
                </button>
                
                <button
                  onClick={() => exportLogs('csv')}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium flex items-center justify-between"
                >
                  <span>Export CSV</span>
                  <span className="text-gray-400">📊</span>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-6 p-3 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}