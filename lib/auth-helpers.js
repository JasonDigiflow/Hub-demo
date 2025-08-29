import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Récupère l'utilisateur actuel depuis le JWT
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    
    if (!authToken) {
      return null;
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(authToken.value, jwtSecret);
    
    // S'assurer que l'utilisateur a un uid unique
    if (!decoded.uid) {
      return null;
    }
    
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      orgId: decoded.orgId || `org_${decoded.uid}`,
      authMethod: decoded.authMethod || 'email'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Vérifie que l'utilisateur a accès à une organisation
 */
export async function userHasOrgAccess(userId, orgId) {
  if (!userId || !orgId) return false;
  
  // L'utilisateur a accès à son organisation personnelle
  if (orgId === `org_${userId}`) return true;
  
  // TODO: Vérifier les organisations partagées dans Firestore
  
  return false;
}

/**
 * Isole les données par utilisateur
 */
export function getUserDataPath(userId, dataType) {
  return `users/${userId}/${dataType}`;
}

/**
 * Isole les données par organisation
 */
export function getOrgDataPath(orgId, dataType) {
  return `organizations/${orgId}/${dataType}`;
}

/**
 * Nettoie toutes les sessions d'un utilisateur
 */
export async function clearUserSessions() {
  const cookieStore = await cookies();
  
  // Liste de tous les cookies à supprimer
  const cookiesToClear = [
    'auth-token',
    'auth_token',
    'meta_session',
    'selected_ad_account',
    'meta_auth_state',
    'locale',
    'NEXT_LOCALE'
  ];
  
  for (const cookieName of cookiesToClear) {
    try {
      cookieStore.delete(cookieName);
      // Force la suppression avec maxAge 0
      cookieStore.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch (e) {
      // Ignorer si le cookie n'existe pas
    }
  }
  
  // Clear localStorage via client
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
}