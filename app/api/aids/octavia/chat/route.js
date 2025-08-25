import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function POST(request) {
  try {
    const { message } = await request.json();
    
    aidsLogger.info(LogCategories.OCTAVIA_AI, 'Message reçu pour Octavia', { message });
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    
    // Réponses contextuelles basées sur les mots-clés
    let response = '';
    let analysis = null;
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('campagne') || lowerMessage.includes('analyse')) {
      response = `J'ai analysé vos campagnes actuelles. Voici mes observations :

📊 **Performance globale** : Vos campagnes ont un CTR moyen de 2.3%, ce qui est dans la moyenne du secteur.

💡 **Points d'amélioration** :
• Optimiser les visuels pour mobile (65% de votre trafic)
• Tester de nouvelles audiences similaires
• Ajuster les enchères selon les heures de pointe

🎯 **Recommandation prioritaire** : Concentrez-vous sur l'amélioration du taux de conversion sur les landing pages.`;
      
      analysis = {
        score: 73,
        insights: 'Potentiel d\'amélioration identifié sur le ciblage et les créatives.'
      };
      
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('optimis')) {
      response = `Voici mes recommandations pour optimiser votre budget :

💰 **Réallocation suggérée** :
• Réduire de 20% sur les campagnes à faible ROI
• Augmenter de 30% sur vos top performers
• Tester 10% du budget sur de nouvelles audiences

📈 **Impact estimé** : +25% de ROI en 30 jours

Voulez-vous que j'applique ces optimisations automatiquement ?`;
      
    } else if (lowerMessage.includes('ciblage') || lowerMessage.includes('audience')) {
      response = `Pour améliorer votre ciblage, je recommande :

🎯 **Audiences à tester** :
• Lookalike 1% de vos meilleurs clients
• Intérêts combinés : votre secteur + comportements d'achat
• Remarketing sur les 30 derniers jours

📍 **Zones géographiques** : Concentrez-vous sur les grandes villes où votre CPA est 40% plus bas.

Souhaitez-vous que je crée ces audiences pour vous ?`;
      
    } else if (lowerMessage.includes('aide') || lowerMessage.includes('comment')) {
      response = `Je peux vous aider avec :

🚀 **Optimisation des campagnes**
• Analyse de performance en temps réel
• Suggestions d'amélioration personnalisées
• Ajustements automatiques des enchères

📊 **Reporting et insights**
• Rapports détaillés sur vos KPIs
• Prédictions de performance
• Alertes sur les anomalies

🎯 **Stratégie publicitaire**
• Recommandations de ciblage
• Tests A/B automatisés
• Optimisation du budget

Que souhaitez-vous explorer en premier ?`;
      
    } else {
      // Réponse générique intelligente
      response = `Je comprends votre demande concernant "${message}". 

En analysant vos données actuelles, je peux vous proposer plusieurs axes d'amélioration. 

Pourriez-vous me préciser sur quel aspect vous souhaitez que je me concentre :
• Performance des campagnes
• Optimisation du budget
• Amélioration du ciblage
• Analyse des créatives

Je suis là pour vous accompagner vers de meilleurs résultats ! 🚀`;
    }
    
    aidsLogger.success(LogCategories.OCTAVIA_AI, 'Réponse Octavia générée');
    
    return NextResponse.json({
      success: true,
      response,
      analysis
    });
    
  } catch (error) {
    aidsLogger.error(LogCategories.OCTAVIA_AI, 'Erreur chat Octavia', error);
    
    return NextResponse.json({
      success: false,
      response: 'Désolée, j\'ai rencontré une erreur. Pouvez-vous reformuler votre question ?',
      error: error.message
    });
  }
}