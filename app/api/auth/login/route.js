import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Secret pour JWT (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'digiflow-secret-key-2024';

// Compte démo
const DEMO_ACCOUNT = {
  email: 'jason@behype-app.com',
  password: 'Demo123',
  user: {
    id: '1',
    email: 'jason@behype-app.com',
    name: 'Jason Sotoca',
    organization: {
      name: 'Behype',
      id: 'org_001',
      role: 'owner',
      members: 1
    },
    apps: {
      fidalyz: {
        active: true,
        stats: {
          reviews: 127,
          avgRating: 4.7,
          responseRate: 95,
          googlePosts: 42
        }
      }
    }
  }
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérification du compte démo
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      // Créer le token JWT
      const token = jwt.sign(
        { 
          userId: DEMO_ACCOUNT.user.id, 
          email: DEMO_ACCOUNT.user.email,
          name: DEMO_ACCOUNT.user.name 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Stocker le token dans un cookie httpOnly
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 jours
      });

      return NextResponse.json({
        success: true,
        user: DEMO_ACCOUNT.user
      });
    }

    // Compte non trouvé
    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}