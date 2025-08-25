import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Non connecté à Meta',
        connected: false
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accessToken = session.accessToken;
    
    // Vérifier les permissions du token actuel
    const permissionsUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`;
    
    const response = await fetch(permissionsUrl);
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ 
        error: 'Token invalide ou expiré',
        details: data.error
      }, { status: 401 });
    }
    
    // Extraire les permissions accordées
    const grantedPermissions = [];
    const deniedPermissions = [];
    
    if (data.data) {
      data.data.forEach(perm => {
        if (perm.status === 'granted') {
          grantedPermissions.push(perm.permission);
        } else {
          deniedPermissions.push(perm.permission);
        }
      });
    }
    
    // Vérifier si leads_retrieval est présent
    const hasLeadsRetrieval = grantedPermissions.includes('leads_retrieval');
    
    // Vérifier aussi le debug token pour plus d'infos
    let tokenInfo = null;
    try {
      const debugUrl = `https://graph.facebook.com/v18.0/debug_token?` +
        `input_token=${accessToken}&` +
        `access_token=${accessToken}`;
      
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      
      if (debugData.data) {
        tokenInfo = {
          appId: debugData.data.app_id,
          userId: debugData.data.user_id,
          expiresAt: debugData.data.expires_at,
          isValid: debugData.data.is_valid,
          scopes: debugData.data.scopes || []
        };
      }
    } catch (error) {
      console.log('Debug token error:', error);
    }
    
    return NextResponse.json({
      success: true,
      hasLeadsRetrieval,
      permissions: grantedPermissions,
      deniedPermissions,
      tokenInfo,
      message: hasLeadsRetrieval 
        ? '✅ Permission leads_retrieval active'
        : '❌ Permission leads_retrieval manquante',
      recommendation: !hasLeadsRetrieval 
        ? 'Vous devez réautoriser l\'application avec la permission leads_retrieval'
        : null
    });
    
  } catch (error) {
    console.error('Check permissions error:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification des permissions',
      details: error.message
    }, { status: 500 });
  }
}