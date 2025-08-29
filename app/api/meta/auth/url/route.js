import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || 
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/meta/auth/callback`;
    
    // Générer un state pour la sécurité CSRF
    const state = crypto.randomBytes(16).toString('hex');
    
    // Stocker le state dans un cookie temporaire
    const response = NextResponse.json({ success: false });
    
    // Scopes nécessaires pour l'accès Meta Ads
    const scopes = [
      'ads_read',
      'ads_management', 
      'business_management',
      'read_insights',
      'pages_read_engagement',
      'leads_retrieval'
    ].join(',');
    
    const metaAppId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
    
    if (!metaAppId) {
      return NextResponse.json({ 
        error: 'Configuration Meta manquante',
        details: 'META_APP_ID non configuré'
      }, { status: 500 });
    }
    
    // Construire l'URL d'autorisation Facebook
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.append('client_id', metaAppId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('auth_type', 'rerequest'); // Force re-consent si nécessaire
    
    // Retourner l'URL et stocker le state
    const finalResponse = NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      redirectUri
    });
    
    // Stocker le state dans un cookie sécurisé
    finalResponse.cookies.set('meta_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    });
    
    return finalResponse;
    
  } catch (error) {
    console.error('Error generating Meta auth URL:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la génération de l\'URL d\'authentification',
      details: error.message
    }, { status: 500 });
  }
}