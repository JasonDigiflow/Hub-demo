import React from 'react';

// Fidalyz - Étoile avec orbite de réputation
export const FidalyzLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="20" stroke="url(#fidalyz-gradient)" strokeWidth="2" opacity="0.3"/>
    <path d="M32 16L36 28H48L38 36L42 48L32 40L22 48L26 36L16 28H28L32 16Z" fill="url(#fidalyz-gradient)"/>
    <circle cx="48" cy="20" r="4" fill="url(#fidalyz-gradient)" opacity="0.8"/>
    <circle cx="16" cy="44" r="3" fill="url(#fidalyz-gradient)" opacity="0.6"/>
    <defs>
      <linearGradient id="fidalyz-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#FCD34D"/>
      </linearGradient>
    </defs>
  </svg>
);

// Ads Master - Cible avec graphiques
export const AdsMasterLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="24" stroke="url(#ads-gradient)" strokeWidth="2" opacity="0.3"/>
    <circle cx="32" cy="32" r="18" stroke="url(#ads-gradient)" strokeWidth="2" opacity="0.5"/>
    <circle cx="32" cy="32" r="12" stroke="url(#ads-gradient)" strokeWidth="2" opacity="0.7"/>
    <circle cx="32" cy="32" r="6" fill="url(#ads-gradient)"/>
    <path d="M48 16L52 12M52 12L56 16M52 12V24" stroke="url(#ads-gradient)" strokeWidth="2" strokeLinecap="round"/>
    <rect x="8" y="44" width="4" height="12" fill="url(#ads-gradient)" opacity="0.8"/>
    <rect x="14" y="40" width="4" height="16" fill="url(#ads-gradient)" opacity="0.8"/>
    <rect x="20" y="36" width="4" height="20" fill="url(#ads-gradient)" opacity="0.8"/>
    <defs>
      <linearGradient id="ads-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#4267B2"/>
        <stop offset="1" stopColor="#0084FF"/>
      </linearGradient>
    </defs>
  </svg>
);

// HubCRM - Hub connecté avec noeuds
export const HubCRMLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="8" fill="url(#hubcrm-gradient)"/>
    <circle cx="16" cy="16" r="5" fill="url(#hubcrm-gradient)" opacity="0.7"/>
    <circle cx="48" cy="16" r="5" fill="url(#hubcrm-gradient)" opacity="0.7"/>
    <circle cx="16" cy="48" r="5" fill="url(#hubcrm-gradient)" opacity="0.7"/>
    <circle cx="48" cy="48" r="5" fill="url(#hubcrm-gradient)" opacity="0.7"/>
    <line x1="32" y1="32" x2="16" y2="16" stroke="url(#hubcrm-gradient)" strokeWidth="2" opacity="0.5"/>
    <line x1="32" y1="32" x2="48" y2="16" stroke="url(#hubcrm-gradient)" strokeWidth="2" opacity="0.5"/>
    <line x1="32" y1="32" x2="16" y2="48" stroke="url(#hubcrm-gradient)" strokeWidth="2" opacity="0.5"/>
    <line x1="32" y1="32" x2="48" y2="48" stroke="url(#hubcrm-gradient)" strokeWidth="2" opacity="0.5"/>
    <path d="M26 32H38M32 26V38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="hubcrm-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#6366F1"/>
      </linearGradient>
    </defs>
  </svg>
);

// LeadWarm - Flamme avec ondes de chaleur
export const LeadWarmLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M32 52C40 52 46 46 46 38C46 32 42 28 40 24C38 20 36 16 32 12C28 16 26 20 24 24C22 28 18 32 18 38C18 46 24 52 32 52Z" fill="url(#leadwarm-gradient)"/>
    <path d="M32 48C36 48 39 45 39 40C39 36 37 34 36 31C35 28 34 25 32 22C30 25 29 28 28 31C27 34 25 36 25 40C25 45 28 48 32 48Z" fill="url(#leadwarm-gradient2)" opacity="0.8"/>
    <path d="M22 38C22 38 20 40 16 40M42 38C42 38 44 40 48 40" stroke="url(#leadwarm-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M24 32C24 32 22 30 18 30M40 32C40 32 42 30 46 30" stroke="url(#leadwarm-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    <defs>
      <linearGradient id="leadwarm-gradient" x1="32" y1="12" x2="32" y2="52">
        <stop stopColor="#F97316"/>
        <stop offset="1" stopColor="#EF4444"/>
      </linearGradient>
      <linearGradient id="leadwarm-gradient2" x1="32" y1="22" x2="32" y2="48">
        <stop stopColor="#FCD34D"/>
        <stop offset="1" stopColor="#F97316"/>
      </linearGradient>
    </defs>
  </svg>
);

