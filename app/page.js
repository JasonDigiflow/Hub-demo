'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
      }} />

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-between p-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              DigiFlow <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hub</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/app/demo">
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-white hover:from-purple-600/30 hover:to-blue-600/30 transition-all">
                Mode Démo
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
                Connexion
              </button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6"
              >
                <span className="text-green-400">●</span>
                <span className="text-sm text-white/70 font-medium">Plateforme tout-en-un de marketing digital</span>
              </motion.div>

              <h2 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="text-white">L'IA qui </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  automatise
                </span>
                <br />
                <span className="text-white">votre </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  marketing digital
                </span>
              </h2>
              
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                4 modules intelligents qui travaillent 24/7 pour optimiser chaque aspect de votre marketing. 
                De l'acquisition à la fidélisation, DigiFlow Hub gère tout.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/app/demo">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-4 rounded-full shadow-lg shadow-purple-500/25 text-white"
                  >
                    Essayer la démo
                  </motion.button>
                </Link>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-lg px-8 py-4 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    Créer un compte
                  </motion.button>
                </Link>
              </div>

              {/* Modules Grid */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  { icon: '🔥', name: 'LeadWarm', desc: 'IA conversationnelle multi-canal', color: 'from-orange-600 to-red-600' },
                  { icon: '💎', name: 'HubCRM', desc: 'Gestion relation client', color: 'from-blue-600 to-purple-600' },
                  { icon: '🚀', name: 'Ads Master', desc: 'Centralisation publicitaire', color: 'from-purple-600 to-pink-600' },
                  { icon: '🎁', name: 'Fidalyz', desc: 'Gestion e-réputation', color: 'from-yellow-600 to-orange-600' }
                ].map((module, index) => (
                  <motion.div
                    key={module.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto`}>
                      {module.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{module.name}</h3>
                    <p className="text-white/60 text-sm">{module.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-12 flex flex-wrap justify-center items-center gap-4"
              >
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-white/80 font-medium">4.9/5</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80 font-medium">100% No-Code</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-blue-400">🔒</span>
                  <span className="text-white/80 font-medium">RGPD Compliant</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}