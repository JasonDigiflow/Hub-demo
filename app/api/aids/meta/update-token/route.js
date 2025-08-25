import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Token manquant'
      }, { status: 400 });
    }
    
    // Vérifier le token et récupérer les infos utilisateur
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${token}`
    );
    const meData = await meResponse.json();
    
    if (meData.error) {
      return NextResponse.json({ 
        error: 'Token invalide',
        details: meData.error
      }, { status: 400 });
    }
    
    // Vérifier les permissions du token
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`
    );
    const permissionsData = await permissionsResponse.json();
    
    const grantedPermissions = [];
    if (permissionsData.data) {
      permissionsData.data.forEach(perm => {
        if (perm.status === 'granted') {
          grantedPermissions.push(perm.permission);
        }
      });
    }
    
    const hasLeadsRetrieval = grantedPermissions.includes('leads_retrieval');
    
    if (!hasLeadsRetrieval) {
      return NextResponse.json({ 
        error: 'Ce token n\'a pas la permission leads_retrieval',
        permissions: grantedPermissions
      }, { status: 400 });
    }
    
    // Mettre à jour la session avec le nouveau token
    const cookieStore = cookies();
    
    // Créer une nouvelle session avec le token mis à jour
    const newSession = {
      accessToken: token,
      userID: meData.id,
      userName: meData.name,
      userEmail: meData.email,
      updatedToken: true,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder dans un cookie HTTP-only
    cookieStore.set('meta_session', JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 jours
    });
    
    // Récupérer les comptes publicitaires avec le nouveau token
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&limit=100&access_token=${token}`
    );
    const accountsData = await accountsResponse.json();
    
    // Si des comptes sont trouvés, sélectionner le premier
    if (accountsData.data && accountsData.data.length > 0) {
      const firstAccount = accountsData.data[0];
      cookieStore.set('selected_ad_account', firstAccount.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ Token mis à jour avec succès',
      permissions: grantedPermissions,
      hasLeadsRetrieval: true,
      user: {
        id: meData.id,
        name: meData.name,
        email: meData.email
      },
      accountsCount: accountsData.data?.length || 0
    });
    
  } catch (error) {
    console.error('Update token error:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du token',
      details: error.message
    }, { status: 500 });
  }
}