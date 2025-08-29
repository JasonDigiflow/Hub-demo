'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AdAccountProvider } from '@/lib/contexts/AdAccountContext';
import AdAccountSelector from '@/components/aids/AdAccountSelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AIDsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [realStats, setRealStats] = useState({ roas: 0, totalRevenue: 0, totalLeads: 0 });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsMenuOpen(!mobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real stats
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        // Fetch all-time stats (90 days as a proxy for all-time)
        const response = await fetch('/api/aids/combined-insights-v2?period=last_90d');
        const data = await response.json();
        
        if (data.success && data.current) {
          setRealStats({
            roas: parseFloat(data.current.roas) || 0,
            totalRevenue: data.current.revenues || 0,
            totalLeads: data.current.leads || 0
          });
        }
      } catch (error) {
        console.error('Error fetching real stats:', error);
      }
    };

    fetchRealStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRealStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { 
      id: 'dashboard', 
      name: '🎯 Dashboard', 
      path: '/app/aids',
      gradient: 'from-purple-600 to-pink-600'
    },
    { 
      id: 'prospects', 
      name: '👥 Prospects', 
      path: '/app/aids/prospects',
      gradient: 'from-blue-600 to-cyan-600'
    },
    { 
      id: 'revenues', 
      name: '💰 Revenues', 
      path: '/app/aids/revenues',
      gradient: 'from-green-600 to-emerald-600'
    },
    { 
      id: 'campaigns', 
      name: '📊 Campagnes', 
      path: '/app/aids/campaigns',
      gradient: 'from-orange-600 to-red-600'
    },
    { 
      id: 'insights', 
      name: '📈 Insights', 
      path: '/app/aids/insights',
      gradient: 'from-indigo-600 to-purple-600'
    },
    { 
      id: 'business', 
      name: '💼 Business Manager', 
      path: '/app/aids/business',
      gradient: 'from-teal-600 to-cyan-600',
      premium: true
    },
    { 
      id: 'pages', 
      name: '📄 Pages & Assets', 
      path: '/app/aids/pages',
      gradient: 'from-pink-600 to-rose-600',
      premium: true
    },
    { 
      id: 'octavia', 
      name: '🤖 Octavia AI', 
      path: '/app/aids/octavia',
      gradient: 'from-violet-600 to-purple-600',
      badge: 'BETA'
    },
    { 
      id: 'logs', 
      name: '🔍 Logs & Diagnostics', 
      path: '/app/aids/logs',
      gradient: 'from-orange-600 to-red-600',
      badge: 'DEV'
    },
    { 
      id: 'debug-leads', 
      name: '🐛 Debug Leads', 
      path: '/app/aids/debug-leads',
      gradient: 'from-red-600 to-pink-600',
      badge: 'DEBUG'
    },
    { 
      id: 'test-tokens', 
      name: '🔑 Test Tokens', 
      path: '/app/aids/test-tokens',
      gradient: 'from-yellow-600 to-orange-600',
      badge: 'TEST'
    }
  ];

  const handleNavigation = (item) => {
    router.push(item.path);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const isActive = (item) => {
    if (item.path === '/app/aids' && pathname === '/app/aids') return true;
    if (item.path !== '/app/aids' && pathname.startsWith(item.path)) return true;
    return false;
  };

  return (
    <AdAccountProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Desktop Sidebar - Always visible */}
      <aside className={`
        hidden lg:flex flex-col
        w-72 h-screen sticky top-0
        bg-gradient-to-b from-gray-900/95 via-gray-900/95 to-black/95
        backdrop-blur-xl border-r border-white/10
        shadow-2xl shadow-purple-600/10
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">AIDs</h2>
              <p className="text-xs text-gray-400">Powered by Octavia AI</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        
        {/* Ad Account Selector */}
        <div className="px-6 py-3 border-b border-white/10">
          <AdAccountSelector />
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
              <p className="text-xs text-gray-400">ROAS ALL TIME</p>
              <p className="text-lg font-bold text-white">
                {realStats.roas > 0 ? `${realStats.roas}x` : '—'}
              </p>
            </div>
            <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
              <p className="text-xs text-gray-400">TOTAL LEADS</p>
              <p className="text-lg font-bold text-white">
                {realStats.totalLeads > 0 ? realStats.totalLeads.toLocaleString('fr-FR') : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                w-full p-3 rounded-xl flex items-center justify-between
                transition-all duration-300 group relative
                ${isActive(item) 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }
                ${item.premium ? 'ring-2 ring-yellow-500/20' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium flex items-center gap-2">
                <span className="text-xl">{item.name.split(' ')[0]}</span>
                {!isCollapsed && (
                  <>
                    <span>{item.name.split(' ').slice(1).join(' ')}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </span>
              {item.premium && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </motion.button>
          ))}

          <div className="my-4 border-t border-white/10" />

          <button
            onClick={() => router.push('/app')}
            className="w-full p-3 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isCollapsed && <span className="font-medium">Retour à l'accueil</span>}
          </button>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/10">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Autopilot</span>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-gray-400">Octavia optimise 24/7</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-900 to-black border-r border-white/10 z-50 lg:hidden"
            >
              {/* Same content as desktop but in fixed position */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AIDs</h2>
                      <p className="text-xs text-gray-400">Octavia AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Quick Stats */}
              <div className="px-6 py-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
                    <p className="text-xs text-gray-400">ROAS ALL TIME</p>
                    <p className="text-lg font-bold text-white">
                      {realStats.roas > 0 ? `${realStats.roas}x` : '—'}
                    </p>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-xs text-gray-400">TOTAL LEADS</p>
                    <p className="text-lg font-bold text-white">
                      {realStats.totalLeads > 0 ? realStats.totalLeads.toLocaleString('fr-FR') : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`
                      w-full p-3 rounded-xl flex items-center justify-between
                      transition-all duration-300
                      ${isActive(item) 
                        ? `bg-gradient-to-r ${item.gradient} text-white` 
                        : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}

                <div className="my-4 border-t border-white/10" />

                <button
                  onClick={() => router.push('/app')}
                  className="w-full p-3 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Retour</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg lg:hidden"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
    </AdAccountProvider>
  );
}