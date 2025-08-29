import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Helper pour récupérer l'authentification Meta depuis les cookies
 * Remplace l'ancien système meta_session par meta_access_token
 */
export async function getMetaAuth() {
  const cookieStore = await cookies();
  const metaTokenCookie = cookieStore.get('meta_access_token');
  const selectedAccountCookie = cookieStore.get('selected_ad_account');
  const authTokenCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
  
  if (!metaTokenCookie || !selectedAccountCookie) {
    console.log('[Meta Auth Helper] Missing cookies:', {
      hasMetaToken: !!metaTokenCookie,
      hasSelectedAccount: !!selectedAccountCookie,
      hasAuthToken: !!authTokenCookie
    });
    return {
      authenticated: false,
      error: 'Not authenticated or no account selected'
    };
  }
  
  // Extract userId from JWT if available
  let userId = null;
  if (authTokenCookie) {
    try {
      const decoded = jwt.verify(authTokenCookie.value, process.env.JWT_SECRET || 'your-secret-key-2024');
      userId = decoded.uid;
    } catch (error) {
      console.error('[Meta Auth Helper] Error decoding JWT:', error.message);
    }
  }
  
  return {
    authenticated: true,
    accessToken: metaTokenCookie.value,
    accountId: selectedAccountCookie.value,
    userId,
    authToken: authTokenCookie?.value
  };
}

/**
 * Helper pour vérifier rapidement l'authentification Meta
 * Retourne null si non authentifié, sinon retourne les données
 */
export async function requireMetaAuth() {
  const auth = await getMetaAuth();
  if (!auth.authenticated) {
    return null;
  }
  return auth;
}