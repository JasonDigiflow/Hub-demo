import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        connected: false 
      });
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Check if token is still valid
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${session.accessToken}`
    );
    
    if (!response.ok) {
      // Token expired or invalid
      cookieStore.delete('meta_session');
      cookieStore.delete('selected_ad_account');
      return NextResponse.json({ 
        connected: false 
      });
    }

    // Get selected account
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    // Get user's ad accounts again
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${session.accessToken}`
    );
    const accountsData = await accountsResponse.json();
    
    const activeAccounts = (accountsData.data || []).filter(
      account => account.account_status === 1
    );

    return NextResponse.json({
      connected: true,
      user: {
        id: session.userID,
        name: session.userName,
        email: session.userEmail
      },
      selectedAccount: selectedAccountCookie?.value || null,
      accounts: activeAccounts.map(account => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        timezone_name: account.timezone_name
      }))
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      connected: false,
      error: error.message 
    });
  }
}