import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    // Chercher le bon cookie (auth-token avec tiret)
    const token = cookieStore.get('auth-token') || cookieStore.get('auth_token');

    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier et décoder le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    
    try {
      const decoded = jwt.verify(token.value, jwtSecret);
      console.log('Token decoded:', decoded.uid);
      
      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      
      if (!userDoc.exists) {
        console.log('User not found in Firestore:', decoded.uid);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
      
      const userData = userDoc.data();
      
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
            role: userData.role || 'member',
            plan: 'premium',
            members: orgData.members ? orgData.members.length : 1
          };
        }
      }
      
      // Construire la réponse utilisateur
      const userResponse = {
        id: userData.uid,
        email: userData.email,
        name: userData.name,
        avatar: '👤',
        organizationName: organization?.name || 'Sans organisation',
        organization: organization,
        apps: {
          fidalyz: { active: false },
          aids: { active: true }, // AIDs est actif par défaut
          seoly: { active: false },
          supportia: { active: false },
          salesia: { active: false },
          lexa: { active: false },
          cashflow: { active: false },
          eden: { active: false }
        }
      };
      
      return NextResponse.json(userResponse);
      
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // Token expiré ou invalide
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json(
          { error: 'Session expirée' },
          { status: 401 }
        );
      }
      
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