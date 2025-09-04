'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function Sidebar({ activeTab, setActiveTab, tabs, moduleIcon, moduleName, isCollapsed, setIsCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const [collapsedState, setCollapsedState] = useState(false);
  const collapsed = isCollapsed !== undefined ? isCollapsed : collapsedState;
  const setCollapsed = setIsCollapsed || setCollapsedState;
  const [credits, setCredits] = useState(10000);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Simulate credit consumption
  useEffect(() => {
    const interval = setInterval(() => {
      setCredits(prev => Math.max(0, prev - Math.floor(Math.random() * 10)));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDemoMode = pathname.includes('/demo');
  const basePath = isDemoMode ? '/app/demo' : '/app';

  // Ne garder que les tabs dans navigationItems (sans Hub Principal)
  const navigationItems = tabs.map(tab => ({
    ...tab,
    highlight: 'from-purple-600 to-emerald-600'
  }));

  // Quick access modules (épinglés) - inclut Hub Principal
  const quickAccessModules = [
    { id: 'hub-main', name: locale === 'fr' ? 'Hub Principal' : 'Main Hub', icon: '🏠', path: basePath },
    { id: 'ads-master', name: 'Ads Master', icon: '🚀', path: `${basePath.replace('/demo', '')}/ads-master` },
    { id: 'hubcrm', name: 'HubCRM', icon: '💎', path: `${basePath.replace('/demo', '')}/hubcrm` },
    { id: 'leadwarm', name: 'LeadWarm', icon: '🔥', path: `${basePath.replace('/demo', '')}/leadwarm` },
    { id: 'fidalyz', name: 'Fidalyz', icon: '🎁', path: `${basePath.replace('/demo', '')}/fidalyz` }
  ];
  
  // Déterminer le module actuel depuis le pathname
  const currentModuleId = pathname.split('/').pop();

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-20' : 'w-72'} bg-black/40 backdrop-blur-2xl border-r border-white/10 z-50 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <motion.div 
                className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-emerald-600 flex items-center justify-center shadow-xl">
                  <span className="text-2xl">{moduleIcon}</span>
                </div>
                {!collapsed && (
                  <div>
                    <h2 className="text-white font-bold text-lg">{moduleName}</h2>
                    <p className="text-white/40 text-xs">DigiFlow Hub</p>
                  </div>
                )}
              </motion.div>
              
              {!collapsed && (
                <motion.button
                  onClick={() => setCollapsed(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Module Navigation */}
            <div className="space-y-2 mb-6">
            {navigationItems.map((item, index) => {
              const isActive = item.path ? pathname === item.path : activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.path) {
                      router.push(item.path);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-purple-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-emerald-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <span className={`text-xl ${collapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                        {item.name || item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>
              );
            })}
            </div>

            {/* Quick Access Section */}
            {!collapsed && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 px-4">
                  {locale === 'fr' ? 'Accès Rapides' : 'Quick Access'}
                </h3>
                <div className="space-y-2">
                  {quickAccessModules.filter(m => {
                    // Ne pas afficher le module actuel dans les accès rapides
                    return m.id !== currentModuleId;
                  }).map(module => (
                    <motion.button
                      key={module.id}
                      onClick={() => router.push(module.path)}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <span className="text-lg">{module.icon}</span>
                      <span className="text-white/60 text-sm">{module.name}</span>
                      <span className="ml-auto text-white/30">→</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 space-y-3 border-t border-white/10">
            {/* Credits Display */}
            <motion.div
              whileHover={{ scale: collapsed ? 1 : 1.02 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/10 to-emerald-600/10 border border-purple-500/20 ${
                collapsed ? 'p-2' : 'p-3'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-emerald-600/5 animate-pulse" />
              <div className="relative">
                {!collapsed ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                        {locale === 'fr' ? 'Crédits IA' : 'AI Credits'}
                      </span>
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-sm"
                      >
                        ⚡
                      </motion.span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                        {credits.toLocaleString()}
                      </span>
                      <span className="text-white/40 text-xs mb-0.5">/ 10,000</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-1">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-lg mb-1"
                    >
                      ⚡
                    </motion.span>
                    <span className="text-xs font-bold text-white">
                      {(credits / 1000).toFixed(1)}k
                    </span>
                  </div>
                )}
                {!collapsed && (
                  <div className="mt-1">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                        style={{ width: `${(credits / 10000) * 100}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(credits / 10000) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>


            {/* User Profile */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                whileHover={{ scale: collapsed ? 1 : 1.02 }}
                className={`w-full flex items-center gap-3 ${collapsed ? 'px-2 py-2' : 'px-3 py-2'} bg-white/5 rounded-xl hover:bg-white/10 transition-all ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <div className={`${collapsed ? 'w-9 h-9' : 'w-9 h-9'} rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {isDemoMode ? 'D' : 'U'}
                  </span>
                </div>
                {!collapsed && (
                  <>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">
                        {isDemoMode ? 'Demo User' : 'John Doe'}
                      </p>
                      <p className="text-white/40 text-xs">
                        {isDemoMode ? 'Mode Démo' : 'Pro Plan'}
                      </p>
                    </div>
                    <span className="ml-auto text-white/40">⚙️</span>
                  </>
                )}
              </motion.button>

              {/* Profile Menu */}
              <AnimatePresence>
                {showProfileMenu && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => router.push(basePath + '/profile')}
                      className="w-full px-4 py-3 text-left text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center gap-3"
                    >
                      <span>👤</span>
                      <span className="text-sm">{locale === 'fr' ? 'Mon Compte' : 'My Account'}</span>
                    </button>
                    <button
                      onClick={() => router.push('/app/settings')}
                      className="w-full px-4 py-3 text-left text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center gap-3"
                    >
                      <span>⚙️</span>
                      <span className="text-sm">{locale === 'fr' ? 'Paramètres' : 'Settings'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isDemoMode) {
                          sessionStorage.removeItem('demoSession');
                        }
                        router.push('/auth/login');
                      }}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3 border-t border-white/10"
                    >
                      <span>🚪</span>
                      <span className="text-sm">{locale === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collapse Toggle Button - Plus visible */}
      {collapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(false)}
          className="fixed left-20 top-8 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-xl rounded-r-xl flex items-center justify-center text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-2xl"
        >
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </motion.button>
      )}
    </>
  );
}