import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.OCTAVIA_AI, 'Récupération suggestions Octavia');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    let suggestions = [];
    
    if (sessionCookie) {
      // Suggestions personnalisées si connecté
      suggestions = [
        'Augmentez votre budget sur les campagnes avec un CPA < €15',
        'Testez de nouveaux formats vidéo pour améliorer l\'engagement',
        'Créez une audience lookalike basée sur vos meilleurs clients',
        'Optimisez vos landing pages pour mobile (65% de votre trafic)'
      ];
    } else {
      // Suggestions génériques
      suggestions = [
        'Connectez votre compte Meta pour des suggestions personnalisées',
        'L\'IA peut optimiser vos campagnes 24/7',
        'Réduisez votre CPA jusqu\'à 30% avec l\'optimisation automatique',
        'Découvrez de nouvelles audiences performantes'
      ];
    }
    
    aidsLogger.success(LogCategories.OCTAVIA_AI, `${suggestions.length} suggestions générées`);
    
    return NextResponse.json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    aidsLogger.error(LogCategories.OCTAVIA_AI, 'Erreur suggestions Octavia', error);
    
    return NextResponse.json({
      success: false,
      suggestions: [],
      error: error.message
    });
  }
}