'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart,
  RadialBar, ComposedChart, Scatter, ScatterChart, Treemap, Funnel, FunnelChart
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/ui/Sidebar';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function DemoFidalyz() {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({
    totalCustomers: 892,
    activeMembers: 743,
    totalPoints: 45678,
    averageCLV: 2340,
    retentionRate: 87,
    npsScore: 72,
    engagementRate: 68,
    rewardsRedeemed: 234
  });

  // Ultra-premium particles
  const [particles, setParticles] = useState([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Generate ultra-premium particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 3,
      color: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(168, 85, 247, 0.5)'
    }));
    setParticles(newParticles);

    // Live metrics simulation
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalCustomers: prev.totalCustomers + Math.floor(Math.random() * 3),
        activeMembers: prev.activeMembers + (Math.random() > 0.7 ? 1 : 0),
        totalPoints: prev.totalPoints + Math.floor(Math.random() * 100),
        averageCLV: prev.averageCLV + Math.floor(Math.random() * 10 - 5),
        retentionRate: Math.min(100, prev.retentionRate + (Math.random() - 0.3) * 0.5),
        npsScore: Math.min(100, prev.npsScore + (Math.random() - 0.3) * 0.8),
        engagementRate: Math.min(100, prev.engagementRate + (Math.random() - 0.4) * 1),
        rewardsRedeemed: prev.rewardsRedeemed + (Math.random() > 0.8 ? 1 : 0)
      }));
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 500);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Loyalty programs data
  const loyaltyPrograms = [
    {
      id: 1,
      name: locale === 'fr' ? 'Programme VIP Gold' : 'VIP Gold Program',
      members: 234,
      avgPoints: 5670,
      redemptionRate: 78,
      satisfaction: 92,
      color: '#FFD700',
      benefits: ['10% cashback', 'Priority support', 'Early access']
    },
    {
      id: 2,
      name: locale === 'fr' ? 'Programme Silver' : 'Silver Program',
      members: 456,
      avgPoints: 2340,
      redemptionRate: 65,
      satisfaction: 85,
      color: '#C0C0C0',
      benefits: ['5% cashback', 'Monthly rewards', 'Special offers']
    },
    {
      id: 3,
      name: locale === 'fr' ? 'Programme Bronze' : 'Bronze Program',
      members: 892,
      avgPoints: 890,
      redemptionRate: 52,
      satisfaction: 78,
      color: '#CD7F32',
      benefits: ['3% cashback', 'Birthday rewards', 'Member pricing']
    }
  ];

  // Customer segments
  const customerSegments = [
    { name: locale === 'fr' ? 'Champions' : 'Champions', value: 25, color: '#8B5CF6' },
    { name: locale === 'fr' ? 'Loyaux' : 'Loyals', value: 35, color: '#EC4899' },
    { name: locale === 'fr' ? 'Potentiels' : 'Potentials', value: 20, color: '#3B82F6' },
    { name: locale === 'fr' ? 'Nouveaux' : 'New', value: 15, color: '#10B981' },
    { name: locale === 'fr' ? 'À risque' : 'At Risk', value: 5, color: '#EF4444' }
  ];

  // Engagement metrics over time
  const engagementTimeline = [
    { month: 'Jan', engagement: 62, redemptions: 145, newMembers: 89 },
    { month: 'Feb', engagement: 65, redemptions: 178, newMembers: 102 },
    { month: 'Mar', engagement: 68, redemptions: 192, newMembers: 98 },
    { month: 'Apr', engagement: 71, redemptions: 210, newMembers: 115 },
    { month: 'May', engagement: 69, redemptions: 198, newMembers: 108 },
    { month: 'Jun', engagement: 73, redemptions: 225, newMembers: 125 },
    { month: 'Jul', engagement: 76, redemptions: 242, newMembers: 132 }
  ];

  // Rewards catalog
  const rewardsCatalog = [
    {
      name: locale === 'fr' ? 'Bon Réduction 20€' : '$20 Discount Voucher',
      points: 500,
      popularity: 92,
      redemptions: 1234,
      category: 'Discount'
    },
    {
      name: locale === 'fr' ? 'Livraison Gratuite' : 'Free Shipping',
      points: 200,
      popularity: 88,
      redemptions: 2341,
      category: 'Service'
    },
    {
      name: locale === 'fr' ? 'Produit Exclusif' : 'Exclusive Product',
      points: 1000,
      popularity: 76,
      redemptions: 456,
      category: 'Product'
    },
    {
      name: locale === 'fr' ? 'Accès VIP Event' : 'VIP Event Access',
      points: 2000,
      popularity: 94,
      redemptions: 123,
      category: 'Experience'
    }
  ];

  // Customer lifetime value distribution
  const clvDistribution = [
    { range: '€0-500', customers: 234, percentage: 26 },
    { range: '€500-1k', customers: 312, percentage: 35 },
    { range: '€1k-2k', customers: 198, percentage: 22 },
    { range: '€2k-5k', customers: 112, percentage: 13 },
    { range: '€5k+', customers: 36, percentage: 4 }
  ];

  const tabs = [
    { id: 'dashboard', name: locale === 'fr' ? 'Tableau de Bord' : 'Dashboard', icon: '📊' },
    { id: 'programs', name: locale === 'fr' ? 'Programmes' : 'Programs', icon: '💎' },
    { id: 'members', name: locale === 'fr' ? 'Membres' : 'Members', icon: '👥' },
    { id: 'rewards', name: locale === 'fr' ? 'Récompenses' : 'Rewards', icon: '🎁' },
    { id: 'insights', name: locale === 'fr' ? 'Insights IA' : 'AI Insights', icon: '🧠', badge: 'NEW' }
  ];

  return (
    <>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        moduleIcon="💎"
        moduleName="Fidalyz Elite"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`min-h-screen relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-72'}`}>
        {/* Ultra Premium Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-600/15 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
          
          {/* Ultra-fine grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_50%,#000_30%,transparent_80%)]" />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(800px circle at 10% 10%, rgba(236, 72, 153, 0.15), transparent 40%)',
                'radial-gradient(800px circle at 90% 90%, rgba(168, 85, 247, 0.15), transparent 40%)',
                'radial-gradient(800px circle at 10% 10%, rgba(236, 72, 153, 0.15), transparent 40%)',
              ]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Premium floating particles */}
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
                left: particle.x + '%',
                top: particle.y + '%',
                background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                boxShadow: `0 0 25px ${particle.color}`,
              }}
              animate={{
                x: [0, 40, -40, 0],
                y: [0, -40, 40, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Simplified Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">
                    {locale === 'fr' ? 'Plateforme de Fidélisation Client' : 'Customer Loyalty Platform'}
                  </p>
                  <h2 className="text-3xl font-bold text-white">
                    {tabs.find(t => t.id === activeTab)?.name || (locale === 'fr' ? 'Tableau de Bord' : 'Dashboard')}
                  </h2>
                </div>
                <motion.div 
                  className={`px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 ${pulseAnimation ? 'animate-pulse' : ''}`}
                >
                  <span className="text-pink-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-ping"></span>
                    {locale === 'fr' ? 'Programmes Actifs' : 'Programs Active'}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Ultra Premium KPI Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { 
                  label: locale === 'fr' ? 'Membres Actifs' : 'Active Members', 
                  value: liveMetrics.activeMembers.toLocaleString(), 
                  change: '+12%', 
                  icon: '👥', 
                  gradient: 'from-pink-600 to-purple-600',
                  subtitle: `${liveMetrics.totalCustomers} total`
                },
                { 
                  label: locale === 'fr' ? 'Taux Rétention' : 'Retention Rate', 
                  value: `${liveMetrics.retentionRate}%`, 
                  change: '+3.2%', 
                  icon: '🔄', 
                  gradient: 'from-blue-600 to-cyan-600',
                  subtitle: locale === 'fr' ? 'Ce mois' : 'This month'
                },
                { 
                  label: locale === 'fr' ? 'Points Émis' : 'Points Issued', 
                  value: `${(liveMetrics.totalPoints / 1000).toFixed(1)}K`, 
                  change: '+892', 
                  icon: '⭐', 
                  gradient: 'from-yellow-600 to-orange-600',
                  subtitle: locale === 'fr' ? 'Cette semaine' : 'This week'
                },
                { 
                  label: locale === 'fr' ? 'Score NPS' : 'NPS Score', 
                  value: liveMetrics.npsScore, 
                  change: '+8', 
                  icon: '💯', 
                  gradient: 'from-green-600 to-emerald-600',
                  subtitle: locale === 'fr' ? 'Excellent' : 'Excellent'
                }
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <GlassCard className="relative p-6 border-white/10 hover:border-white/20 transition-all backdrop-blur-xl bg-white/[0.02] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                         style={{ backgroundImage: `linear-gradient(135deg, ${metric.gradient.split(' ')[1]} 0%, ${metric.gradient.split(' ')[3]} 100%)` }} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-xl`}>
                          <span className="text-2xl filter drop-shadow-md">{metric.icon}</span>
                        </div>
                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                          metric.change.includes('+')
                            ? 'text-emerald-400 bg-emerald-400/10' 
                            : 'text-red-400 bg-red-400/10'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mb-1 font-semibold uppercase tracking-wider">{metric.label}</p>
                      <p className="text-4xl font-bold text-white mb-1 tracking-tight">{metric.value}</p>
                      <p className="text-white/40 text-xs font-medium">{metric.subtitle}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Engagement Timeline */}
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-2xl">📈</span>
                        {locale === 'fr' ? 'Évolution Engagement' : 'Engagement Evolution'}
                      </h3>
                      <div className="flex gap-2">
                        {['1M', '3M', '6M', '1Y'].map(period => (
                          <button
                            key={period}
                            className="px-4 py-2 text-xs rounded-lg font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={engagementTimeline}>
                        <defs>
                          <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="redemptionsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="month" stroke="#ffffff40" />
                        <YAxis yAxisId="left" stroke="#ffffff40" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(20px)'
                          }}
                          labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 4 }} />
                        <Area yAxisId="right" type="monotone" dataKey="redemptions" stroke="#A855F7" fillOpacity={1} fill="url(#redemptionsGradient)" strokeWidth={2} />
                        <Bar yAxisId="right" dataKey="newMembers" fill="#ffffff10" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Segments */}
                    <GlassCard className="p-6 backdrop-blur-xl bg-white/[0.02]">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🎯</span> {locale === 'fr' ? 'Segments Clients' : 'Customer Segments'}
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={customerSegments}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {customerSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {customerSegments.map((segment, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                            <span className="text-white/60 text-xs">{segment.name} ({segment.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* CLV Distribution */}
                    <GlassCard className="p-6 backdrop-blur-xl bg-white/[0.02]">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>💰</span> {locale === 'fr' ? 'Distribution CLV' : 'CLV Distribution'}
                      </h3>
                      <div className="space-y-4">
                        {clvDistribution.map((range, i) => (
                          <motion.div
                            key={range.range}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-white font-semibold">{range.range}</p>
                                <p className="text-white/40 text-xs">{range.customers} {locale === 'fr' ? 'clients' : 'customers'}</p>
                              </div>
                              <p className="text-white font-bold">{range.percentage}%</p>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                                style={{ width: `${range.percentage}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${range.percentage}%` }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Active Programs Overview */}
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/[0.02]">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span>💎</span> {locale === 'fr' ? 'Programmes Actifs' : 'Active Programs'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {loyaltyPrograms.map((program, i) => (
                        <motion.div
                          key={program.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="relative p-6 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                               style={{ backgroundColor: program.color }} />
                          
                          <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                   style={{ backgroundColor: `${program.color}33` }}>
                                <span className="text-2xl">💎</span>
                              </div>
                              <span className="text-2xl font-bold text-white">{program.satisfaction}%</span>
                            </div>
                            
                            <h4 className="text-white font-bold text-lg mb-2">{program.name}</h4>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/40">{locale === 'fr' ? 'Membres' : 'Members'}</span>
                                <span className="text-white">{program.members}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/40">{locale === 'fr' ? 'Points Moy.' : 'Avg. Points'}</span>
                                <span className="text-white">{program.avgPoints.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/40">{locale === 'fr' ? 'Taux Utilisation' : 'Redemption Rate'}</span>
                                <span className="text-white">{program.redemptionRate}%</span>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                              <p className="text-white/60 text-xs mb-2">{locale === 'fr' ? 'Avantages' : 'Benefits'}</p>
                              <div className="space-y-1">
                                {program.benefits.map((benefit, j) => (
                                  <p key={j} className="text-white/80 text-xs">• {benefit}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'rewards' && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span>🎁</span> {locale === 'fr' ? 'Catalogue Récompenses' : 'Rewards Catalog'}
                      </h3>
                      <Button variant="gradient" className="bg-gradient-to-r from-pink-600 to-purple-600">
                        <span className="mr-2">➕</span> {locale === 'fr' ? 'Nouvelle Récompense' : 'New Reward'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rewardsCatalog.map((reward, i) => (
                        <motion.div
                          key={reward.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                reward.category === 'Discount' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : reward.category === 'Service'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : reward.category === 'Product'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                              }`}>
                                {reward.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-white">{reward.points}</p>
                              <p className="text-white/60 text-xs">{locale === 'fr' ? 'points' : 'points'}</p>
                            </div>
                          </div>
                          
                          <h4 className="text-white font-bold text-lg mb-4">{reward.name}</h4>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/40">{locale === 'fr' ? 'Popularité' : 'Popularity'}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                       style={{ width: `${reward.popularity}%` }} />
                                </div>
                                <span className="text-white font-bold">{reward.popularity}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/40">{locale === 'fr' ? 'Échanges' : 'Redemptions'}</span>
                              <span className="text-white font-bold">{reward.redemptions.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-8 backdrop-blur-xl bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30">
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl"
                      >
                        <span className="text-5xl filter drop-shadow-lg">🧠</span>
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {locale === 'fr' ? 'Intelligence Fidélité IA' : 'AI Loyalty Intelligence'}
                      </h3>
                      <p className="text-white/60 text-lg">
                        {locale === 'fr' ? 'Recommandations personnalisées par l\'IA' : 'AI-powered personalized recommendations'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Opportunities */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          <span>💡</span> {locale === 'fr' ? 'Opportunités Détectées' : 'Detected Opportunities'}
                        </h4>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-emerald-400 font-bold">{locale === 'fr' ? 'Segment à Fort Potentiel' : 'High Potential Segment'}</p>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                              +23% CLV
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {locale === 'fr' ? 
                              '156 clients montrent des signes d\'engagement élevé. Un programme VIP personnalisé pourrait augmenter leur CLV de 23%.' : 
                              '156 customers show high engagement signals. A personalized VIP program could increase their CLV by 23%.'
                            }
                          </p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-blue-400 font-bold">{locale === 'fr' ? 'Cross-sell Optimal' : 'Optimal Cross-sell'}</p>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                              €45K/mois
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {locale === 'fr' ? 
                              'Les membres Gold achètent 3x plus quand ils reçoivent des offres bundle. Potentiel de €45K/mois supplémentaire.' : 
                              'Gold members buy 3x more with bundle offers. Potential for additional €45K/month.'
                            }
                          </p>
                        </motion.div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          <span>🎯</span> {locale === 'fr' ? 'Actions Recommandées' : 'Recommended Actions'}
                        </h4>
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-purple-400 font-bold">{locale === 'fr' ? 'Campagne Réactivation' : 'Reactivation Campaign'}</p>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                              234 clients
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {locale === 'fr' ? 
                              'Lancer une campagne de réactivation avec 50% de points bonus pour les membres inactifs depuis 60+ jours.' : 
                              'Launch reactivation campaign with 50% bonus points for members inactive for 60+ days.'
                            }
                          </p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-pink-400 font-bold">{locale === 'fr' ? 'Optimisation Rewards' : 'Rewards Optimization'}</p>
                            <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-bold">
                              +15% usage
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {locale === 'fr' ? 
                              'Réduire le seuil de points pour les 3 récompenses les plus populaires augmenterait l\'utilisation de 15%.' : 
                              'Lowering point threshold for top 3 rewards would increase usage by 15%.'
                            }
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* AI Metrics */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-4xl font-bold text-white">24</p>
                            <p className="text-white/60 text-xs font-medium">{locale === 'fr' ? 'Insights Actifs' : 'Active Insights'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-4xl font-bold text-pink-400">€89K</p>
                            <p className="text-white/60 text-xs font-medium">{locale === 'fr' ? 'Impact Potentiel' : 'Potential Impact'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-4xl font-bold text-purple-400">91%</p>
                            <p className="text-white/60 text-xs font-medium">{locale === 'fr' ? 'Précision IA' : 'AI Accuracy'}</p>
                          </div>
                        </div>
                        <Button 
                          variant="gradient" 
                          className="bg-gradient-to-r from-pink-600 to-purple-600 px-8"
                        >
                          <span className="flex items-center gap-2">
                            <span>🚀</span>
                            {locale === 'fr' ? 'Appliquer les Insights' : 'Apply Insights'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}