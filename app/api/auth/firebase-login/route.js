import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'digiflow-secret-key-2024';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Si Firebase est configuré, utiliser Firebase Auth
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        // Connexion avec Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Créer le token JWT avec les infos Firebase
        const token = jwt.sign(
          { 
            userId: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Stocker le token
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        });

        return NextResponse.json({
          success: true,
          user: {
            id: user.uid,
            email: user.email,
            name: user.displayName,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL
          }
        });
      } catch (firebaseError) {
        console.error('Firebase auth error:', firebaseError);
        
        // Si c'est le compte démo, autoriser quand même
        if (email === 'jason@behype-app.com' && password === 'Demo123') {
          const token = jwt.sign(
            { 
              userId: 'demo-user',
              email: 'jason@behype-app.com',
              name: 'Jason Sotoca (Demo)'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          const cookieStore = await cookies();
          cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
          });

          return NextResponse.json({
            success: true,
            user: {
              id: 'demo-user',
              email: 'jason@behype-app.com',
              name: 'Jason Sotoca',
              demo: true
            }
          });
        }

        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }
    }

    // Fallback vers le compte démo si Firebase n'est pas configuré
    if (email === 'jason@behype-app.com' && password === 'Demo123') {
      const token = jwt.sign(
        { 
          userId: 'demo-user',
          email: 'jason@behype-app.com',
          name: 'Jason Sotoca'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });

      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-user',
          email: 'jason@behype-app.com',
          name: 'Jason Sotoca',
          demo: true
        }
      });
    }

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