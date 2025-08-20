'use client';

import { motion } from 'framer-motion';
import AppCard from '@/components/apps/AppCard';
import { APPLICATIONS } from '@/lib/constants';

export default function AppsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">
          Mes <span className="gradient-text">Applications</span>
        </h1>
        <p className="text-white/70">
          Découvrez et gérez toutes vos applications DigiFlow Hub
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APPLICATIONS.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <AppCard app={app} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-12 text-center"
      >
        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            Plus d'applications <span className="gradient-text">bientôt disponibles</span>
          </h2>
          <p className="text-white/70">
            Nous travaillons constamment pour ajouter de nouvelles applications 
            qui vous aideront à optimiser votre business.
          </p>
        </div>
      </motion.div>
    </div>
  );
}