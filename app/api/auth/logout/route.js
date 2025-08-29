import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Supprimer TOUS les cookies de session
    const cookiesToDelete = [
      'auth_token',
      'auth-token',
      'meta_session',
      'selected_ad_account',
      'meta_auth_state',
      'NEXT_LOCALE'
    ];
    
    cookiesToDelete.forEach(cookieName => {
      try {
        cookieStore.delete(cookieName);
        // Aussi essayer de supprimer avec path explicite
        cookieStore.set(cookieName, '', {
          maxAge: 0,
          path: '/'
        });
      } catch (e) {
        // Ignorer les erreurs si le cookie n'existe pas
      }
    });
    
    // Réponse avec header pour nettoyer localStorage côté client
    const response = NextResponse.json({ 
      success: true,
      message: 'Déconnexion complète effectuée'
    });
    
    response.headers.set('X-Clear-Storage', 'true');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}