import * as Icons from '@/components/icons/AppIcons';

export const DEFAULT_ACCOUNT = {
  email: "jason@behype-app.com",
  password: "Demo123",
  name: "Jason Sotoca",
  organization: {
    name: "Behype",
    id: "org_001",
    role: "owner",
    members: 1
  }
};

export const APPLICATIONS = [
  { 
    id: 'fidalyz', 
    name: 'Fidalyz', 
    description: 'Gestion intelligente des avis clients',
    Icon: Icons.FidalyzIcon,
    emoji: '⭐', 
    status: 'active',
    color: 'from-yellow-500 to-orange-500',
    path: '/app/fidalyz'
  },
  { 
    id: 'meta-ads', 
    name: 'Meta Ads AI', 
    description: 'Optimisation publicitaire IA',
    Icon: Icons.MetaAdsIcon,
    emoji: '📱', 
    status: 'locked',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 'crm', 
    name: 'CRM', 
    description: 'Relation client unifiée',
    Icon: Icons.CRMIcon,
    emoji: '👥', 
    status: 'locked',
    color: 'from-green-500 to-teal-500'
  },
  { 
    id: 'emailing', 
    name: 'Emailing', 
    description: 'Campagnes email automatisées',
    Icon: Icons.EmailingIcon,
    emoji: '📧', 
    status: 'locked',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'finance', 
    name: 'Finance Analytics', 
    description: 'Tableaux de bord financiers',
    Icon: Icons.FinanceIcon,
    emoji: '📊', 
    status: 'locked',
    color: 'from-emerald-500 to-green-500'
  },
  { 
    id: 'support', 
    name: 'Support AI', 
    description: 'Support client automatisé',
    Icon: Icons.SupportAIIcon,
    emoji: '🤖', 
    status: 'locked',
    color: 'from-red-500 to-rose-500'
  },
  { 
    id: 'facturation', 
    name: 'Facturation', 
    description: 'Gestion complète facturation',
    Icon: Icons.FacturationIcon,
    emoji: '💰', 
    status: 'locked',
    color: 'from-amber-500 to-yellow-500'
  },
  { 
    id: 'content', 
    name: 'Content Creator AI', 
    description: 'Création contenu IA',
    Icon: Icons.ContentCreatorIcon,
    emoji: '✍️', 
    status: 'locked',
    color: 'from-violet-500 to-purple-500'
  },
  { 
    id: 'seo', 
    name: 'SEO Assistant', 
    description: 'Optimisation SEO automatique',
    Icon: Icons.SEOIcon,
    emoji: '🔍', 
    status: 'locked',
    color: 'from-cyan-500 to-blue-500'
  }
];

export const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Accueil', path: '/hub' },
  { icon: '📱', label: 'Mes Applications', path: '/hub/apps' },
  { icon: '👥', label: 'Organisation', path: '/hub/organization' },
  { icon: '⚙️', label: 'Paramètres', path: '/hub/settings' },
  { icon: '🚪', label: 'Déconnexion', action: 'logout' }
];