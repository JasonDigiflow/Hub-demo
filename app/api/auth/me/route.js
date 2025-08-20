import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'digiflow-secret-key-2024';

// Données utilisateur complètes pour la démo
const DEMO_USER = {
  id: '1',
  email: 'jason@behype-app.com',
  name: 'Jason Sotoca',
  avatar: '👨‍💼',
  organization: {
    name: 'Behype',
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token.value, JWT_SECRET);
      
      // Retourner les données utilisateur
      return NextResponse.json({
        user: DEMO_USER
      });
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