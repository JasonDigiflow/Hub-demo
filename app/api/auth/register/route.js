import { NextResponse } from 'next/server';
import { registerWithEmail } from '@/lib/firebase-auth';
import { auth } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { email, password, name, organizationName } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Check if Firebase is configured
    if (!auth) {
      // Demo mode - store in memory/localStorage
      return NextResponse.json({
        success: true,
        message: 'Compte créé en mode démo (non persistant)',
        user: {
          email,
          name,
          organizationName
        }
      });
    }

    // Register with Firebase
    const result = await registerWithEmail(email, password, {
      name,
      organizationName
    });

    if (result.success) {
      // Get the ID token from Firebase
      const user = auth.currentUser;
      const idToken = await user.getIdToken();

      const response = NextResponse.json({
        success: true,
        user: result.user
      });

      // Set secure httpOnly cookie with Firebase ID token
      response.cookies.set('auth_token', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du compte' },
      { status: 400 }
    );
  }
}