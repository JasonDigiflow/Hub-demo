import { NextResponse } from 'next/server';

// Mock data pour les avis
const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Marie L.',
    avatar: '👩',
    rating: 5,
    date: '2024-03-15',
    source: 'Google',
    text: 'Service exceptionnel ! L\'équipe est très professionnelle et à l\'écoute. Je recommande vivement.',
    response: {
      text: 'Merci beaucoup Marie pour votre retour positif ! Nous sommes ravis que notre service vous ait satisfait.',
      date: '2024-03-16',
      aiGenerated: true
    },
    sentiment: 'positive',
    keywords: ['service', 'professionnel', 'recommande']
  },
  {
    id: '2',
    author: 'Jean D.',
    avatar: '👨',
    rating: 4,
    date: '2024-03-14',
    source: 'Google',
    text: 'Très bon service dans l\'ensemble. Petit bémol sur les délais mais le résultat est là.',
    response: null,
    sentiment: 'positive',
    keywords: ['service', 'délais', 'résultat'],
    suggestedResponse: 'Merci Jean pour votre avis ! Nous prenons note de votre remarque sur les délais et travaillons à les améliorer.'
  },
  {
    id: '3',
    author: 'Sophie M.',
    avatar: '👩‍💼',
    rating: 5,
    date: '2024-03-13',
    source: 'Facebook',
    text: 'Parfait ! Exactement ce que je cherchais. L\'équipe est réactive et professionnelle.',
    response: {
      text: 'Merci Sophie ! Votre satisfaction est notre priorité. Au plaisir de vous revoir !',
      date: '2024-03-13',
      aiGenerated: true
    },
    sentiment: 'positive',
    keywords: ['parfait', 'réactive', 'professionnelle']
  },
  {
    id: '4',
    author: 'Thomas R.',
    avatar: '👨‍💻',
    rating: 3,
    date: '2024-03-12',
    source: 'Google',
    text: 'Service correct mais peut mieux faire. Le prix est un peu élevé pour la prestation.',
    response: null,
    sentiment: 'neutral',
    keywords: ['correct', 'prix', 'prestation'],
    suggestedResponse: 'Bonjour Thomas, merci pour votre retour constructif. Nous aimerions discuter avec vous pour mieux comprendre vos attentes. N\'hésitez pas à nous contacter directement.'
  },
  {
    id: '5',
    author: 'Emma B.',
    avatar: '👩',
    rating: 5,
    date: '2024-03-11',
    source: 'TripAdvisor',
    text: 'Une expérience incroyable ! Je n\'ai que des éloges à faire. Bravo à toute l\'équipe !',
    response: {
      text: 'Wow, merci Emma pour ces mots qui nous touchent beaucoup ! C\'est un plaisir de servir des clients comme vous.',
      date: '2024-03-11',
      aiGenerated: true
    },
    sentiment: 'positive',
    keywords: ['incroyable', 'éloges', 'bravo']
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'date';

    let filteredReviews = [...MOCK_REVIEWS];

    // Filtrer par statut
    if (filter === 'pending') {
      filteredReviews = filteredReviews.filter(r => !r.response);
    } else if (filter === 'answered') {
      filteredReviews = filteredReviews.filter(r => r.response);
    }

    // Trier
    if (sort === 'date') {
      filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'rating') {
      filteredReviews.sort((a, b) => b.rating - a.rating);
    }

    // Stats
    const stats = {
      total: MOCK_REVIEWS.length,
      pending: MOCK_REVIEWS.filter(r => !r.response).length,
      answered: MOCK_REVIEWS.filter(r => r.response).length,
      avgRating: (MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1),
      responseRate: Math.round((MOCK_REVIEWS.filter(r => r.response).length / MOCK_REVIEWS.length) * 100)
    };

    return NextResponse.json({
      reviews: filteredReviews,
      stats
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { reviewId, response } = await request.json();

    if (!reviewId || !response) {
      return NextResponse.json(
        { error: 'ID de l\'avis et réponse requis' },
        { status: 400 }
      );
    }

    // Simuler l'envoi de la réponse
    return NextResponse.json({
      success: true,
      message: 'Réponse publiée avec succès',
      response: {
        text: response,
        date: new Date().toISOString(),
        aiGenerated: false
      }
    });
  } catch (error) {
    console.error('Post response error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la réponse' },
      { status: 500 }
    );
  }
}