import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

// Clé de chiffrement pour les tokens
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Fonctions de chiffrement (réutilisées du système test-tokens)
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Vérifier les erreurs Facebook
    if (error) {
      aidsLogger.error(LogCategories.AUTH, 'Erreur OAuth Meta', {
        error,
        errorDescription
      });
      
      // Rediriger vers la page de connexion avec l'erreur
      return NextResponse.redirect(
        new URL(`/app/aids/connect?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }
    
    // Vérifier le state CSRF
    const cookieStore = await cookies();
    const savedState = cookieStore.get('meta_auth_state');
    
    if (!savedState || savedState.value !== state) {
      aidsLogger.error(LogCategories.AUTH, 'État CSRF invalide');
      return NextResponse.redirect(
        new URL('/app/aids/connect?error=invalid_state', request.url)
      );
    }
    
    // Échanger le code contre un access token
    const metaAppId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
    const metaAppSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/meta/auth/callback`;
    
    if (!metaAppId || !metaAppSecret) {
      aidsLogger.error(LogCategories.AUTH, 'Configuration Meta manquante');
      return NextResponse.redirect(
        new URL('/app/aids/connect?error=config_missing', request.url)
      );
    }
    
    // Échanger le code contre un token court
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${metaAppId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `client_secret=${metaAppSecret}&` +
      `code=${code}`
    );
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      aidsLogger.error(LogCategories.AUTH, 'Erreur échange de code', tokenData.error);
      return NextResponse.redirect(
        new URL(`/app/aids/connect?error=${tokenData.error.message}`, request.url)
      );
    }
    
    // Échanger le token court contre un token long (60 jours)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${metaAppId}&` +
      `client_secret=${metaAppSecret}&` +
      `fb_exchange_token=${tokenData.access_token}`
    );
    
    const longLivedData = await longLivedResponse.json();
    
    if (longLivedData.error) {
      aidsLogger.error(LogCategories.AUTH, 'Erreur token long-lived', longLivedData.error);
      return NextResponse.redirect(
        new URL(`/app/aids/connect?error=${longLivedData.error.message}`, request.url)
      );
    }
    
    // Récupérer les informations utilisateur
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${longLivedData.access_token}`
    );
    const userData = await userResponse.json();
    
    // Récupérer les comptes publicitaires
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,account_id&limit=100&access_token=${longLivedData.access_token}`
    );
    const accountsData = await accountsResponse.json();
    
    // Récupérer l'utilisateur authentifié actuel (depuis le cookie auth-token)
    const authToken = cookieStore.get('auth-token');
    let currentUser = null;
    
    if (authToken) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        currentUser = jwt.verify(authToken.value, jwtSecret);
      } catch (err) {
        console.error('Invalid auth token:', err);
      }
    }
    
    // Si pas d'utilisateur authentifié, créer une session temporaire
    if (!currentUser) {
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
      const tempUser = {
        uid: `meta_${userData.id}`,
        email: userData.email || `${userData.id}@meta.user`,
        name: userData.name,
        authMethod: 'meta_oauth'
      };
      
      const tempToken = jwt.sign(tempUser, jwtSecret, { expiresIn: '30d' });
      
      // Créer le cookie d'authentification
      cookieStore.set('auth-token', tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 jours
      });
      
      currentUser = tempUser;
    }
    
    // Sauvegarder la connexion Meta dans Firestore
    const encryptedToken = encrypt(longLivedData.access_token);
    const expiresAt = Date.now() + (longLivedData.expires_in ? longLivedData.expires_in * 1000 : 60 * 60 * 24 * 60 * 1000); // 60 jours par défaut
    
    // Sauvegarder dans users/{uid}/metaConnection
    await db.collection('users').doc(currentUser.uid).set({
      email: currentUser.email,
      name: currentUser.name,
      updatedAt: new Date().toISOString(),
      metaConnection: {
        fbUserId: userData.id,
        fbUserName: userData.name,
        encryptedToken: encryptedToken,
        expiresAt: expiresAt,
        lastRefresh: Date.now(),
        connectedAt: new Date().toISOString()
      }
    }, { merge: true });
    
    // Déterminer l'orgId (utiliser l'orgId existant ou créer basé sur l'uid)
    const orgId = currentUser.orgId || `org_${currentUser.uid}`;
    
    // Sauvegarder les ad accounts dans organizations/{orgId}
    if (accountsData.data && accountsData.data.length > 0) {
      const adAccounts = accountsData.data.map(account => ({
        id: account.id,
        accountId: account.account_id,
        name: account.name || 'Compte sans nom',
        currency: account.currency || 'USD',
        status: account.account_status,
        lastSync: Date.now()
      }));
      
      await db.collection('organizations').doc(orgId).set({
        name: currentUser.orgName || `Organisation de ${currentUser.name}`,
        adAccounts: adAccounts,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    // Créer la session Meta (pour compatibilité avec l'ancien système)
    const sessionData = {
      accessToken: longLivedData.access_token, // Sera chiffré côté client
      userID: userData.id,
      userId: userData.id,
      userName: userData.name,
      userEmail: userData.email,
      timestamp: Date.now(),
      expiresAt: expiresAt
    };
    
    cookieStore.set('meta_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 jours
    });
    
    aidsLogger.success(LogCategories.AUTH, 'Connexion OAuth Meta réussie', {
      userId: userData.id,
      userName: userData.name,
      accountsCount: accountsData.data ? accountsData.data.length : 0
    });
    
    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(
      new URL('/app/aids?success=connected', request.url)
    );
    
  } catch (error) {
    aidsLogger.critical(LogCategories.AUTH, 'Erreur OAuth callback', {
      errorMessage: error.message,
      errorStack: error.stack
    });
    
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(`/app/aids/connect?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}