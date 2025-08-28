import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';

// Clé de chiffrement (en production, utiliser une variable d'environnement)
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Fonctions de chiffrement
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

// GET - Récupérer les tokens de test
export async function GET(request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Non authentifié',
        tokens: []
      }, { status: 401 });
    }

    // Récupérer les tokens depuis Firestore
    const tokensSnapshot = await db.collection('test_tokens').get();
    const tokens = [];
    
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      // Ne pas renvoyer le token en clair, juste les métadonnées
      tokens.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        accountId: data.accountId,
        accountName: data.accountName,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        isActive: data.isActive || false
      });
    });

    return NextResponse.json({
      success: true,
      tokens: tokens
    });

  } catch (error) {
    console.error('Error fetching test tokens:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des tokens',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Ajouter un nouveau token de test
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const { name, token, description } = await request.json();
    
    if (!name || !token) {
      return NextResponse.json({ 
        error: 'Nom et token requis'
      }, { status: 400 });
    }

    // Vérifier le token avec l'API Meta
    const testResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${token}`
    );
    const testData = await testResponse.json();
    
    if (testData.error) {
      return NextResponse.json({ 
        error: 'Token invalide',
        details: testData.error.message
      }, { status: 400 });
    }

    // Récupérer les comptes publicitaires
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name&limit=1&access_token=${token}`
    );
    const accountsData = await accountsResponse.json();
    
    const firstAccount = accountsData.data?.[0];

    // Chiffrer le token
    const encryptedToken = encrypt(token);

    // Sauvegarder dans Firestore
    const tokenDoc = {
      name: name,
      description: description || '',
      encryptedToken: encryptedToken,
      metaUserId: testData.id,
      metaUserName: testData.name,
      accountId: firstAccount?.id || null,
      accountName: firstAccount?.name || null,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: false
    };

    const docRef = await db.collection('test_tokens').add(tokenDoc);

    return NextResponse.json({
      success: true,
      message: 'Token ajouté avec succès',
      tokenId: docRef.id,
      metaUser: testData.name,
      account: firstAccount?.name || 'Aucun compte trouvé'
    });

  } catch (error) {
    console.error('Error adding test token:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'ajout du token',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Activer un token de test
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const { tokenId } = await request.json();
    
    if (!tokenId) {
      return NextResponse.json({ 
        error: 'ID du token requis'
      }, { status: 400 });
    }

    // Récupérer le token depuis Firestore
    const tokenDoc = await db.collection('test_tokens').doc(tokenId).get();
    
    if (!tokenDoc.exists) {
      return NextResponse.json({ 
        error: 'Token non trouvé'
      }, { status: 404 });
    }

    const tokenData = tokenDoc.data();
    
    // Déchiffrer le token
    const decryptedToken = decrypt(tokenData.encryptedToken);

    // Vérifier que le token est toujours valide
    const testResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${decryptedToken}`
    );
    const testData = await testResponse.json();
    
    if (testData.error) {
      return NextResponse.json({ 
        error: 'Token expiré ou invalide',
        details: testData.error.message
      }, { status: 400 });
    }

    // Désactiver tous les autres tokens
    const allTokens = await db.collection('test_tokens').get();
    const batch = db.batch();
    allTokens.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    await batch.commit();

    // Activer ce token
    await db.collection('test_tokens').doc(tokenId).update({
      isActive: true,
      lastUsed: new Date().toISOString()
    });

    // Créer une session Meta avec ce token
    const sessionData = {
      accessToken: decryptedToken,
      userID: tokenData.metaUserId,
      userId: tokenData.metaUserId,
      userName: tokenData.metaUserName,
      timestamp: Date.now(),
      testToken: true,
      tokenId: tokenId
    };

    cookieStore.set('meta_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 heures pour les tokens de test
    });

    // Sélectionner le compte publicitaire si disponible
    if (tokenData.accountId) {
      cookieStore.set('selected_ad_account', tokenData.accountId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      });
    }

    return NextResponse.json({
      success: true,
      message: `Token ${tokenData.name} activé`,
      metaUser: tokenData.metaUserName,
      account: tokenData.accountName
    });

  } catch (error) {
    console.error('Error activating test token:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'activation du token',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Supprimer un token de test
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');
    
    if (!tokenId) {
      return NextResponse.json({ 
        error: 'ID du token requis'
      }, { status: 400 });
    }

    await db.collection('test_tokens').doc(tokenId).delete();

    return NextResponse.json({
      success: true,
      message: 'Token supprimé'
    });

  } catch (error) {
    console.error('Error deleting test token:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du token',
      details: error.message
    }, { status: 500 });
  }
}