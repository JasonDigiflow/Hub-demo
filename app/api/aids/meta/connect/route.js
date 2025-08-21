import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { accessToken, userID } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Access token required' 
      }, { status: 400 });
    }

    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    if (userData.error) {
      return NextResponse.json({ 
        error: 'Invalid token',
        details: userData.error 
      }, { status: 401 });
    }

    // Get user's ad accounts
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name,spend_cap,amount_spent&access_token=${accessToken}`
    );
    const accountsData = await accountsResponse.json();

    if (accountsData.error) {
      return NextResponse.json({ 
        error: 'Cannot access ad accounts',
        details: accountsData.error 
      }, { status: 403 });
    }

    // Filter active accounts only
    const activeAccounts = (accountsData.data || []).filter(
      account => account.account_status === 1 // 1 = ACTIVE
    );

    // Store user session (in production, use database)
    // For now, we'll use cookies as a simple solution
    const cookieStore = cookies();
    
    // Store encrypted token and user data
    const sessionData = {
      accessToken: accessToken, // In production, encrypt this!
      userID: userData.id,
      userName: userData.name,
      userEmail: userData.email,
      timestamp: Date.now()
    };

    // Set secure cookie (in production, encrypt the value)
    cookieStore.set('meta_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      },
      accounts: activeAccounts.map(account => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        timezone_name: account.timezone_name,
        spend_cap: account.spend_cap,
        amount_spent: account.amount_spent
      }))
    });

  } catch (error) {
    console.error('Meta connection error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to Meta',
      details: error.message 
    }, { status: 500 });
  }
}