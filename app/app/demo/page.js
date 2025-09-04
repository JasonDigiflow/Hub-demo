'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function DemoDashboard() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [selectedModule, setSelectedModule] = useState(null);
  const [demoUser, setDemoUser] = useState(null);
  const [aiGreeting, setAiGreeting] = useState('');
  const [stats, setStats] = useState({
    hubcrm: { contacts: 1247, deals: 48, revenue: '€234,567' },
    adsMaster: { campaigns: 12, spend: '€4,567', roas: '4.2x' },
    leadWarm: { emails: 3456, warmupScore: 92, reputation: 'Excellent' },
    fidalyz: { customers: 892, loyaltyPoints: 45678, retention: '87%' }
  });

  const modules = [
    {
      id: 'hubcrm',
      name: 'HubCRM',
      icon: '🎯',
      description: 'Manage your customer relationships',
      color: 'from-green-500 to-emerald-500',
      path: '/app/demo/hubcrm',
      metrics: [
        { label: 'Contacts', value: stats.hubcrm.contacts, trend: '+12%' },
        { label: 'Active Deals', value: stats.hubcrm.deals, trend: '+23%' },
        { label: 'Revenue', value: stats.hubcrm.revenue, trend: '+18%' }
      ]
    },
    {
      id: 'ads-master',
      name: 'Ads Master',
      icon: '📊',
      description: 'Optimize your advertising campaigns',
      color: 'from-purple-500 to-blue-500',
      path: '/app/demo/ads-master',
      metrics: [
        { label: 'Campaigns', value: stats.adsMaster.campaigns, trend: '+5%' },
        { label: 'Ad Spend', value: stats.adsMaster.spend, trend: '-8%' },
        { label: 'ROAS', value: stats.adsMaster.roas, trend: '+15%' }
      ]
    },
    {
      id: 'leadwarm',
      name: 'LeadWarm',
      icon: '📧',
      description: 'Warm up your email accounts',
      color: 'from-orange-500 to-red-500',
      path: '/app/demo/leadwarm',
      metrics: [
        { label: 'Emails Sent', value: stats.leadWarm.emails, trend: '+34%' },
        { label: 'Warmup Score', value: `${stats.leadWarm.warmupScore}%`, trend: '+7%' },
        { label: 'Reputation', value: stats.leadWarm.reputation, trend: '✅' }
      ]
    },
    {
      id: 'fidalyz',
      name: 'Fidalyz',
      icon: '💎',
      description: 'Build customer loyalty',
      color: 'from-pink-500 to-purple-500',
      path: '/app/demo/fidalyz',
      metrics: [
        { label: 'Customers', value: stats.fidalyz.customers, trend: '+21%' },
        { label: 'Points Issued', value: stats.fidalyz.loyaltyPoints, trend: '+45%' },
        { label: 'Retention', value: stats.fidalyz.retention, trend: '+3%' }
      ]
    }
  ];

  useEffect(() => {
    // Check demo session
    const session = sessionStorage.getItem('demoSession');
    if (!session) {
      router.push('/auth/demo');
      return;
    }

    const userData = JSON.parse(session);
    setDemoUser(userData);

    // Generate AI greeting
    generateAIGreeting();

    // Simulate real-time stats updates
    const interval = setInterval(() => {
      updateRandomStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateAIGreeting = async () => {
    try {
      const response = await fetch('/api/demo/ai-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: new Date().getHours() })
      });

      const data = await response.json();
      if (data.greeting) {
        setAiGreeting(data.greeting);
      }
    } catch (error) {
      setAiGreeting("Welcome to your demo dashboard! 🚀 Explore our powerful modules and see what DigiFlow Hub can do for your business.");
    }
  };

  const updateRandomStats = () => {
    setStats(prev => ({
      hubcrm: {
        ...prev.hubcrm,
        contacts: prev.hubcrm.contacts + Math.floor(Math.random() * 5),
        deals: prev.hubcrm.deals + (Math.random() > 0.7 ? 1 : 0)
      },
      adsMaster: {
        ...prev.adsMaster,
        spend: `€${(parseFloat(prev.adsMaster.spend.replace('€', '').replace(',', '')) + Math.random() * 50).toLocaleString()}`
      },
      leadWarm: {
        ...prev.leadWarm,
        emails: prev.leadWarm.emails + Math.floor(Math.random() * 10)
      },
      fidalyz: {
        ...prev.fidalyz,
        loyaltyPoints: prev.fidalyz.loyaltyPoints + Math.floor(Math.random() * 100)
      }
    }));
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setTimeout(() => {
      router.push(module.path);
    }, 300);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('demoSession');
    router.push('/auth/demo');
  };

  return (
    <div className="min-h-screen relative p-6">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <span className="text-4xl">🚀</span>
                {t('demo.dashboard.title')}
              </h1>
              <p className="text-white/60 mt-1">{t('demo.dashboard.welcome')}, {demoUser?.name || 'Demo User'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/40 text-xs">{t('demo.dashboard.demoMode')}</p>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {t('demo.dashboard.liveSimulation')}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sm"
              >
                {t('demo.dashboard.exitDemo')}
              </Button>
            </div>
          </div>

          {/* AI Greeting */}
          {aiGreeting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <p className="text-white/80 text-sm leading-relaxed">{aiGreeting}</p>
                  <p className="text-white/40 text-xs mt-1">AI Assistant • Powered by Claude</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Contacts', value: '1,247', icon: '👥', color: 'from-green-500 to-emerald-500' },
            { label: 'Active Campaigns', value: '12', icon: '📊', color: 'from-purple-500 to-blue-500' },
            { label: 'Emails Sent', value: '3,456', icon: '📧', color: 'from-orange-500 to-red-500' },
            { label: 'Loyalty Points', value: '45.6K', icon: '💎', color: 'from-pink-500 to-purple-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center opacity-80`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleModuleClick(module)}
              className="cursor-pointer"
            >
              <GlassCard className="p-6 hover:border-white/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-3xl">{module.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{module.name}</h3>
                      <p className="text-white/60 text-sm">{module.description}</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    className="text-white/40"
                  >
                    →
                  </motion.div>
                </div>

                {/* Module Metrics */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {module.metrics.map((metric, i) => (
                    <div key={i} className="text-center">
                      <p className="text-white/40 text-xs mb-1">{metric.label}</p>
                      <p className="text-white font-semibold">{metric.value}</p>
                      <p className={`text-xs mt-1 ${
                        metric.trend.includes('+') ? 'text-green-400' : 
                        metric.trend.includes('-') ? 'text-red-400' : 
                        'text-green-400'
                      }`}>
                        {metric.trend}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Live indicator */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Click to explore</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-green-400 text-xs">Live Demo</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-white/40 text-sm"
        >
          <p>This is a demo environment with simulated data • All changes are temporary</p>
        </motion.div>
      </div>
    </div>
  );
}