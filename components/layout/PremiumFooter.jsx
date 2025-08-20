'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PREMIUM_APPLICATIONS } from '@/lib/premiumApplications';

const FooterLink = ({ href, children }) => (
  <Link
    href={href}
    className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
  >
    {children}
  </Link>
);

const FooterSection = ({ title, links }) => (
  <div>
    <h4 className="font-semibold text-white mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          <FooterLink href={link.href}>{link.label}</FooterLink>
        </li>
      ))}
    </ul>
  </div>
);

export default function PremiumFooter() {
  const footerSections = [
    {
      title: "Produits",
      links: [
        { label: "Toutes les apps", href: "/apps" },
        { label: "Tarifs", href: "/pricing" },
        { label: "Roadmap", href: "/roadmap" },
        { label: "Changelog", href: "/changelog" }
      ]
    },
    {
      title: "Ressources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "API", href: "/api" },
        { label: "Blog", href: "/blog" },
        { label: "Guides", href: "/guides" }
      ]
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/about" },
        { label: "Carrières", href: "/careers" },
        { label: "Partenaires", href: "/partners" },
        { label: "Presse", href: "/press" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Contact", href: "/contact" },
        { label: "Status", href: "/status" },
        { label: "Communauté", href: "/community" }
      ]
    }
  ];

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      {/* Animated wave background */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-64"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="url(#wave-gradient)"
            fillOpacity="0.3"
            animate={{
              d: [
                "M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,154.7C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,186.7C96,181,192,171,288,154.7C384,139,480,117,576,128C672,139,768,181,864,186.7C960,192,1056,171,1152,149.3C1248,128,1344,107,1392,96L1440,85L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,154.7C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-3xl font-bold gradient-text mb-2">DigiFlow</h3>
              <p className="text-white/60 text-sm">
                La plateforme tout-en-un pour automatiser et scaler votre business avec l'IA
              </p>
            </div>
            
            {/* Social links */}
            <div className="flex gap-4 mb-6">
              {['twitter', 'linkedin', 'github', 'discord'].map((social) => (
                <motion.a
                  key={social}
                  href={`#${social}`}
                  className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm">
                    {social === 'twitter' && '𝕏'}
                    {social === 'linkedin' && 'in'}
                    {social === 'github' && 'gh'}
                    {social === 'discord' && 'dc'}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-sm text-white/80 mb-3">Restez informé des nouveautés</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <FooterSection key={index} {...section} />
          ))}
        </div>

        {/* Apps showcase */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {PREMIUM_APPLICATIONS.map((app) => (
              <motion.div
                key={app.id}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <span>{app.icon}</span>
                <span className="text-white/70">{app.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              <FooterLink href="/privacy">Confidentialité</FooterLink>
              <FooterLink href="/terms">CGU</FooterLink>
              <FooterLink href="/cookies">Cookies</FooterLink>
              <FooterLink href="/legal">Mentions légales</FooterLink>
            </div>
            
            <div className="text-sm text-white/60">
              © 2024 DigiFlow. Tous droits réservés. Made with 💜 in Paris
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => {
            // Use fixed positions based on index to avoid hydration issues
            const positions = [
              { left: '10%', top: '20%' },
              { left: '25%', top: '40%' },
              { left: '40%', top: '15%' },
              { left: '55%', top: '60%' },
              { left: '70%', top: '30%' },
              { left: '85%', top: '50%' },
              { left: '15%', top: '70%' },
              { left: '30%', top: '85%' },
              { left: '60%', top: '80%' },
              { left: '90%', top: '10%' }
            ];
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                style={positions[i]}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            );
          })}
        </div>
      </div>
    </footer>
  );
}