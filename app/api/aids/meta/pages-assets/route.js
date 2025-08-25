import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.META_API, 'Récupération Pages & Assets');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie) {
      aidsLogger.error(LogCategories.AUTH, 'Pas de session Meta pour Pages & Assets');
      return NextResponse.json({ 
        error: 'Not authenticated',
        pages: [],
        pixels: []
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accessToken = session.accessToken;
    const accountId = selectedAccountCookie?.value;
    
    // Récupérer les pages Facebook
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?` +
      `fields=id,name,category,fan_count,picture,access_token&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      aidsLogger.error(LogCategories.META_API, 'Erreur API Meta Pages', {
        error: pagesData.error
      });
      
      return NextResponse.json({
        error: pagesData.error.message,
        pages: [],
        pixels: []
      });
    }
    
    const pages = pagesData.data || [];
    
    // Récupérer les pixels si un compte publicitaire est sélectionné
    let pixels = [];
    if (accountId) {
      try {
        const pixelsUrl = `https://graph.facebook.com/v18.0/${accountId}/adspixels?` +
          `fields=id,name,code,last_fired_time,creation_time&` +
          `limit=100&` +
          `access_token=${accessToken}`;
        
        const pixelsResponse = await fetch(pixelsUrl);
        const pixelsData = await pixelsResponse.json();
        
        if (!pixelsData.error) {
          pixels = pixelsData.data || [];
        } else {
          aidsLogger.warning(LogCategories.META_API, 'Erreur récupération pixels', pixelsData.error);
        }
      } catch (error) {
        aidsLogger.warning(LogCategories.META_API, 'Erreur fetch pixels', error);
      }
    }
    
    // Enrichir les données des pages avec plus d'infos
    const enrichedPages = [];
    for (const page of pages) {
      try {
        // Récupérer plus d'infos sur chaque page
        const pageDetailsUrl = `https://graph.facebook.com/v18.0/${page.id}?` +
          `fields=id,name,category,fan_count,picture,about,website,emails,phone&` +
          `access_token=${page.access_token || accessToken}`;
        
        const pageDetailsResponse = await fetch(pageDetailsUrl);
        const pageDetails = await pageDetailsResponse.json();
        
        if (!pageDetails.error) {
          enrichedPages.push({
            ...page,
            ...pageDetails
          });
        } else {
          enrichedPages.push(page);
        }
      } catch (error) {
        enrichedPages.push(page);
      }
    }
    
    aidsLogger.success(LogCategories.META_API, 'Pages & Assets récupérés', {
      pagesCount: enrichedPages.length,
      pixelsCount: pixels.length
    });
    
    return NextResponse.json({
      success: true,
      pages: enrichedPages,
      pixels: pixels
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Erreur critique API Pages & Assets', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch pages and assets',
      details: error.message,
      pages: [],
      pixels: []
    }, { status: 500 });
  }
}