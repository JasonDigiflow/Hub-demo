'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/login?redirect=' + pathname);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login?redirect=' + pathname);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const menuItems = [
    {
      section: 'DASHBOARD',
      items: [
        { icon: '🏠', label: 'Accueil', path: '/app', badge: null },
        { icon: '📊', label: 'Analytics', path: '/app/analytics', badge: 'NEW' }
      ]
    },
    {
      section: 'APPLICATIONS',
      items: [
        { icon: '⭐', label: 'Fidalyz', path: '/app/fidalyz', badge: null, active: true },
        { icon: '🎯', label: 'AIDs', path: '/app/aids', badge: null, active: true },
        { icon: '🔍', label: 'SEOly', path: '/app/seoly', badge: 'SOON', active: false },
        { icon: '💬', label: 'Supportia', path: '/app/supportia', badge: 'SOON', active: false },
        { icon: '💼', label: 'Salesia', path: '/app/salesia', badge: 'SOON', active: false },
        { icon: '⚖️', label: 'Lexa', path: '/app/lexa', badge: 'SOON', active: false },
        { icon: '💰', label: 'CashFlow', path: '/app/cashflow', badge: 'SOON', active: false },
        { icon: '📈', label: 'Eden', path: '/app/eden', badge: 'SOON', active: false }
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { icon: '🏢', label: 'Organisation', path: '/app/organization', badge: null },
        { icon: '👥', label: 'Équipe', path: '/app/team', badge: null },
        { icon: '⚙️', label: 'Paramètres', path: '/app/settings', badge: null },
        { icon: '💳', label: 'Facturation', path: '/app/billing', badge: null }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/app') return pathname === '/app';
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full z-40
        bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
        border-r border-white/10
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/app" className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-white">DigiFlow</h1>
                  <p className="text-xs text-gray-400">Hub Central</p>
                </div>
              </Link>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isCollapsed ? 'M13 5l7 7-7 7' : 'M11 19l-7-7 7-7'} />
                </svg>
              </button>
            </div>
          </div>

          {/* User Profile */}
          {user && !isCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-400">{user?.organizationName || 'Organisation'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                    {section.section}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    const disabled = item.active === false;
                    
                    return (
                      <li key={item.path}>
                        <Link
                          href={disabled ? '#' : item.path}
                          onClick={(e) => disabled && e.preventDefault()}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-xl
                            transition-all duration-200 relative group
                            ${active 
                              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white' 
                              : disabled
                              ? 'opacity-40 cursor-not-allowed text-gray-500'
                              : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          <span className="text-xl flex-shrink-0">{item.icon}</span>
                          <span className={`
                            font-medium transition-all duration-300
                            ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
                          `}>
                            {item.label}
                          </span>
                          {item.badge && !isCollapsed && (
                            <span className={`
                              ml-auto px-2 py-0.5 text-xs rounded-full font-medium
                              ${item.badge === 'NEW' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : item.badge === 'SOON'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                          {active && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute left-0 w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-r-full"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'items-center' : ''}`}>
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
                transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-xl">🚪</span>
              {!isCollapsed && <span className="font-medium">Déconnexion</span>}
            </button>
            
            {!isCollapsed && (
              <div className="mt-4 p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Plan actuel</span>
                  <span className="text-xs font-medium text-purple-400">PRO</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">6,500 / 10,000 crédits</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Link href="/app" className="text-gray-400 hover:text-white transition-colors">
                  DigiFlow Hub
                </Link>
                {pathname !== '/app' && (
                  <>
                    <span className="text-gray-600">/</span>
                    <span className="text-white capitalize">
                      {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
                    </span>
                  </>
                )}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-64 px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}