'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { APPLICATIONS } from '@/lib/constants';
import { mockStats } from '@/lib/mockData';

export default function HubDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const stats = [
    { label: 'Applications actives', value: '1', icon: '📱', color: 'from-blue-500 to-indigo-500' },
    { label: 'Avis gérés', value: mockStats.totalReviews, icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { label: 'Taux de satisfaction', value: `${mockStats.satisfaction}%`, icon: '😊', color: 'from-green-500 to-teal-500' },
    { label: 'Membres équipe', value: user?.organization?.members || 1, icon: '👥', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          Bonjour, <span className="gradient-text">{user?.name || 'Utilisateur'}</span> 👋
        </h1>
        <p className="text-white/70">
          Bienvenue sur votre tableau de bord DigiFlow Hub
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-white/70 text-sm">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
      >
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full">
            <h2 className="text-2xl font-bold mb-6">Applications récentes</h2>
            <div className="space-y-4">
              {APPLICATIONS.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                      <span className="text-xl">{app.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{app.name}</p>
                      <p className="text-sm text-white/50">{app.description}</p>
                    </div>
                  </div>
                  {app.status === 'active' ? (
                    <Link href={app.path}>
                      <Button variant="outline" className="text-sm py-2 px-4">
                        Ouvrir
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-white/30 text-sm">🔒 Bientôt</span>
                  )}
                </div>
              ))}
            </div>
            <Link href="/hub/apps">
              <Button variant="ghost" className="w-full mt-4">
                Voir toutes les applications →
              </Button>
            </Link>
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-6 h-full">
            <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
            <div className="space-y-3">
              <Link href="/app/fidalyz" className="block">
                <Button fullWidth variant="gradient">
                  <span className="mr-2">⭐</span> Gérer les avis
                </Button>
              </Link>
              <Link href="/hub/organization" className="block">
                <Button fullWidth variant="outline">
                  <span className="mr-2">👥</span> Inviter un membre
                </Button>
              </Link>
              <Link href="/hub/settings" className="block">
                <Button fullWidth variant="outline">
                  <span className="mr-2">⚙️</span> Paramètres
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <GlassCard className="p-8 text-center gradient-border">
          <h2 className="text-2xl font-bold mb-4">
            Découvrez les nouvelles fonctionnalités
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Notre assistant IA Zoë est maintenant disponible dans Fidalyz pour vous aider 
            à gérer vos avis clients de manière encore plus efficace.
          </p>
          <Link href="/app/fidalyz/zoe">
            <Button className="px-8">
              Essayer Zoë AI →
            </Button>
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}