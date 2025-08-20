export const FidalyzIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" 
          fill="url(#gradient-fidalyz)" stroke="white" strokeWidth="1.5"/>
    <defs>
      <linearGradient id="gradient-fidalyz" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
  </svg>
);

export const MetaAdsIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#gradient-meta)"/>
    <path d="M16 8L12 12L8 8M8 16L12 12L16 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="gradient-meta" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1877F2" />
        <stop offset="100%" stopColor="#42B3F4" />
      </linearGradient>
    </defs>
  </svg>
);

export const CRMIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="3" fill="url(#gradient-crm)"/>
    <circle cx="15" cy="7" r="3" fill="url(#gradient-crm)"/>
    <path d="M12 14C16 14 19 16 19 19V21H5V19C5 16 8 14 12 14Z" fill="url(#gradient-crm)"/>
    <defs>
      <linearGradient id="gradient-crm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
    </defs>
  </svg>
);

export const EmailingIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" fill="url(#gradient-email)"/>
    <path d="M2 7L12 13L22 7" stroke="white" strokeWidth="1.5"/>
    <defs>
      <linearGradient id="gradient-email" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
  </svg>
);

export const FinanceIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="12" width="4" height="9" fill="url(#gradient-finance)"/>
    <rect x="10" y="8" width="4" height="13" fill="url(#gradient-finance)"/>
    <rect x="17" y="4" width="4" height="17" fill="url(#gradient-finance)"/>
    <defs>
      <linearGradient id="gradient-finance" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

export const SupportAIIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="url(#gradient-support)"/>
    <circle cx="9" cy="10" r="1.5" fill="white"/>
    <circle cx="15" cy="10" r="1.5" fill="white"/>
    <path d="M8 15C8 15 10 17 12 17C14 17 16 15 16 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="gradient-support" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
  </svg>
);

export const FacturationIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="url(#gradient-facturation)"/>
    <text x="12" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">€</text>
    <defs>
      <linearGradient id="gradient-facturation" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
  </svg>
);

export const ContentCreatorIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L13 15L21 7" stroke="url(#gradient-content)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="19" cy="5" r="2" fill="url(#gradient-content)"/>
    <rect x="4" y="18" width="16" height="2" fill="url(#gradient-content)"/>
    <defs>
      <linearGradient id="gradient-content" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
    </defs>
  </svg>
);

export const SEOIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" fill="none" stroke="url(#gradient-seo)" strokeWidth="2"/>
    <path d="M15 15L20 20" stroke="url(#gradient-seo)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 10H13M10 7V13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="gradient-seo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);