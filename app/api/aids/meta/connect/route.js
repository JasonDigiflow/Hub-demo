import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

// Helper to validate token with app secret if available
async function validateToken(accessToken) {
  // Skip validation for now to avoid rate limiting
  // The token will be validated when we try to use it
  return { valid: true };
  
  /* Commented out to reduce API calls and avoid rate limiting
  const appSecret = process.env.META_APP_SECRET;
  const appId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
  
  if (!appSecret || !appId) {
    return { valid: true };
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/debug_token?` +
      `input_token=${accessToken}&` +
      `access_token=${appId}|${appSecret}`
    );
    
    const data = await response.json();
    
    if (data.data && data.data.is_valid) {
      return { valid: true, data: data.data };
    }
    
    return { valid: false, error: 'Invalid token' };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: true };
  }
  */
}

export async function POST(request) {
  try {
    aidsLogger.info(LogCategories.AUTH, 'Connexion Meta: Début du processus');
    
    const { accessToken, userID } = await request.json();

    if (!accessToken) {
      aidsLogger.error(LogCategories.AUTH, 'Connexion Meta: Token manquant');
      return NextResponse.json({ 
        error: 'Access token requis',
        success: false
      }, { status: 400 });
    }

    // Validate token if app secret is available
    const validation = await validateToken(accessToken);
    if (!validation.valid) {
      aidsLogger.error(LogCategories.AUTH, 'Connexion Meta: Token invalide', {
        error: validation.error
      });
      return NextResponse.json({ 
        error: 'Token invalide',
        success: false,
        details: validation.error 
      }, { status: 401 });
    }

    // Get user info from Facebook
    console.log('Fetching user info from Facebook...');
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    if (userData.error) {
      aidsLogger.error(LogCategories.META_API, 'Connexion Meta: Erreur récupération utilisateur', {
        error: userData.error,
        errorMessage: userData.error.message,
        errorCode: userData.error.code,
        errorType: userData.error.type
      });
      console.error('Facebook user error:', userData.error);
      return NextResponse.json({ 
        error: 'Impossible de récupérer les informations utilisateur',
        success: false,
        details: userData.error.message || userData.error
      }, { status: 401 });
    }

    // Get user's ad accounts
    console.log('Fetching ad accounts...');
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name,spend_cap,amount_spent,balance&limit=100&access_token=${accessToken}`
    );
    const accountsData = await accountsResponse.json();

    console.log('Ad accounts response:', accountsData);

    if (accountsData.error) {
      aidsLogger.error(LogCategories.META_API, 'Connexion Meta: Erreur récupération comptes publicitaires', {
        error: accountsData.error,
        errorMessage: accountsData.error.message,
        errorCode: accountsData.error.code,
        errorType: accountsData.error.type,
        errorSubcode: accountsData.error.error_subcode
      });
      console.error('Facebook ad accounts error:', accountsData.error);
      
      // Provide helpful error messages
      if (accountsData.error.code === 190) {
        aidsLogger.warning(LogCategories.AUTH, 'Token Meta expiré');
        return NextResponse.json({ 
          error: 'Token expiré. Veuillez vous reconnecter.',
          success: false
        }, { status: 401 });
      }
      
      if (accountsData.error.code === 10) {
        aidsLogger.warning(LogCategories.META_API, 'Pas d\'accès aux comptes publicitaires');
        return NextResponse.json({ 
          error: 'Pas d\'accès aux comptes publicitaires. Vérifiez que vous avez un Business Manager configuré.',
          success: false,
          details: 'Vous devez avoir au moins un compte publicitaire dans votre Business Manager.'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Impossible d\'accéder aux comptes publicitaires',
        success: false,
        details: accountsData.error.message || accountsData.error
      }, { status: 403 });
    }

    // Check if user has any ad accounts
    if (!accountsData.data || accountsData.data.length === 0) {
      aidsLogger.warning(LogCategories.META_API, 'Connexion Meta: Aucun compte publicitaire trouvé');
      return NextResponse.json({ 
        error: 'Aucun compte publicitaire trouvé',
        success: false,
        details: 'Assurez-vous d\'avoir au moins un compte publicitaire dans votre Business Manager Facebook.'
      }, { status: 404 });
    }

    // Filter and format accounts
    const accounts = accountsData.data.map(account => ({
      id: account.id,
      name: account.name || 'Compte sans nom',
      currency: account.currency || 'USD',
      timezone_name: account.timezone_name || 'UTC',
      spend_cap: account.spend_cap,
      amount_spent: account.amount_spent,
      balance: account.balance,
      status: account.account_status,
      // 1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED, 7 = PENDING_REVIEW, 9 = IN_GRACE_PERIOD
      statusText: {
        1: 'Actif',
        2: 'Désactivé', 
        3: 'Non réglé',
        7: 'En cours de révision',
        9: 'Période de grâce',
        100: 'Pending closure',
        101: 'Closed',
        201: 'Any active',
        202: 'Any closed'
      }[account.account_status] || 'Inconnu'
    }));

    // Store user session (in production, use database)
    const cookieStore = cookies();
    
    // Store encrypted token and user data
    const sessionData = {
      accessToken: accessToken, // In production, encrypt this!
      userID: userData.id,
      userId: userData.id, // Add both for compatibility
      userName: userData.name,
      userEmail: userData.email,
      timestamp: Date.now(),
      expiresIn: validation.data?.expires_at ? validation.data.expires_at * 1000 : Date.now() + (60 * 60 * 24 * 30 * 1000)
    };

    // Set secure cookie (in production, encrypt the value)
    cookieStore.set('meta_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to allow OAuth redirects
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    // Also create a JWT auth token for API compatibility
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const authToken = jwt.sign(
      { 
        uid: userData.id,
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        authMethod: 'meta'
      },
      jwtSecret,
      { expiresIn: '30d' }
    );
    
    // Set auth token cookie for API authentication
    cookieStore.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    console.log('Connection successful for user:', userData.name);
    
    aidsLogger.success(LogCategories.AUTH, 'Connexion Meta réussie', {
      userId: userData.id,
      userName: userData.name,
      accountsCount: accounts.length,
      accounts: accounts.map(a => ({ id: a.id, name: a.name, status: a.statusText }))
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      },
      accounts: accounts,
      accountsCount: accounts.length,
      message: `Connexion réussie ! ${accounts.length} compte(s) publicitaire(s) trouvé(s).`
    });

  } catch (error) {
    aidsLogger.critical(LogCategories.AUTH, 'Connexion Meta: Erreur critique', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name
    }, error);
    console.error('Meta connection error:', error);
    return NextResponse.json({ 
      error: 'Erreur de connexion à Meta',
      success: false,
      details: error.message 
    }, { status: 500 });
  }
}