// SEOly - Loupe avec graphique de croissance
export const SEOlyLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="28" cy="28" r="16" stroke="url(#seoly-gradient)" strokeWidth="3" fill="none"/>
    <path d="M39 39L52 52" stroke="url(#seoly-gradient)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 32L24 28L28 30L32 24L36 20" stroke="url(#seoly-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="32" r="2" fill="url(#seoly-gradient)"/>
    <circle cx="24" cy="28" r="2" fill="url(#seoly-gradient)"/>
    <circle cx="28" cy="30" r="2" fill="url(#seoly-gradient)"/>
    <circle cx="32" cy="24" r="2" fill="url(#seoly-gradient)"/>
    <circle cx="36" cy="20" r="2" fill="url(#seoly-gradient)"/>
    <defs>
      <linearGradient id="seoly-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#10B981"/>
        <stop offset="1" stopColor="#059669"/>
      </linearGradient>
    </defs>
  </svg>
);

// Supportia - Bulle de chat avec cœur
export const SupportiaLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 20C12 16 16 12 20 12H44C48 12 52 16 52 20V36C52 40 48 44 44 44H28L20 52V44H20C16 44 12 40 12 36V20Z" fill="url(#supportia-gradient)" opacity="0.9"/>
    <path d="M28 26C28 24 29 22 31 22C32 22 33 23 33 24C33 23 34 22 35 22C37 22 38 24 38 26C38 30 33 34 33 34C33 34 28 30 28 26Z" fill="white"/>
    <circle cx="20" cy="28" r="2" fill="white" opacity="0.8"/>
    <circle cx="44" cy="28" r="2" fill="white" opacity="0.8"/>
    <defs>
      <linearGradient id="supportia-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#06B6D4"/>
      </linearGradient>
    </defs>
  </svg>
);

// CashFlow - Pièces avec graphique financier
export const CashFlowLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="32" cy="44" rx="16" ry="6" fill="url(#cashflow-gradient)" opacity="0.3"/>
    <ellipse cx="32" cy="38" rx="16" ry="6" fill="url(#cashflow-gradient)" opacity="0.5"/>
    <ellipse cx="32" cy="32" rx="16" ry="6" fill="url(#cashflow-gradient)" opacity="0.7"/>
    <ellipse cx="32" cy="26" rx="16" ry="6" fill="url(#cashflow-gradient)" opacity="0.9"/>
    <ellipse cx="32" cy="20" rx="16" ry="6" fill="url(#cashflow-gradient)"/>
    <text x="32" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">€</text>
    <path d="M48 16L52 12L56 20" stroke="url(#cashflow-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="cashflow-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#EAB308"/>
        <stop offset="1" stopColor="#F97316"/>
      </linearGradient>
    </defs>
  </svg>
);

// Eden - Cerveau avec connexions neurales
export const EdenLogo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M32 48C40 48 46 42 46 36C46 32 44 28 42 26C44 24 44 20 42 18C40 16 36 16 34 16C34 14 32 12 28 12C24 12 22 14 22 16C20 16 16 16 14 18C12 20 12 24 14 26C12 28 10 32 10 36C10 42 16 48 24 48" stroke="url(#eden-gradient)" strokeWidth="2" fill="none"/>
    <path d="M26 48C26 50 28 52 32 52C36 52 38 50 38 48" stroke="url(#eden-gradient)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="22" cy="28" r="3" fill="url(#eden-gradient)" opacity="0.8"/>
    <circle cx="32" cy="32" r="3" fill="url(#eden-gradient)"/>
    <circle cx="42" cy="28" r="3" fill="url(#eden-gradient)" opacity="0.8"/>
    <circle cx="28" cy="38" r="2" fill="url(#eden-gradient)" opacity="0.6"/>
    <circle cx="36" cy="38" r="2" fill="url(#eden-gradient)" opacity="0.6"/>
    <path d="M22 28L32 32L42 28M28 38L32 32L36 38" stroke="url(#eden-gradient)" strokeWidth="1" opacity="0.5"/>
    <defs>
      <linearGradient id="eden-gradient" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#9333EA"/>
      </linearGradient>
    </defs>
  </svg>
);

// Export all logos as an object for easy access
export const AppLogos = {
  fidalyz: FidalyzLogo,
  'ads-master': AdsMasterLogo,
  hubcrm: HubCRMLogo,
  leadwarm: LeadWarmLogo,
  seoly: SEOlyLogo,
  supportia: SupportiaLogo,
  cashflow: CashFlowLogo,
  eden: EdenLogo
};

export default AppLogos;