import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.META_API, 'Récupération données Business Manager');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    if (!sessionCookie) {
      aidsLogger.error(LogCategories.AUTH, 'Pas de session Meta pour Business Manager');
      return NextResponse.json({ 
        error: 'Not authenticated',
        business: null
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accessToken = session.accessToken;
    
    // Récupérer les business managers de l'utilisateur
    const businessUrl = `https://graph.facebook.com/v18.0/me/businesses?` +
      `fields=id,name,created_time,timezone,verification_status,primary_page&` +
      `access_token=${accessToken}`;
    
    const response = await fetch(businessUrl);
    const data = await response.json();
    
    if (data.error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur API Meta Business Manager', {
        error: data.error
      });
      
      return NextResponse.json({
        error: data.error.message,
        business: null
      });
    }
    
    let businessData = null;
    
    if (data.data && data.data.length > 0) {
      const business = data.data[0]; // Prendre le premier business
      
      // Récupérer plus de détails sur le business
      try {
        // Récupérer les comptes publicitaires
        const adAccountsUrl = `https://graph.facebook.com/v18.0/${business.id}/owned_ad_accounts?` +
          `fields=id,name,account_status,currency,amount_spent&` +
          `limit=50&` +
          `access_token=${accessToken}`;
        
        const adAccountsResponse = await fetch(adAccountsUrl);
        const adAccountsData = await adAccountsResponse.json();
        
        // Récupérer les utilisateurs
        const usersUrl = `https://graph.facebook.com/v18.0/${business.id}/business_users?` +
          `fields=id,name,email,role&` +
          `limit=50&` +
          `access_token=${accessToken}`;
        
        const usersResponse = await fetch(usersUrl);
        const usersData = await usersResponse.json();
        
        // Récupérer les pages
        const pagesUrl = `https://graph.facebook.com/v18.0/${business.id}/owned_pages?` +
          `fields=id,name,category,fan_count&` +
          `limit=50&` +
          `access_token=${accessToken}`;
        
        const pagesResponse = await fetch(pagesUrl);
        const pagesData = await pagesResponse.json();
        
        businessData = {
          ...business,
          ad_accounts: adAccountsData.data || [],
          users: usersData.data || [],
          pages: pagesData.data || []
        };
        
        aidsLogger.success(LogCategories.META_API, 'Données Business Manager récupérées', {
          businessId: business.id,
          adAccountsCount: businessData.ad_accounts.length,
          usersCount: businessData.users.length,
          pagesCount: businessData.pages.length
        });
        
      } catch (detailError) {
        aidsLogger.warning(LogCategories.META_API, 'Erreur récupération détails Business Manager', detailError);
        businessData = business;
      }
    }
    
    return NextResponse.json({
      success: true,
      business: businessData
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Erreur critique API Business Manager', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch business data',
      details: error.message,
      business: null
    }, { status: 500 });
  }
}