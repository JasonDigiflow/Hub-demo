'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppLogos } from './icons/AppLogos';

export default function ApplicationCard({ app, index }) {
  const isActive = app.status === 'active';
  
  // Map app IDs to logo components
  const LogoComponent = AppLogos[app.id] || AppLogos.fidalyz;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: isActive ? 1.05 : 1.02 }}
      className="relative group"
    >
      <div className={`
        relative overflow-hidden rounded-2xl p-6 
        ${isActive ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-white/5'}
        backdrop-blur-xl border border-white/10
        ${isActive ? 'hover:border-purple-500/50' : 'hover:border-white/20'}
        transition-all duration-300
      `}>
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isActive ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30">
              Bientôt
            </span>
          )}
        </div>

        {/* Logo SVG */}
        <div className="mb-4">
          <div className="w-16 h-16 relative">
            <LogoComponent className="w-full h-full" />
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity bg-gradient-to-r ${app.color}`} />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-1">
          {app.name}
        </h3>
        <p className="text-sm text-purple-400 mb-2">
          {app.tagline}
        </p>
        <p className="text-sm text-gray-400 mb-4">
          {app.description}
        </p>

        {/* AI Agent Info */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg">
          <div className="text-sm">
            <span className="text-gray-400">Agent IA : </span>
            <span className="text-white font-medium">{app.aiName}</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {app.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
              <span className="text-xs text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {Object.entries(app.stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500">{key}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isActive ? (
          <Link href={app.path || '#'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Accéder →
            </motion.button>
          </Link>
        ) : (
          <button className="mt-4 w-full py-2 bg-white/5 rounded-lg text-gray-400 font-medium cursor-not-allowed">
            Bientôt disponible
          </button>
        )}
      </div>
    </motion.div>
  );
}