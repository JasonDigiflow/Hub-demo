export const mockReviews = [
  {
    id: 1,
    platform: 'Google',
    author: 'Sophie Martin',
    avatar: '👤',
    rating: 5,
    date: '2024-01-20',
    text: 'Service exceptionnel, je recommande vivement !',
    response: null,
    status: 'pending'
  },
  {
    id: 2,
    platform: 'TripAdvisor',
    author: 'Jean Dupont',
    avatar: '👤',
    rating: 4,
    date: '2024-01-19',
    text: 'Très bon accueil, quelques points à améliorer.',
    response: 'Merci pour votre retour constructif. Nous prenons note de vos suggestions.',
    status: 'responded'
  },
  {
    id: 3,
    platform: 'Facebook',
    author: 'Marie Leblanc',
    avatar: '👤',
    rating: 5,
    date: '2024-01-18',
    text: 'Parfait ! L\'équipe est très professionnelle.',
    response: null,
    status: 'pending'
  },
  {
    id: 4,
    platform: 'Google',
    author: 'Pierre Bernard',
    avatar: '👤',
    rating: 3,
    date: '2024-01-17',
    text: 'Service correct mais temps d\'attente un peu long.',
    response: 'Nous vous prions de nous excuser pour l\'attente.',
    status: 'responded'
  },
  {
    id: 5,
    platform: 'TripAdvisor',
    author: 'Lucie Moreau',
    avatar: '👤',
    rating: 5,
    date: '2024-01-16',
    text: 'Une expérience incroyable, je reviendrai !',
    response: null,
    status: 'pending'
  },
  {
    id: 6,
    platform: 'Facebook',
    author: 'Thomas Petit',
    avatar: '👤',
    rating: 4,
    date: '2024-01-15',
    text: 'Très satisfait dans l\'ensemble.',
    response: 'Merci beaucoup pour votre avis positif !',
    status: 'responded'
  },
  {
    id: 7,
    platform: 'Google',
    author: 'Emma Rousseau',
    avatar: '👤',
    rating: 5,
    date: '2024-01-14',
    text: 'Excellent service, personnel très aimable.',
    response: null,
    status: 'pending'
  },
  {
    id: 8,
    platform: 'TripAdvisor',
    author: 'Lucas Simon',
    avatar: '👤',
    rating: 4,
    date: '2024-01-13',
    text: 'Bonne expérience, je recommande.',
    response: 'Nous sommes ravis que vous ayez apprécié !',
    status: 'responded'
  },
  {
    id: 9,
    platform: 'Facebook',
    author: 'Chloé Michel',
    avatar: '👤',
    rating: 5,
    date: '2024-01-12',
    text: 'Top ! Rien à redire.',
    response: null,
    status: 'pending'
  },
  {
    id: 10,
    platform: 'Google',
    author: 'Antoine Girard',
    avatar: '👤',
    rating: 4,
    date: '2024-01-11',
    text: 'Service de qualité, prix raisonnables.',
    response: 'Merci pour votre confiance !',
    status: 'responded'
  }
];

export const mockStats = {
  totalReviews: 342,
  averageRating: 4.7,
  responseRate: 89,
  satisfaction: 94,
  monthlyGrowth: 12,
  platformsConnected: 3
};

export const chartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [{
    label: 'Avis reçus',
    data: [45, 52, 48, 61, 58, 63],
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    tension: 0.4
  }]
};

export const zoeResponses = [
  {
    trigger: 'bonjour',
    response: 'Bonjour ! Je suis Zoë, votre assistante IA pour la gestion des avis. Comment puis-je vous aider aujourd\'hui ?'
  },
  {
    trigger: 'aide réponse',
    response: 'Je peux vous aider à rédiger des réponses personnalisées pour vos avis. Quel avis souhaitez-vous traiter ?'
  },
  {
    trigger: 'statistiques',
    response: 'Vous avez actuellement 342 avis avec une note moyenne de 4.7/5. Votre taux de réponse est de 89%.'
  },
  {
    trigger: 'améliorer',
    response: 'Pour améliorer votre réputation, je recommande : 1) Répondre à tous les avis sous 24h, 2) Personnaliser chaque réponse, 3) Remercier pour les avis positifs.'
  },
  {
    trigger: 'default',
    response: 'Je comprends votre demande. Laissez-moi analyser cela pour vous proposer la meilleure solution.'
  }
];

export const organizationData = {
  name: "Behype",
  id: "org_001",
  owner: "Jason Sotoca",
  members: [
    { id: 1, name: "Jason Sotoca", email: "jason@behype-app.com", role: "owner", status: "active" }
  ],
  inviteCode: "BHY123",
  createdAt: "2024-01-01",
  plan: "Premium"
};