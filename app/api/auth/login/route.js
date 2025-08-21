import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginWithEmail } from '@/lib/firebase-auth';
import { auth } from '@/lib/firebase';

// Compte démo pour développement local
const DEMO_ACCOUNT = {
  email: 'jason@behype-app.com',
  password: 'Demo123',
  user: {
    id: 'demo_user',
    email: 'jason@behype-app.com',
    name: 'Jason Sotoca',
    organization: {
      name: 'Behype',
      id: 'demo_org',
      role: 'owner',
      members: 1
    }
  }
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log('Login attempt for:', email);
    console.log('Firebase auth available:', !!auth);

    // Check if Firebase is configured
    if (!auth) {
      console.warn('Firebase not configured, using demo mode');
      // Fallback to demo mode for local development
      if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
        const response = NextResponse.json({
          success: true,
          user: DEMO_ACCOUNT.user
        });

        // Set demo cookie
        response.cookies.set('auth_token', 'demo_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
      } else {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect (Mode démo)' },
          { status: 401 }
        );
      }
    }

    console.log('Attempting Firebase login...');
    
    // Use Firebase Auth
    const result = await loginWithEmail(email, password);

    if (result.success) {
      try {
        // Get the ID token from the returned user object
        const idToken = await result.firebaseUser.getIdToken();
        
        console.log('Login successful, token generated');

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
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        // Even if token fails, login succeeded
        return NextResponse.json({
          success: true,
          user: result.user,
          message: 'Connexion réussie'
        });
      }
    }

    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 401 }
    );
  }
}