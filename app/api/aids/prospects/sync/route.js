import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { saveProspectsBatch, getProspects, checkExistingProspects } from '@/app/lib/firebase-prospects';
import { verifyToken } from '@/app/lib/jwt';

export async function POST(request) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await verifyToken(authToken.value);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { prospects, forceSync } = await request.json();
    
    if (!prospects || !Array.isArray(prospects)) {
      return NextResponse.json({ error: 'Invalid prospects data' }, { status: 400 });
    }
    
    // Si forceSync, on sauvegarde tout
    if (forceSync) {
      const savedIds = await saveProspectsBatch(prospects, user.id);
      return NextResponse.json({
        success: true,
        savedCount: savedIds.length,
        message: `${savedIds.length} prospects synchronisés avec succès`
      });
    }
    
    // Sinon, vérifier les doublons
    const prospectIds = prospects.map(p => p.id);
    const existingIds = await checkExistingProspects(prospectIds, user.id);
    
    // Filtrer les nouveaux prospects
    const newProspects = prospects.filter(p => !existingIds.has(p.id));
    
    if (newProspects.length === 0) {
      return NextResponse.json({
        success: true,
        savedCount: 0,
        message: 'Tous les prospects sont déjà enregistrés'
      });
    }
    
    // Sauvegarder les nouveaux prospects
    const savedIds = await saveProspectsBatch(newProspects, user.id);
    
    return NextResponse.json({
      success: true,
      savedCount: savedIds.length,
      message: `${savedIds.length} nouveaux prospects ajoutés`
    });
    
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync prospects',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Récupérer tous les prospects de l'utilisateur
export async function GET(request) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await verifyToken(authToken.value);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Récupérer les prospects depuis Firebase
    const prospects = await getProspects(user.id);
    
    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length
    });
    
  } catch (error) {
    console.error('Get prospects API error:', error);
    return NextResponse.json({ 
      error: 'Failed to get prospects',
      details: error.message 
    }, { status: 500 });
  }
}