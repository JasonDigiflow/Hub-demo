import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function POST() {
  try {
    aidsLogger.info(LogCategories.AUTH, 'Déconnexion Meta initiée');
    
    const cookieStore = cookies();
    
    // Get current session to revoke token if possible
    const sessionCookie = cookieStore.get('meta_session');
    let tokenRevoked = false;
    
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        const accessToken = session.accessToken;
        
        // Try to revoke the token via Facebook API
        if (accessToken) {
          const revokeUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`;
          const revokeResponse = await fetch(revokeUrl, { method: 'DELETE' });
          const revokeData = await revokeResponse.json();
          
          if (revokeData.success) {
            tokenRevoked = true;
            aidsLogger.success(LogCategories.AUTH, 'Token Meta révoqué avec succès');
          } else {
            aidsLogger.warning(LogCategories.AUTH, 'Impossible de révoquer le token Meta', revokeData);
          }
        }
      } catch (error) {
        aidsLogger.error(LogCategories.AUTH, 'Erreur lors de la révocation du token', error);
      }
    }
    
    // Clear all Meta-related cookies
    cookieStore.delete('meta_session');
    cookieStore.delete('selected_ad_account');
    
    // Try to clear with different options for better compatibility
    const cookieOptions = {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    
    // Set cookies to expire immediately
    cookieStore.set('meta_session', '', { ...cookieOptions, maxAge: 0 });
    cookieStore.set('selected_ad_account', '', { ...cookieOptions, maxAge: 0 });
    
    aidsLogger.success(LogCategories.AUTH, 'Déconnexion Meta complète', {
      tokenRevoked,
      cookiesCleared: true
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from Meta',
      tokenRevoked
    });

  } catch (error) {
    aidsLogger.critical(LogCategories.AUTH, 'Erreur critique lors de la déconnexion', error);
    console.error('Disconnect error:', error);
    return NextResponse.json({ 
      error: 'Failed to disconnect',
      details: error.message 
    }, { status: 500 });
  }
}