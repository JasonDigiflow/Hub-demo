import { NextResponse } from 'next/server';

// Mock data pour les statistiques Fidalyz
export async function GET(request) {
  try {
    const stats = {
      overview: {
        totalReviews: 127,
        avgRating: 4.7,
        responseRate: 95,
        avgResponseTime: '2h 15min',
        googlePosts: 42,
        collectRequests: 234
      },
      growth: {
        reviews: {
          current: 127,
          previous: 103,
          change: 23.3
        },
        rating: {
          current: 4.7,
          previous: 4.5,
          change: 4.4
        },
        responses: {
          current: 95,
          previous: 87,
          change: 9.2
        }
      },
      sources: [
        { name: 'Google', count: 89, percentage: 70 },
        { name: 'Facebook', count: 25, percentage: 20 },
        { name: 'TripAdvisor', count: 13, percentage: 10 }
      ],
      sentiments: {
        positive: 78,
        neutral: 15,
        negative: 7
      },
      recentActivity: [
        {
          type: 'new_review',
          source: 'Google',
          rating: 5,
          author: 'Marie L.',
          time: '2 heures'
        },
        {
          type: 'response_sent',
          source: 'Google',
          author: 'Jean D.',
          time: '4 heures'
        },
        {
          type: 'google_post',
          title: 'Nouveautés du printemps',
          time: '6 heures'
        },
        {
          type: 'collect_sent',
          count: 15,
          method: 'SMS',
          time: '1 jour'
        }
      ],
      chartData: {
        reviews: [
          { month: 'Jan', count: 12 },
          { month: 'Fév', count: 15 },
          { month: 'Mar', count: 18 },
          { month: 'Avr', count: 22 },
          { month: 'Mai', count: 28 },
          { month: 'Jun', count: 32 }
        ],
        ratings: [
          { month: 'Jan', rating: 4.5 },
          { month: 'Fév', rating: 4.6 },
          { month: 'Mar', rating: 4.6 },
          { month: 'Avr', rating: 4.7 },
          { month: 'Mai', rating: 4.7 },
          { month: 'Jun', rating: 4.8 }
        ]
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}