import crypto from 'crypto';
import { db } from './firebase-admin';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Clé de chiffrement
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Fonctions de chiffrement/déchiffrement
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Récupérer l'utilisateur actuel depuis le JWT
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return null;
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const user = jwt.verify(authToken.value, jwtSecret);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Récupérer le token Meta pour l'utilisateur actuel
export async function getMetaTokenForUser(uid = null) {
  try {
    // Si pas d'uid fourni, récupérer l'utilisateur actuel
    if (!uid) {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'Utilisateur non authentifié',
          needsReauth: true
        };
      }
      uid = currentUser.uid;
    }
    
    // Récupérer les infos de connexion Meta depuis Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
        needsReauth: true
      };
    }
    
    const userData = userDoc.data();
    
    if (!userData.metaConnection) {
      return {
        success: false,
        error: 'Pas de connexion Meta',
        needsReauth: true
      };
    }
    
    const { encryptedToken, expiresAt, fbUserId } = userData.metaConnection;
    
    // Vérifier l'expiration
    if (expiresAt && Date.now() > expiresAt) {
      // Token expiré, nécessite une nouvelle authentification
      return {
        success: false,
        error: 'Token Meta expiré',
        needsReauth: true,
        expired: true
      };
    }
    
    // Vérifier si le token va expirer bientôt (dans les 7 jours)
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    if (expiresAt && expiresAt < sevenDaysFromNow) {
      // Le token va expirer bientôt, suggérer un refresh
      console.warn('Meta token will expire soon, consider refreshing');
    }
    
    // Déchiffrer le token
    const decryptedToken = decrypt(encryptedToken);
    
    if (!decryptedToken) {
      return {
        success: false,
        error: 'Impossible de déchiffrer le token',
        needsReauth: true
      };
    }
    
    return {
      success: true,
      token: decryptedToken,
      fbUserId: fbUserId,
      expiresAt: expiresAt
    };
    
  } catch (error) {
    console.error('Error getting Meta token:', error);
    return {
      success: false,
      error: error.message,
      needsReauth: true
    };
  }
}

// Rafraîchir le token si nécessaire
export async function refreshMetaToken(uid = null) {
  try {
    const tokenInfo = await getMetaTokenForUser(uid);
    
    if (!tokenInfo.success || !tokenInfo.token) {
      return {
        success: false,
        error: 'Pas de token à rafraîchir',
        needsReauth: true
      };
    }
    
    const metaAppId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
    const metaAppSecret = process.env.META_APP_SECRET;
    
    if (!metaAppId || !metaAppSecret) {
      return {
        success: false,
        error: 'Configuration Meta manquante'
      };
    }
    
    // Échanger le token actuel contre un nouveau token long-lived
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${metaAppId}&` +
      `client_secret=${metaAppSecret}&` +
      `fb_exchange_token=${tokenInfo.token}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Token refresh error:', data.error);
      return {
        success: false,
        error: data.error.message,
        needsReauth: true
      };
    }
    
    // Sauvegarder le nouveau token
    const encryptedToken = encrypt(data.access_token);
    const expiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 60 * 60 * 24 * 60 * 1000);
    
    // Mettre à jour dans Firestore
    if (!uid) {
      const currentUser = await getCurrentUser();
      uid = currentUser.uid;
    }
    
    await db.collection('users').doc(uid).update({
      'metaConnection.encryptedToken': encryptedToken,
      'metaConnection.expiresAt': expiresAt,
      'metaConnection.lastRefresh': Date.now(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      token: data.access_token,
      expiresAt: expiresAt
    };
    
  } catch (error) {
    console.error('Error refreshing Meta token:', error);
    return {
      success: false,
      error: error.message,
      needsReauth: true
    };
  }
}

// Récupérer les ad accounts de l'organisation
export async function getOrgAdAccounts(orgId = null) {
  try {
    // Si pas d'orgId, utiliser celui de l'utilisateur actuel
    if (!orgId) {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'Utilisateur non authentifié',
          accounts: []
        };
      }
      orgId = currentUser.orgId || `org_${currentUser.uid}`;
    }
    
    // Récupérer les ad accounts depuis Firestore
    const orgDoc = await db.collection('organizations').doc(orgId).get();
    
    if (!orgDoc.exists) {
      return {
        success: false,
        error: 'Organisation non trouvée',
        accounts: []
      };
    }
    
    const orgData = orgDoc.data();
    
    return {
      success: true,
      accounts: orgData.adAccounts || [],
      orgName: orgData.name
    };
    
  } catch (error) {
    console.error('Error getting org ad accounts:', error);
    return {
      success: false,
      error: error.message,
      accounts: []
    };
  }
}

export default {
  getMetaTokenForUser,
  refreshMetaToken,
  getOrgAdAccounts,
  getCurrentUser,
  encrypt,
  decrypt
};