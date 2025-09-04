import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { siret } = await request.json();
    
    if (!siret) {
      return NextResponse.json(
        { error: 'SIRET requis' },
        { status: 400 }
      );
    }

    // Nettoyer le SIRET
    const cleanedSiret = siret.replace(/\s/g, '');
    
    // Pour l'instant, on retourne toujours false car on ne peut pas
    // vérifier côté serveur sans firebase-admin configuré
    // TODO: Configurer firebase-admin avec les bonnes credentials
    
    return NextResponse.json({
      exists: false,
      mock: true // Indique que c'est une réponse mockée
    });

  } catch (error) {
    console.error('Error checking organization:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}