'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import AppLogos from '@/components/icons/AppLogos';

export default function AIDsLayout({ children }) {
  const pathname = usePathname();
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Check if API keys are configured
  useEffect(() => {
    const checkAPIKeys = async () => {
      try {
        const response = await fetch('/api/aids/config/status');
        const data = await response.json();
        setIsLiveMode(data.isLive);
      } catch (error) {
        console.error('Error checking API status:', error);
      }
    };
    checkAPIKeys();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/app/aids', icon: '📊' },
    { name: 'Revenus', href: '/app/aids/revenues', icon: '💰' },
    { name: 'Experiments', href: '/app/aids/experiments', icon: '🧪' },
    { name: 'Creatives', href: '/app/aids/creatives', icon: '🎨' },
    { name: 'Settings', href: '/app/aids/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Name */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <AppLogos.octavia />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AIDs</h1>
                  <p className="text-xs text-blue-400">by Octavia</p>
                </div>
              </Link>
              
              {/* Mode Indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isLiveMode 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {isLiveMode ? '🟢 LIVE MODE' : '🟡 DEMO MODE'}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                🚀 Run Pipeline
              </button>
              <Link href="/app" className="text-gray-400 hover:text-white">
                ← Back to Hub
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}