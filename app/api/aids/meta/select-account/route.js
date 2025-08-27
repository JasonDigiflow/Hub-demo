import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({ 
        error: 'Account ID required' 
      }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Verify the account belongs to the user
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?fields=id,name,account_status&access_token=${session.accessToken}`
    );
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Invalid account or no access' 
      }, { status: 403 });
    }

    const accountData = await response.json();
    
    // Store selected account
    cookieStore.set('selected_ad_account', accountId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // In production, save this to database with user ID
    // For now, we're using cookies

    return NextResponse.json({
      success: true,
      account: {
        id: accountData.id,
        name: accountData.name
      }
    });

  } catch (error) {
    console.error('Account selection error:', error);
    return NextResponse.json({ 
      error: 'Failed to select account',
      details: error.message 
    }, { status: 500 });
  }
}