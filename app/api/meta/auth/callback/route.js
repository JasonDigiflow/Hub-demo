import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    console.log('Meta OAuth callback started');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log('Callback params:', { code: code?.substring(0, 20) + '...', state, error });

    // Si l'utilisateur a refusé les permissions
    if (error) {
      console.error('Meta OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/app/aids?error=${encodeURIComponent(errorDescription || 'Authentification refusée')}`, request.url)
      );
    }

    // Vérifier le state CSRF
    const cookieStore = await cookies();
    const savedState = cookieStore.get('meta_auth_state');
    
    if (!savedState || savedState.value !== state) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(new URL('/app/aids?error=Invalid+state', request.url));
    }

    // Échanger le code contre un access token
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '1234567890';
    const FACEBOOK_APP_SECRET = process.env.META_APP_SECRET || 'your-app-secret';
    
    // Ensure URL has https://
    let baseUrl = process.env.NEXT_PUBLIC_URL || 'https://digiflow-hub.com';
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    const REDIRECT_URI = `${baseUrl}/api/meta/auth/callback`;

    console.log('Exchanging code for token...');
    console.log('App ID:', FACEBOOK_APP_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${FACEBOOK_APP_SECRET}` +
      `&code=${code}`
    );

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData.error ? tokenData.error : 'Success');

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(new URL('/app/aids?error=Token+exchange+failed', request.url));
    }

    const accessToken = tokenData.access_token;

    // Récupérer les informations de l'utilisateur
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    // Récupérer les Business Managers et Ad Accounts
    const businessResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?fields=id,name&access_token=${accessToken}`
    );
    const businessData = await businessResponse.json();

    let adAccounts = [];
    
    // Si l'utilisateur a des Business Managers, récupérer les comptes publicitaires
    if (businessData.data && businessData.data.length > 0) {
      const businessId = businessData.data[0].id;
      
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${businessId}/owned_ad_accounts?fields=id,name,account_id,account_status,currency,business&access_token=${accessToken}`
      );
      const accountsData = await accountsResponse.json();
      
      if (accountsData.data) {
        adAccounts = accountsData.data.map(account => ({
          id: account.account_id,
          name: account.name,
          status: account.account_status,
          currency: account.currency,
          businessId: businessId
        }));
      }
    } else {
      // Essayer de récupérer les comptes directement
      const directAccountsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,account_status,currency&access_token=${accessToken}`
      );
      const directAccountsData = await directAccountsResponse.json();
      
      if (directAccountsData.data) {
        adAccounts = directAccountsData.data.map(account => ({
          id: account.account_id || account.id.replace('act_', ''),
          name: account.name,
          status: account.account_status,
          currency: account.currency
        }));
      }
    }

    // Récupérer l'utilisateur actuel depuis le cookie
    const authToken = cookieStore.get('auth-token');
    if (authToken) {
      try {
        // Décoder le JWT pour obtenir l'ID utilisateur
        const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET || 'your-secret-key-2024');
        
        // Mettre à jour l'organisation avec les informations Meta
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          const user = userDoc.data();
          
          await db.collection('organizations').doc(user.organizationId).update({
            metaAuth: {
              userId: userData.id,
              userName: userData.name,
              email: userData.email,
              accessToken: accessToken,
              businesses: businessData.data || [],
              adAccounts: adAccounts,
              connectedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error updating organization:', err);
      }
    }

    // Créer la réponse avec redirection
    const response = NextResponse.redirect(new URL('/app/aids?meta_connected=true', request.url));
    
    // Stocker les données dans des cookies pour le client
    response.cookies.set('meta_access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60 // 60 jours
    });
    
    response.cookies.set('meta_user_id', userData.id, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60
    });

    // Stocker le premier compte publicitaire par défaut
    if (adAccounts.length > 0) {
      response.cookies.set('selected_ad_account', adAccounts[0].id, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 60
      });
    }

    // Supprimer le cookie de state
    response.cookies.delete('meta_auth_state');

    console.log('Meta OAuth callback completed successfully');
    return response;
  } catch (error) {
    console.error('Meta callback error:', error);
    console.error('Error stack:', error.stack);
    
    // Retourner une erreur plus détaillée pour debug
    return NextResponse.json({
      error: 'Callback failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}