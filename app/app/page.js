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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Redirect to login if not authenticated
        router.push('/auth/login?redirect=/app');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login?redirect=/app');
    }
    setLoading(false);
  };

  const handleAppClick = (app) => {
    if (app.status === 'active') {
      router.push(app.path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-xl font-bold text-white">DigiFlow Hub</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    {user.organization || user.email}
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/hub/settings')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ⚙️
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue dans votre Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Accédez à toutes vos applications d'automatisation marketing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Applications actives</div>
            <div className="text-2xl font-bold text-white">2/8</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Automatisations</div>
            <div className="text-2xl font-bold text-white">147</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Temps économisé</div>
            <div className="text-2xl font-bold text-white">89h</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">ROI moyen</div>
            <div className="text-2xl font-bold text-white">4.2x</div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                <div className="bg-gray-900 rounded-2xl p-6 h-full">
                  {/* Status Badge */}
                  {app.status === 'coming_soon' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-500 text-xs rounded-full">
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
                        <span className="text-sm text-purple-400">Accéder →</span>
                        {app.id === 'aids' && (
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

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/app/fidalyz')}
              className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-colors"
            >
              <div className="text-blue-400 mb-2">→ Répondre aux avis</div>
              <p className="text-sm text-gray-400">12 nouveaux avis en attente</p>
            </button>
            <button
              onClick={() => router.push('/app/aids')}
              className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-colors"
            >
              <div className="text-purple-400 mb-2">→ Optimiser les pubs</div>
              <p className="text-sm text-gray-400">3 campagnes à optimiser</p>
            </button>
            <button
              onClick={() => router.push('/hub/organization')}
              className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-colors"
            >
              <div className="text-green-400 mb-2">→ Gérer l'équipe</div>
              <p className="text-sm text-gray-400">Inviter des collaborateurs</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}