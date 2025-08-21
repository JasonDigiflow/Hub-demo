'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const applications = [
  {
    id: 'fidalyz',
    name: 'Fidalyz',
    description: 'Gestion intelligente des avis clients avec IA',
    icon: '⭐',
    color: 'from-blue-600 to-cyan-600',
    status: 'active',
    path: '/app/fidalyz',
    agent: 'Clark',
    features: ['Réponses automatiques', 'Analyse de sentiment', 'Dashboard analytics']
  },
  {
    id: 'aids',
    name: 'AIDs',
    description: 'Optimisation automatique des publicités Meta',
    icon: '🎯',
    color: 'from-purple-600 to-pink-600',
    status: 'active',
    path: '/app/aids',
    agent: 'Octavia',
    features: ['Gestion campagnes', 'A/B testing', 'Optimisation IA']
  },
  {
    id: 'seoly',
    name: 'SEOly',
    description: 'Référencement naturel optimisé par IA',
    icon: '🔍',
    color: 'from-green-600 to-emerald-600',
    status: 'coming_soon',
    path: '/app/seoly',
    agent: 'Tom',
    features: ['Audit SEO', 'Mots-clés', 'Optimisation contenu']
  },
  {
    id: 'supportia',
    name: 'Supportia',
    description: 'Support client automatisé 24/7',
    icon: '💬',
    color: 'from-orange-600 to-amber-600',
    status: 'coming_soon',
    path: '/app/supportia',
    agent: 'Olive',
    features: ['Chat en temps réel', 'Tickets', 'Base de connaissances']
  },
  {
    id: 'salesia',
    name: 'Salesia',
    description: 'Automatisation des ventes et CRM',
    icon: '💼',
    color: 'from-red-600 to-rose-600',
    status: 'coming_soon',
    path: '/app/salesia',
    agent: 'Valérie',
    features: ['Pipeline de ventes', 'Emails automatisés', 'Scoring leads']
  },
  {
    id: 'lexa',
    name: 'Lexa',
    description: 'Assistant juridique et contrats',
    icon: '⚖️',
    color: 'from-indigo-600 to-blue-600',
    status: 'coming_soon',
    path: '/app/lexa',
    agent: 'Lexa',
    features: ['Génération contrats', 'Conformité RGPD', 'Veille juridique']
  },
  {
    id: 'cashflow',
    name: 'CashFlow',
    description: 'Gestion financière et comptabilité',
    icon: '💰',
    color: 'from-yellow-600 to-orange-600',
    status: 'coming_soon',
    path: '/app/cashflow',
    agent: 'Ilona',
    features: ['Facturation', 'Rapports financiers', 'Prévisions']
  },
  {
    id: 'eden',
    name: 'Eden',
    description: 'Business Intelligence et analytics',
    icon: '📊',
    color: 'from-teal-600 to-cyan-600',
    status: 'coming_soon',
    path: '/app/eden',
    agent: 'Eden',
    features: ['Tableaux de bord', 'KPIs temps réel', 'Rapports personnalisés']
  }
];

export default function AppsHub() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    averageTicket: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/aids/revenues');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAppClick = (app) => {
    if (app.status === 'active') {
      router.push(app.path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-400 text-lg">
          Bienvenue dans votre hub d'automatisation marketing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Applications actives</span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-2xl font-bold text-white">2/8</div>
          <div className="text-xs text-green-400 mt-1">Fidalyz & AIDs</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Automatisations</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-2xl font-bold text-white">147</div>
          <div className="text-xs text-blue-400 mt-1">Ce mois-ci</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-6 border border-purple-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Temps économisé</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-2xl font-bold text-white">89h</div>
          <div className="text-xs text-purple-400 mt-1">Cette semaine</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">ROI moyen</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalRevenue > 0 ? '5.2x' : '4.2x'}
          </div>
          <div className="text-xs text-orange-400 mt-1">Sur 30 jours</div>
        </motion.div>
      </div>

      {/* Applications Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Vos applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleAppClick(app)}
              className={`
                relative group cursor-pointer
                ${app.status === 'active' ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}
                transition-all duration-300
              `}
            >
              <div className={`
                bg-gradient-to-br ${app.color} p-[1px] rounded-2xl
                ${app.status === 'active' ? 'shadow-lg' : ''}
              `}>
                <div className="bg-gray-900/95 backdrop-blur rounded-2xl p-6 h-full">
                  {/* Status Badge */}
                  {app.status === 'coming_soon' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full border border-yellow-600/30">
                        Bientôt
                      </span>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="text-4xl mb-4">{app.icon}</div>
                  
                  {/* Title & Agent */}
                  <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">par {app.agent}</p>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{app.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-1">
                    {app.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action */}
                  {app.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                          Accéder →
                        </span>
                        {app.id === 'aids' && stats.totalRevenue > 0 && (
                          <span className="text-xs text-green-400">LIVE</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/app/fidalyz')}
            className="bg-white/5 hover:bg-white/10 backdrop-blur rounded-xl p-4 text-left transition-all border border-white/10 hover:border-purple-500/30"
          >
            <div className="text-blue-400 mb-2 flex items-center gap-2">
              <span>⭐</span>
              <span>Répondre aux avis</span>
            </div>
            <p className="text-sm text-gray-400">12 nouveaux avis en attente</p>
          </button>
          
          <button
            onClick={() => router.push('/app/aids')}
            className="bg-white/5 hover:bg-white/10 backdrop-blur rounded-xl p-4 text-left transition-all border border-white/10 hover:border-purple-500/30"
          >
            <div className="text-purple-400 mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>Optimiser les pubs</span>
            </div>
            <p className="text-sm text-gray-400">3 campagnes à optimiser</p>
          </button>
          
          <button
            onClick={() => router.push('/app/organization')}
            className="bg-white/5 hover:bg-white/10 backdrop-blur rounded-xl p-4 text-left transition-all border border-white/10 hover:border-purple-500/30"
          >
            <div className="text-green-400 mb-2 flex items-center gap-2">
              <span>👥</span>
              <span>Gérer l'équipe</span>
            </div>
            <p className="text-sm text-gray-400">Inviter des collaborateurs</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm text-white">Nouvelle réponse générée</p>
                <p className="text-xs text-gray-400">Fidalyz - Avis Google 5 étoiles</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Il y a 5 min</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div>
                <p className="text-sm text-white">Campagne optimisée</p>
                <p className="text-xs text-gray-400">AIDs - Budget réalloué automatiquement</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Il y a 1h</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div>
                <p className="text-sm text-white">Rapport hebdomadaire généré</p>
                <p className="text-xs text-gray-400">Performance globale +15%</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Il y a 3h</span>
          </div>
        </div>
      </div>
    </div>
  );
}