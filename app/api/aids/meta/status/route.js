import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({
        connected: false,
        message: 'Pas de session Meta active'
      });
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      // Check if session is expired based on timestamp (30 days)
      const sessionAge = Date.now() - sessionData.timestamp;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      if (sessionAge > maxAge) {
        // Clear expired session
        cookieStore.delete('meta_session');
        cookieStore.delete('selected_ad_account');
        return NextResponse.json({
          connected: false,
          message: 'Session expirée'
        });
      }
      
      // Verify token is still valid by making a simple API call
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${sessionData.accessToken}`
      );
      
      if (!response.ok) {
        // Token is invalid, clear session
        cookieStore.delete('meta_session');
        cookieStore.delete('selected_ad_account');
        return NextResponse.json({
          connected: false,
          message: 'Token invalide'
        });
      }
      
      const userData = await response.json();
      
      if (userData.error) {
        // Token has an error, clear session
        cookieStore.delete('meta_session');
        cookieStore.delete('selected_ad_account');
        return NextResponse.json({
          connected: false,
          message: 'Erreur de token',
          error: userData.error
        });
      }
      
      // Get selected account if any
      const selectedAccountCookie = cookieStore.get('selected_ad_account');
      let selectedAccount = null;
      
      if (selectedAccountCookie) {
        selectedAccount = selectedAccountCookie.value;
      }
      
      // Get ad accounts with better error handling
      let accounts = [];
      try {
        const accountsResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&limit=100&access_token=${sessionData.accessToken}`
        );
        
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          
          if (accountsData.data) {
            // Include all accounts, not just active ones, but mark their status
            accounts = accountsData.data.map(account => ({
              id: account.id,
              name: account.name || 'Compte sans nom',
              currency: account.currency || 'USD',
              timezone_name: account.timezone_name || 'UTC',
              status: account.account_status,
              isActive: account.account_status === 1
            }));
          }
        }
      } catch (accountsError) {
        console.error('Error fetching ad accounts:', accountsError);
        // Continue without accounts, connection is still valid
      }
      
      return NextResponse.json({
        connected: true,
        user: {
          id: sessionData.userID,
          name: sessionData.userName,
          email: sessionData.userEmail
        },
        accounts: accounts,
        selectedAccount: selectedAccount,
        sessionAge: Math.floor(sessionAge / 1000 / 60), // Age in minutes
        message: `Connecté en tant que ${sessionData.userName}`
      });
      
    } catch (error) {
      console.error('Error parsing session:', error);
      // Clear invalid session
      cookieStore.delete('meta_session');
      cookieStore.delete('selected_ad_account');
      
      return NextResponse.json({
        connected: false,
        message: 'Session invalide',
        error: error.message
      });
    }
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      connected: false,
      error: error.message,
      message: 'Erreur lors de la vérification du statut'
    }, { status: 500 });
  }
}