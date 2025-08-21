import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

// Données utilisateur complètes pour la démo
const DEMO_USER = {
  id: '1',
  email: 'jason@behype-app.com',
  name: 'Jason Sotoca',
  avatar: '👨‍💼',
  organizationName: 'DigiFlow', // Nom de l'organisation pour affichage
  organization: {
    name: 'DigiFlow',
    id: 'org_001',
    role: 'owner',
    members: 1,
    plan: 'premium',
    usage: {
      reviews: 127,
      posts: 42,
      responses: 456,
      apiCalls: 12847
    }
  },
  apps: {
    fidalyz: {
      active: true,
      onboarded: true,
      stats: {
        reviews: 127,
        avgRating: 4.7,
        responseRate: 95,
        googlePosts: 42,
        monthlyGrowth: 23.5
      },
      businesses: [
        {
          id: 'biz_1',
          name: 'Behype Agency',
          googleId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          address: '123 rue de la Paix, 75001 Paris',
          rating: 4.7,
          reviewCount: 127
        }
      ]
    },
    aids: { active: false },
    seoly: { active: false },
    supportia: { active: false },
    salesia: { active: false },
    lexa: { active: false },
    cashflow: { active: false },
    eden: { active: false }
  }
};

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Demo mode
    if (token.value === 'demo_token') {
      return NextResponse.json(DEMO_USER);
    }

    // Firebase mode - For now, return demo user if Firebase not configured
    // TODO: Implement Firebase Admin SDK for token verification
    if (!auth || !db) {
      return NextResponse.json(DEMO_USER);
    }

    // Try to decode as Firebase token (basic check)
    // In production, you'd use Firebase Admin SDK to verify the token
    try {
      // For now, return demo user
      // This would be replaced with actual Firebase token verification
      return NextResponse.json(DEMO_USER);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}