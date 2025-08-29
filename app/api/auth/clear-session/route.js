import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    
    // Supprimer tous les cookies de session
    const cookiesToClear = [
      'meta_session',
      'selected_ad_account',
      'auth-token',
      'meta_auth_state'
    ];
    
    cookiesToClear.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });
    
    // Nettoyer localStorage côté client via header
    const response = NextResponse.json({ 
      success: true,
      message: 'Session cleared'
    });
    
    // Ajouter un header pour signaler au client de nettoyer localStorage
    response.headers.set('X-Clear-Storage', 'true');
    
    return response;
    
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json({ 
      error: 'Failed to clear session',
      details: error.message 
    }, { status: 500 });
  }
}