'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // Déterminer si on est sur un module avec sidebar
  const modulesWithSidebar = ['ads-master', 'hubcrm', 'leadwarm', 'fidalyz'];
  const isModuleWithSidebar = modulesWithSidebar.some(module => pathname?.includes(module));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
      {/* Header - Caché sur les modules avec sidebar */}
      {!isModuleWithSidebar && (
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/app/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                DigiFlow <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hub</span>
              </h1>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Credits */}
              <div className="px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
                <span className="text-white/60 text-sm">{t('dashboard.credits')}:</span>
                <span className="text-white font-bold ml-2">50</span>
              </div>

              {/* Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
                >
                  <span className="text-white font-bold">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAccountMenu(false)}
                      />
                      
                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-white/10">
                          <p className="text-white font-semibold">{user.displayName || 'Utilisateur'}</p>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href="/app/account"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <span className="text-lg">👤</span>
                            <span className="text-white">Mon compte</span>
                          </Link>
                          
                          <Link
                            href="/app/company"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <span className="text-lg">🏢</span>
                            <span className="text-white">Paramètres d'entreprise</span>
                          </Link>
                          
                          <Link
                            href="/app/billing"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <span className="text-lg">💳</span>
                            <span className="text-white">Facturation</span>
                          </Link>
                          
                          <hr className="my-2 border-white/10" />
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-left"
                          >
                            <span className="text-lg">🚪</span>
                            <span className="text-white">{t('nav.logout')}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <main className={isModuleWithSidebar ? "" : "container mx-auto px-6 py-8"}>
        {children}
      </main>
    </div>
  );
}