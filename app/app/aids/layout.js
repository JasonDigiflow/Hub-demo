'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Icônes personnalisées
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProspectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CampaignIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const InsightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const BusinessIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PagesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function AIDsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsMenuOpen(!mobile);
    };
    
    checkMobile();
    setIsInitialized(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/app/aids',
      color: 'from-purple-600 to-pink-600',
      description: 'Vue d\'ensemble et métriques'
    },
    { 
      id: 'prospects', 
      name: 'Prospects', 
      icon: <ProspectsIcon />, 
      path: '/app/aids/prospects',
      color: 'from-blue-600 to-cyan-600',
      description: 'Gestion des leads Meta'
    },
    { 
      id: 'revenues', 
      name: 'Revenues', 
      icon: <RevenueIcon />, 
      path: '/app/aids/revenues',
      color: 'from-green-600 to-emerald-600',
      description: 'Analyse des revenus'
    },
    { 
      id: 'campaigns', 
      name: 'Campagnes', 
      icon: <CampaignIcon />, 
      path: '/app/aids/app-review-complete#campaigns',
      color: 'from-orange-600 to-red-600',
      description: 'Gestion des campagnes'
    },
    { 
      id: 'insights', 
      name: 'Insights', 
      icon: <InsightIcon />, 
      path: '/app/aids/app-review-complete#insights',
      color: 'from-indigo-600 to-purple-600',
      description: 'Analytics avancés'
    },
    { 
      id: 'business', 
      name: 'Business Manager', 
      icon: <BusinessIcon />, 
      path: '/app/aids/app-review-complete#business',
      color: 'from-teal-600 to-cyan-600',
      description: 'KPIs et finances',
      highlight: true
    },
    { 
      id: 'pages', 
      name: 'Pages & Assets', 
      icon: <PagesIcon />, 
      path: '/app/aids/app-review-complete#pages',
      color: 'from-pink-600 to-rose-600',
      description: 'Gestion multi-pages',
      highlight: true
    },
    { 
      id: 'octavia', 
      name: 'Octavia AI', 
      icon: <AIIcon />, 
      path: '/app/aids/app-review-complete#ai',
      color: 'from-violet-600 to-purple-600',
      description: 'Assistant IA Claude 3.5',
      badge: 'BETA'
    }
  ];

  const handleNavigation = (path) => {
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      router.push(basePath);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      router.push(path);
    }
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path.includes('#')) {
      const [basePath] = path.split('#');
      return pathname === basePath;
    }
    return pathname === path;
  };

  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-lg border border-white/10 lg:hidden"
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Mobile Backdrop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
            )}

            {/* Menu */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`
                ${isMobile ? 'fixed' : 'relative'} 
                top-0 left-0 h-screen w-72 
                bg-gradient-to-b from-gray-900 via-gray-900 to-black
                border-r border-white/10 
                flex flex-col z-50
                shadow-2xl shadow-purple-600/10
              `}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AIDs</h2>
                    <p className="text-xs text-gray-400">Powered by Octavia AI</p>
                  </div>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <motion.div 
                className="px-6 py-4 border-b border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/20">
                    <p className="text-xs text-gray-400">ROAS</p>
                    <p className="text-lg font-bold text-white">4.2x</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-lg font-bold text-white">€48.5k</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full relative group transition-all duration-300
                        ${isActive(item.path) 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                          : 'hover:bg-white/5 text-gray-400 hover:text-white'
                        }
                        rounded-xl p-3 flex items-center gap-3
                        ${item.highlight ? 'ring-2 ring-yellow-500/30' : ''}
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 
                        ${isActive(item.path) ? 'text-white' : ''}
                      `}>
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.highlight && (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                          )}
                        </div>
                        {hoveredItem === item.id && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-gray-400 mt-0.5"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>

                      {/* Arrow for active */}
                      {isActive(item.path) && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="my-4 border-t border-white/10" />

                {/* Back Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => router.push('/app')}
                    className="w-full p-3 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <BackIcon />
                    <span className="font-medium">Retour à l'accueil</span>
                  </button>
                </motion.div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Autopilot</span>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Octavia optimise vos campagnes 24/7
                  </p>
                  <button className="mt-2 w-full px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                    Configurer
                  </button>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`
        flex-1 
        ${isMenuOpen && !isMobile ? 'ml-0' : 'ml-0'}
        ${isMobile ? 'pt-16' : ''}
        transition-all duration-300
      `}>
        {children}
      </main>
    </div>
  );
}