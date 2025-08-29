import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    console.log('Login attempt for:', email);

    // Chercher l'utilisateur dans Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('User found:', userData.uid);

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, userData.password);
    
    if (!passwordMatch) {
      console.log('Invalid password for user:', userData.uid);
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log('Password verified, creating session');

    // Récupérer l'organisation si elle existe
    let organization = null;
    if (userData.primaryOrgId) {
      const orgDoc = await db.collection('organizations').doc(userData.primaryOrgId).get();
      if (orgDoc.exists) {
        const orgData = orgDoc.data();
        organization = {
          id: orgData.id,
          name: orgData.name,
          siret: orgData.siret,
          role: userData.role || 'member'
        };
      }
    }

    // Créer le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const token = jwt.sign(
      {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        orgId: userData.primaryOrgId,
        role: userData.role
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: userData.uid,
        email: userData.email,
        name: userData.name,
        organization: organization
      }
    });

    // Définir le cookie d'authentification
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 jours
    });

    // Log de connexion
    await db.collection('audit_logs').add({
      action: 'user_login',
      userId: userData.uid,
      email: userData.email,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    console.log('Login successful for:', userData.email);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion', details: error.message },
      { status: 500 }
    );
  }
}