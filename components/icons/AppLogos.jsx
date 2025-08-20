/**
 * Logos SVG personnalisés pour chaque application DigiFlow
 * Chaque logo reflète la personnalité et la fonction de l'IA
 */

export const AppLogos = {
  // CLARK - Fidalyz (Reputation)
  clark: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="url(#clark-gradient)" opacity="0.1"/>
      <circle cx="32" cy="32" r="24" stroke="url(#clark-gradient)" strokeWidth="2"/>
      <path d="M32 20L35.5 27.5L44 28.5L38 34.5L39.5 43L32 39L24.5 43L26 34.5L20 28.5L28.5 27.5L32 20Z" 
            fill="url(#clark-gradient)" stroke="url(#clark-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="4" fill="url(#clark-gradient)"/>
      <defs>
        <linearGradient id="clark-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#FFC107"/>
          <stop offset="1" stopColor="#FF9800"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // OCTAVIA - AIDs (Ads)
  octavia: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#octavia-gradient)" opacity="0.1"/>
      <circle cx="32" cy="32" r="18" stroke="url(#octavia-gradient)" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" stroke="url(#octavia-gradient)" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="32" cy="32" r="6" fill="url(#octavia-gradient)"/>
      <path d="M32 14V20M32 44V50M14 32H20M44 32H50" stroke="url(#octavia-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="octavia-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#4267B2"/>
          <stop offset="1" stopColor="#0084FF"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // TOM - SEOly (SEO)
  tom: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="26" cy="26" r="14" stroke="url(#tom-gradient)" strokeWidth="2" fill="none"/>
      <path d="M36 36L46 46" stroke="url(#tom-gradient)" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="26" cy="26" r="8" fill="url(#tom-gradient)" opacity="0.2"/>
      <path d="M26 20V32M20 26H32" stroke="url(#tom-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="tom-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#10B981"/>
          <stop offset="1" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // OLIVE - Supportia (Support)
  olive: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="16" width="40" height="32" rx="16" fill="url(#olive-gradient)" opacity="0.15"/>
      <path d="M20 24C20 20 24 16 32 16C40 16 44 20 44 24V36C44 42 40 46 32 46C24 46 20 42 20 36V24Z" 
            stroke="url(#olive-gradient)" strokeWidth="2" fill="none"/>
      <circle cx="26" cy="28" r="2" fill="url(#olive-gradient)"/>
      <circle cx="38" cy="28" r="2" fill="url(#olive-gradient)"/>
      <path d="M26 36C26 36 28 39 32 39C36 39 38 36 38 36" 
            stroke="url(#olive-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="olive-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#8B5CF6"/>
          <stop offset="1" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // VALÉRIE - Salesia (Sales)
  valerie: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M32 12L40 20H48V44H16V20H24L32 12Z" 
            fill="url(#valerie-gradient)" opacity="0.15"/>
      <path d="M32 12L40 20H48V44H16V20H24L32 12Z" 
            stroke="url(#valerie-gradient)" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="24" y="28" width="16" height="2" fill="url(#valerie-gradient)"/>
      <rect x="24" y="34" width="12" height="2" fill="url(#valerie-gradient)" opacity="0.7"/>
      <circle cx="32" cy="20" r="3" fill="url(#valerie-gradient)"/>
      <defs>
        <linearGradient id="valerie-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#EF4444"/>
          <stop offset="1" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // LEXA - Legal
  lexa: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M32 12C32 12 20 18 20 28V36C20 46 32 52 32 52C32 52 44 46 44 36V28C44 18 32 12 32 12Z" 
            fill="url(#lexa-gradient)" opacity="0.15"/>
      <path d="M32 12C32 12 20 18 20 28V36C20 46 32 52 32 52C32 52 44 46 44 36V28C44 18 32 12 32 12Z" 
            stroke="url(#lexa-gradient)" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M20 28H44M26 28V40M38 28V40M26 34H38" 
            stroke="url(#lexa-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="lexa-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#475569"/>
          <stop offset="1" stopColor="#374151"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // ILONA - CashFlow (Finance)
  ilona: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="20" fill="url(#ilona-gradient)" opacity="0.15"/>
      <circle cx="32" cy="32" r="20" stroke="url(#ilona-gradient)" strokeWidth="2"/>
      <path d="M32 20V44M26 24C26 24 28 22 32 22C36 22 38 24 38 27C38 30 36 32 32 32C28 32 26 34 26 37C26 40 28 42 32 42C36 42 38 40 38 40" 
            stroke="url(#ilona-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="ilona-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#10B981"/>
          <stop offset="1" stopColor="#14B8A6"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // EDEN - Business Intelligence
  eden: (props) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="12" width="40" height="40" rx="8" fill="url(#eden-gradient)" opacity="0.1"/>
      <path d="M20 44L28 32L36 36L44 20" 
            stroke="url(#eden-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="44" r="3" fill="url(#eden-gradient)"/>
      <circle cx="28" cy="32" r="3" fill="url(#eden-gradient)"/>
      <circle cx="36" cy="36" r="3" fill="url(#eden-gradient)"/>
      <circle cx="44" cy="20" r="3" fill="url(#eden-gradient)"/>
      <path d="M32 12L34 18L40 18L35 22L37 28L32 24L27 28L29 22L24 18L30 18L32 12Z" 
            fill="url(#eden-gradient)" opacity="0.3"/>
      <defs>
        <linearGradient id="eden-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#6366F1"/>
          <stop offset="1" stopColor="#9333EA"/>
        </linearGradient>
      </defs>
    </svg>
  )
};

export default AppLogos;