import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Meta OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/app/ads-master?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Verify state token for CSRF protection
  const cookieStore = await cookies();
  const savedState = cookieStore.get('meta_oauth_state')?.value;

  if (!state || state !== savedState) {
    console.error('Invalid state token');
    return NextResponse.redirect(
      new URL('/app/ads-master?error=Invalid%20state%20token', request.url)
    );
  }

  // Exchange code for access token
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/ads-master/meta/callback`
    : 'http://localhost:3000/api/ads-master/meta/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/app/ads-master?error=Meta%20configuration%20missing', request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', clientId);
    tokenUrl.searchParams.append('client_secret', clientSecret);
    tokenUrl.searchParams.append('redirect_uri', redirectUri);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(
        new URL(`/app/ads-master?error=${encodeURIComponent(tokenData.error.message)}`, request.url)
      );
    }

    const accessToken = tokenData.access_token;

    // Get user info and ad accounts
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    // Get ad accounts
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`
    );
    const adAccountsData = await adAccountsResponse.json();

    // Store connection in cookies (in production, use database)
    const response = NextResponse.redirect(new URL('/app/ads-master?connected=true', request.url));
    
    // Store encrypted token and user data
    const connectionData = {
      accessToken: accessToken, // In production, encrypt this
      userId: userData.id,
      userName: userData.name,
      userEmail: userData.email,
      adAccounts: adAccountsData.data || [],
      connectedAt: new Date().toISOString()
    };

    response.cookies.set('meta_connection', JSON.stringify(connectionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Clear OAuth state cookie
    response.cookies.delete('meta_oauth_state');

    return response;
  } catch (error) {
    console.error('Error during token exchange:', error);
    return NextResponse.redirect(
      new URL('/app/ads-master?error=Connection%20failed', request.url)
    );
  }
}