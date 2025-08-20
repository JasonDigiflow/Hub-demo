'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatsCards from '@/components/fidalyz/StatsCards';
import ReviewChart from '@/components/fidalyz/ReviewChart';
import ReviewItem from '@/components/fidalyz/ReviewItem';
import { mockStats, mockReviews, chartData } from '@/lib/mockData';

export default function FidalyzDashboard() {
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('fidalyz_onboarding_completed');
    if (!onboardingCompleted) {
      router.push('/app/fidalyz/onboarding');
    } else {
      setHasSeenOnboarding(true);
    }
  }, [router]);

  const handleRespond = (review) => {
    router.push(`/app/fidalyz/reviews?respond=${review.id}`);
  };

  if (!hasSeenOnboarding) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Fidalyz</span> Dashboard
            </h1>
            <p className="text-white/70">
              Gérez et optimisez votre réputation en ligne
            </p>
          </div>
          <Link href="/app/fidalyz/zoe">
            <Button className="px-6">
              <span className="mr-2">🤖</span> Zoë AI Assistant
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <StatsCards stats={mockStats} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Évolution des avis</h2>
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm">
                <option>6 derniers mois</option>
                <option>3 derniers mois</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            <ReviewChart data={chartData} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
            <div className="space-y-3">
              <Link href="/app/fidalyz/reviews" className="block">
                <Button fullWidth variant="outline">
                  <span className="mr-2">📝</span> Voir tous les avis
                </Button>
              </Link>
              <Link href="/app/fidalyz/zoe" className="block">
                <Button fullWidth variant="outline">
                  <span className="mr-2">🤖</span> Assistant Zoë
                </Button>
              </Link>
              <Button fullWidth variant="outline">
                <span className="mr-2">📊</span> Rapport détaillé
              </Button>
              <Button fullWidth variant="outline">
                <span className="mr-2">⚙️</span> Configuration
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Derniers avis</h2>
            <Link href="/app/fidalyz/reviews">
              <Button variant="ghost" className="text-sm">
                Voir tout →
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {mockReviews.slice(0, 5).map((review) => (
              <ReviewItem 
                key={review.id} 
                review={review} 
                onRespond={handleRespond}
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}