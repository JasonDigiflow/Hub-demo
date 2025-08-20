'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import PremiumFooter from '@/components/layout/PremiumFooter';
import AnimatedChatbot from '@/components/chat/AnimatedChatbot';
import { PREMIUM_APPLICATIONS } from '@/lib/premiumApplications';

const HeroSphere = dynamic(() => import('@/components/three/HeroSphere'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
});

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
      }} />

      {/* Hero Section with 3D Sphere as background */}
      <div className="relative min-h-screen">
        {/* 3D Sphere in background */}
        <HeroSphere />

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
            <Link href="/auth/login">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Commencer</Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
              >
                <span className="text-green-400">●</span>
                <span className="text-sm text-white/70 font-medium">+15,000 entreprises nous font confiance</span>
              </motion.div>

              <h2 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="text-white">L'IA qui </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  automatise
                </span>
                <br />
                <span className="text-white">et fait </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  scaler
                </span>
                <span className="text-white"> votre business</span>
              </h2>
              
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                8 applications intelligentes qui travaillent 24/7 pour optimiser chaque aspect de votre entreprise. 
                De la réputation au cash-flow, DigiFlow gère tout.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gradient text-lg px-8 py-4 rounded-full shadow-lg shadow-purple-500/25"
                  >
                    Essai gratuit 14 jours
                  </motion.button>
                </Link>
                <Link href="/demo/fidalyz">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-card text-lg px-8 py-4 rounded-full text-white hover:bg-white/10 transition-colors"
                  >
                    Voir la démo Fidalyz
                  </motion.button>
                </Link>
              </div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 flex flex-wrap justify-center items-center gap-4"
              >
                <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-white/80 font-medium">4.9/5 (2,847 avis)</span>
                </div>
                <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80 font-medium">SOC 2 Type II</span>
                </div>
                <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-blue-400">🔒</span>
                  <span className="text-white/80 font-medium">RGPD Compliant</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Premium Applications Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="py-20"
            >
              <div className="text-center mb-16">
                <h3 className="text-4xl font-bold mb-4 text-white">
                  8 Applications <span className="gradient-text">Puissantes</span>
                </h3>
                <p className="text-xl text-white/70">
                  Chaque app est un expert IA spécialisé dans son domaine
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PREMIUM_APPLICATIONS.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: app.gradient }}
                      >
                        {app.icon}
                      </div>
                      {app.status === 'active' ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-white/10 text-white/40 text-xs rounded-full">Soon</span>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-1">{app.name}</h4>
                    <p className="text-sm text-purple-400 mb-3">{app.tagline}</p>
                    <p className="text-sm text-white/60 mb-4">{app.description}</p>
                    
                    <div className="space-y-2">
                      {app.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                          <span className="text-purple-400">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {app.stats && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs">
                        {Object.entries(app.stats).slice(0, 2).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-white/50">{key}: </span>
                            <span className="text-white font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Integration Ecosystem */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="py-20 text-center"
            >
              <h3 className="text-3xl font-bold mb-12 text-white">
                Connecté à votre <span className="gradient-text">écosystème</span>
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {['Stripe', 'Shopify', 'WordPress', 'Slack', 'Google', 'Meta', 'Zapier', 'HubSpot'].map((integration) => (
                  <motion.div
                    key={integration}
                    whileHover={{ scale: 1.1 }}
                    className="glass-card px-6 py-3 rounded-full text-white/70 text-sm"
                  >
                    {integration}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA */}
        <section className="py-20 lg:py-32 relative">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="gradient-border text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Prêt à passer en </span>
                <span className="gradient-text">mode automatique</span>
                <span className="text-white"> ?</span>
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Rejoignez les leaders qui ont déjà automatisé leur croissance avec DigiFlow
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-gradient text-lg px-8 py-4 rounded-full shadow-lg shadow-purple-500/25"
                >
                  Démarrer l'essai gratuit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card text-lg px-8 py-4 rounded-full text-white hover:bg-white/10 transition-colors"
                >
                  Planifier une démo
                </motion.button>
              </div>
              
              <p className="text-sm text-white/50">
                ✓ Sans carte bancaire • ✓ 14 jours gratuits • ✓ Onboarding personnalisé
              </p>
            </motion.div>
          </div>
        </section>

        {/* Premium Footer */}
        <PremiumFooter />
      </main>

      {/* Animated Chatbot */}
      <AnimatedChatbot />
    </div>
  );
}