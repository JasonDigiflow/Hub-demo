'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function ConnectionsCard({ isConnected, lastSync, onSync, isSyncing }) {
  const { t, locale } = useLocale();
  const [showDetails, setShowDetails] = useState(false);

  const connections = [
    {
      id: 'meta',
      name: 'Meta',
      icon: '📘',
      status: isConnected ? 'connected' : 'disconnected',
      description: 'Facebook & Instagram Ads',
      color: 'from-blue-500 to-indigo-500',
      available: true
    },
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      status: 'not-available',
      description: 'Google Ads',
      color: 'from-green-500 to-teal-500',
      available: false
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      status: 'not-available',
      description: 'TikTok Ads',
      color: 'from-pink-500 to-purple-500',
      available: false
    }
  ];

  const handleConnect = async (platform) => {
    if (platform === 'meta') {
      // Redirect to Meta OAuth
      window.location.href = '/api/ads-master/meta/auth';
    }
  };

  const handleDisconnect = async () => {
    if (confirm(t('adsMaster.confirmDisconnect'))) {
      try {
        const response = await fetch('/api/ads-master/meta/disconnect', {
          method: 'POST'
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
    }
  };

  const formatLastSync = (date) => {
    if (!date) return t('adsMaster.neverSynced');
    
    const now = new Date();
    const syncDate = new Date(date);
    const diffMinutes = Math.floor((now - syncDate) / 60000);
    
    if (diffMinutes < 1) return t('adsMaster.justNow');
    if (diffMinutes < 60) return t('adsMaster.minutesAgo', { minutes: diffMinutes });
    if (diffMinutes < 1440) return t('adsMaster.hoursAgo', { hours: Math.floor(diffMinutes / 60) });
    return t('adsMaster.daysAgo', { days: Math.floor(diffMinutes / 1440) });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🔌</span>
          {t('adsMaster.connections')}
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-white/40 hover:text-white transition-colors"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      <div className="space-y-3">
        {connections.map((connection) => (
          <motion.div
            key={connection.id}
            whileHover={{ scale: connection.available ? 1.02 : 1 }}
            className={`relative ${!connection.available ? 'opacity-50' : ''}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${connection.color} opacity-10 rounded-lg`} />
            <div className="relative p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{connection.icon}</span>
                  <div>
                    <p className="text-white font-medium">{connection.name}</p>
                    <p className="text-white/40 text-xs">{connection.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {connection.status === 'connected' ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs">{t('adsMaster.connected')}</span>
                      </div>
                      {showDetails && (
                        <button
                          onClick={handleDisconnect}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          {t('common.disconnect')}
                        </button>
                      )}
                    </>
                  ) : connection.available ? (
                    <Button
                      onClick={() => handleConnect(connection.id)}
                      variant="outline"
                      className="text-xs py-1 px-3"
                    >
                      {t('common.connect')}
                    </Button>
                  ) : (
                    <span className="text-white/20 text-xs">
                      {t('common.comingSoon')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isConnected && (
        <>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs">{t('adsMaster.lastSync')}</p>
                <p className="text-white text-sm">{formatLastSync(lastSync)}</p>
              </div>
              <Button
                onClick={onSync}
                disabled={isSyncing}
                variant="gradient"
                className="text-sm py-2 px-4"
              >
                {isSyncing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t('adsMaster.syncing')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🔄 {t('adsMaster.syncNow')}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">{t('adsMaster.cacheStatus')}</span>
                  <span className="text-white">
                    {lastSync && (new Date() - new Date(lastSync)) < 1800000 
                      ? t('adsMaster.cacheValid') 
                      : t('adsMaster.cacheExpired')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">{t('adsMaster.cacheDuration')}</span>
                  <span className="text-white">30 {t('common.minutes')}</span>
                </div>
                <Button
                  onClick={onSync}
                  variant="ghost"
                  className="w-full text-xs mt-2"
                  disabled={isSyncing}
                >
                  🔄 {t('adsMaster.forceRefresh')}
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </GlassCard>
  );
}