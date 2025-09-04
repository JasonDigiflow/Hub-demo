import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.META_APP_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/ads-master/meta/callback`
    : 'http://localhost:3000/api/ads-master/meta/callback';
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Meta App ID not configured' },
      { status: 500 }
    );
  }

  // Permissions needed for Ads API
  const scope = [
    'ads_management',
    'ads_read',
    'business_management',
    'pages_read_engagement',
    'pages_show_list',
    'read_insights'
  ].join(',');

  // Generate state token for CSRF protection
  const state = Math.random().toString(36).substring(7);

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('response_type', 'code');

  // Store state in cookie for verification
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });

  return response;
}