import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Meta OAuth configuration
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '1234567890';
    const REDIRECT_URI = process.env.NEXT_PUBLIC_URL 
      ? `${process.env.NEXT_PUBLIC_URL}/api/meta/callback`
      : 'https://digiflow-hub.com/api/meta/callback';
    
    // Permissions nécessaires pour la gestion des publicités
    const PERMISSIONS = [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_read_engagement',
      'pages_show_list',
      'leads_retrieval',
      'instagram_basic',
      'instagram_manage_insights'
    ].join(',');

    // Générer un state unique pour la sécurité CSRF
    const state = Math.random().toString(36).substring(7);
    
    // Stocker le state dans un cookie pour validation au retour
    const response = NextResponse.redirect(
      `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${PERMISSIONS}` +
      `&state=${state}` +
      `&response_type=code` +
      `&auth_type=rerequest`
    );

    // Définir le cookie avec le state
    response.cookies.set('meta_auth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Meta auth error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation de l\'authentification Meta' },
      { status: 500 }
    );
  }
}