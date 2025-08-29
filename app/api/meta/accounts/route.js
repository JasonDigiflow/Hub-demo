import { NextResponse } from 'next/server';
import { getOrgAdAccounts } from '@/lib/meta-token-manager';

export async function GET(request) {
  try {
    // Récupérer les ad accounts de l'organisation
    const accountsInfo = await getOrgAdAccounts();
    
    if (!accountsInfo.success) {
      return NextResponse.json({
        success: false,
        error: accountsInfo.error,
        accounts: [],
        needsReauth: accountsInfo.error === 'Utilisateur non authentifié'
      });
    }
    
    return NextResponse.json({
      success: true,
      accounts: accountsInfo.accounts,
      orgName: accountsInfo.orgName
    });
    
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des comptes',
      accounts: []
    }, { status: 500 });
  }
}