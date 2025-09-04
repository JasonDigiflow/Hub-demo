'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [greeting, setGreeting] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);

  // Applications data with translations
  const applications = [
    {
      id: 'ads-master',
      name: t('modules.adsMaster.name'),
      version: '2.3.1',
      status: 'active',
      icon: '📊',
      description: t('modules.adsMaster.description'),
      lastUpdate: '2025-09-02',
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.campaigns')]: 42,
        [t('dashboard.stats.budget')]: '12.5k€',
        [t('dashboard.stats.roas')]: '3.8x'
      },
      performance: '+23%',
      trending: 'up'
    },
    {
      id: 'hubcrm',
      name: t('modules.hubCRM.name'),
      version: '1.8.3',
      status: 'active',
      icon: '🎯',
      description: t('modules.hubCRM.description'),
      lastUpdate: '2025-09-02',
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.contacts')]: 1423,
        [t('dashboard.stats.deals')]: 47,
        [t('dashboard.stats.revenue')]: '89k€'
      },
      performance: '+15%',
      trending: 'up'
    },
    {
      id: 'leadwarm',
      name: t('modules.leadWarm.name'),
      version: '1.5.2',
      status: 'inactive',
      icon: '🔥',
      description: t('modules.leadWarm.description'),
      lastUpdate: '2025-09-01',
      color: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 via-red-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.leads')]: 567,
        [t('dashboard.stats.converted')]: 89,
        [t('dashboard.stats.rate')]: '15.7%'
      },
      performance: '-5%',
      trending: 'down'
    },
    {
      id: 'fidalyz',
      name: t('modules.fidalyz.name'),
      version: '3.1.0',
      status: 'active',
      icon: '⭐',
      description: t('modules.fidalyz.description'),
      lastUpdate: '2025-09-02',
      color: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.reviews')]: 234,
        [t('dashboard.stats.rating')]: '4.8',
        [t('dashboard.stats.responses')]: '98%'
      },
      performance: '+8%',
      trending: 'up'
    },
    {
      id: 'socialboost',
      name: 'SocialBoost',
      version: '1.0.0',
      status: 'coming-soon',
      icon: '📱',
      description: t('modules.socialBoost.description'),
      lastUpdate: '2025-10-01',
      color: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.posts')]: '-',
        [t('dashboard.stats.engagement')]: '-',
        [t('dashboard.stats.followers')]: '-'
      },
      performance: null,
      trending: null
    },
    {
      id: 'contentai',
      name: 'ContentAI',
      version: '1.0.0',
      status: 'coming-soon',
      icon: '🤖',
      description: t('modules.contentAI.description'),
      lastUpdate: '2025-10-15',
      color: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.articles')]: '-',
        [t('dashboard.stats.quality')]: '-',
        [t('dashboard.stats.generated')]: '-'
      },
      performance: null,
      trending: null
    },
    {
      id: 'emailforge',
      name: 'EmailForge',
      version: '1.0.0',
      status: 'coming-soon',
      icon: '✉️',
      description: t('modules.emailForge.description'),
      lastUpdate: '2025-11-01',
      color: 'from-rose-500 to-pink-500',
      bgGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.emails')]: '-',
        [t('dashboard.stats.openRate')]: '-',
        [t('dashboard.stats.clicks')]: '-'
      },
      performance: null,
      trending: null
    },
    {
      id: 'datalytics',
      name: 'Datalytics',
      version: '1.0.0',
      status: 'coming-soon',
      icon: '📈',
      description: t('modules.datalytics.description'),
      lastUpdate: '2025-11-15',
      color: 'from-amber-500 to-yellow-500',
      bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      stats: {
        [t('dashboard.stats.reports')]: '-',
        [t('dashboard.stats.insights')]: '-',
        [t('dashboard.stats.accuracy')]: '-'
      },
      performance: null,
      trending: null
    }
  ];

  // Release notes
  const releaseNotes = [
    {
      id: 1,
      date: '2025-09-02',
      version: 'v4.1.0',
      type: 'major',
      title: t('dashboard.releaseNotes.v410.title'),
      changes: t('dashboard.releaseNotes.v410.changes'),
      icon: '🚀'
    },
    {
      id: 2,
      date: '2025-08-28',
      version: 'v4.0.5',
      type: 'patch',
      title: t('dashboard.releaseNotes.v405.title'),
      changes: t('dashboard.releaseNotes.v405.changes'),
      icon: '🔧'
    },
    {
      id: 3,
      date: '2025-08-20',
      version: 'v4.0.0',
      type: 'minor',
      title: t('dashboard.releaseNotes.v400.title'),
      changes: t('dashboard.releaseNotes.v400.changes'),
      icon: '✨'
    }
  ];

  // Quick actions
  const quickActions = [
    { icon: '🚀', label: t('dashboard.quickActions.newCampaign'), color: 'from-purple-500 to-pink-500' },
    { icon: '📊', label: t('dashboard.quickActions.viewAnalytics'), color: 'from-blue-500 to-cyan-500' },
    { icon: '👥', label: t('dashboard.quickActions.manageTeam'), color: 'from-green-500 to-emerald-500' },
    { icon: '⚙️', label: t('dashboard.quickActions.settings'), color: 'from-orange-500 to-red-500' }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t('dashboard.greetings.morning'));
    } else if (hour < 18) {
      setGreeting(t('dashboard.greetings.afternoon'));
    } else {
      setGreeting(t('dashboard.greetings.evening'));
    }
  }, [locale, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-6"
      >
        {/* Welcome Section with animated text */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl" />
          <div className="relative">
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {greeting}, {user?.displayName?.split(' ')[0] || 'User'} 
              <motion.span
                className="inline-block ml-3"
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                👋
              </motion.span>
            </motion.h1>
            <p className="text-white/60 text-lg">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: t('dashboard.credits'), 
              value: '50', 
              icon: '💎', 
              change: '+10',
              color: 'from-purple-500 to-pink-500',
              glow: 'shadow-purple-500/50'
            },
            { 
              label: t('dashboard.activeApplications'), 
              value: '3/8', 
              icon: '📱', 
              change: null,
              color: 'from-blue-500 to-cyan-500',
              glow: 'shadow-blue-500/50'
            },
            { 
              label: t('dashboard.users'), 
              value: '1', 
              icon: '👥', 
              change: null,
              color: 'from-green-500 to-emerald-500',
              glow: 'shadow-green-500/50'
            },
            { 
              label: t('dashboard.plan'), 
              value: 'Starter', 
              icon: '🚀', 
              change: null,
              color: 'from-orange-500 to-red-500',
              glow: 'shadow-orange-500/50'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              <GlassCard className={`relative p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 ${stat.glow} shadow-lg hover:shadow-xl`}>
                <div className="flex items-start justify-between mb-3">
                  <motion.span 
                    className="text-4xl"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stat.icon}
                  </motion.span>
                  {stat.change && (
                    <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-500/20 rounded-full">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            {t('dashboard.quickActions.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`} />
                <div className="relative p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300">
                  <span className="text-3xl mb-2 block">{action.icon}</span>
                  <span className="text-white/70 text-sm">{action.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Applications Grid - Enhanced Design */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              {t('dashboard.applicationsStatus')}
            </h2>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setShowReleaseNotes(!showReleaseNotes)}
            >
              {showReleaseNotes ? '📱 Applications' : '📝 Notes de version'}
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            {!showReleaseNotes ? (
              <motion.div
                key="applications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {applications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedApp(app.id === selectedApp ? null : app.id)}
                  >
                    {/* Background gradient effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.bgGradient} rounded-2xl blur-xl ${
                      app.status === 'coming-soon' ? 'opacity-20 group-hover:opacity-30' : 'opacity-50 group-hover:opacity-70'
                    } transition-opacity duration-300`} />
                    
                    <GlassCard className={`relative p-6 backdrop-blur-xl transition-all duration-300 ${
                      app.status === 'coming-soon' 
                        ? 'bg-white/3 border border-white/5 hover:border-purple-500/30 opacity-90' 
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shadow-2xl`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-3xl">{app.icon}</span>
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{app.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-white/40 text-sm">v{app.version}</span>
                              {app.trending === 'up' ? (
                                <span className="text-green-400 text-xs flex items-center gap-1">
                                  ↗ {app.performance}
                                </span>
                              ) : app.trending === 'down' ? (
                                <span className="text-red-400 text-xs flex items-center gap-1">
                                  ↘ {app.performance}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl ${
                            app.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20 shadow-lg'
                              : app.status === 'coming-soon'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-purple-500/20 shadow-lg'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            <div className="flex items-center gap-1">
                              {app.status === 'coming-soon' ? (
                                <>
                                  <span className="text-purple-400">🚀</span>
                                  {t('dashboard.comingSoon')}
                                </>
                              ) : (
                                <>
                                  <div className={`w-2 h-2 rounded-full ${app.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                  {app.status === 'active' ? t('dashboard.active') : t('dashboard.inactive')}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-white/60 text-sm mb-6 line-clamp-2">{app.description}</p>

                      {/* Stats Grid with glass effect */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {Object.entries(app.stats).map(([key, value], i) => (
                          <motion.div 
                            key={key} 
                            className="relative group/stat"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-lg blur-sm opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                            <div className="relative backdrop-blur-xl bg-white/5 rounded-lg p-3 text-center border border-white/10">
                              <p className="text-white/40 text-xs mb-1">{key}</p>
                              <p className="text-white font-bold text-lg">{value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Footer with actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <p className="text-white/40 text-xs">
                          {t('dashboard.lastUpdate')}: {new Date(app.lastUpdate).toLocaleDateString(locale)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            className="text-xs py-1 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Configure', app.id);
                            }}
                          >
                            ⚙️
                          </Button>
                          <Button
                            variant="outline"
                            className={`text-xs py-1 px-3 ${app.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={app.status === 'coming-soon'}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (app.status !== 'coming-soon') {
                                window.location.href = `/app/${app.id}`;
                              }
                            }}
                          >
                            {app.status === 'coming-soon' ? '🔒 ' + t('dashboard.comingSoon') : t('dashboard.open') + ' →'}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {selectedApp === app.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-white/10"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-white/40 mb-1">Dernière synchronisation</p>
                                <p className="text-white">Il y a 2 heures</p>
                              </div>
                              <div>
                                <p className="text-white/40 mb-1">Prochaine action</p>
                                <p className="text-white">Analyse programmée</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="release-notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {releaseNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                    
                    <GlassCard className="relative p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <motion.span 
                              className="text-3xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                            >
                              {note.icon}
                            </motion.span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-xl ${
                              note.type === 'major' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              note.type === 'minor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {note.version}
                            </span>
                            <span className="text-white/40 text-sm">
                              {new Date(note.date).toLocaleDateString(locale)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {(Array.isArray(note.changes) ? note.changes : []).map((change, i) => (
                          <motion.li 
                            key={i} 
                            className="text-white/70 text-sm flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                          >
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{change}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}