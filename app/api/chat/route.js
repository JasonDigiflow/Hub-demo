import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Si l'API Anthropic est configurée, utiliser l'IA réelle
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Construire le contexte avec l'historique
        const messages = [
          {
            role: 'user',
            content: `Tu es l'assistant IA de DigiFlow, une plateforme d'automatisation business. 
Tu dois être utile, professionnel et concis. Tu connais bien les 8 applications de DigiFlow :
- Fidalyz (gestion e-réputation)
- AIDs (optimisation publicitaire)
- SEOly (SEO automatisé)
- Supportia (support client IA)
- Salesia (automatisation commerciale)
- Lexa (contrats légaux)
- CashFlow (gestion financière)
- Eden (business intelligence)

Réponds en français de manière naturelle et engageante.

Question de l'utilisateur : ${message}`
          }
        ];

        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          temperature: 0.7,
          messages: messages
        });

        const aiResponse = response.content[0].text;

        return NextResponse.json({
          response: aiResponse,
          aiGenerated: true
        });
      } catch (aiError) {
        console.error('Anthropic API error:', aiError);
        // Fallback vers les réponses pré-définies
      }
    }

    // Fallback : Réponses pré-définies si pas d'API Anthropic
    const fallbackResponses = {
      // Questions sur DigiFlow
      'digiflow': 'DigiFlow est une plateforme tout-en-un qui automatise et optimise votre business avec 8 applications intelligentes. Chaque app est spécialisée dans un domaine clé de votre entreprise.',
      'fidalyz': 'Fidalyz est notre application de gestion de réputation. Elle répond automatiquement aux avis clients avec l\'IA, collecte des avis par SMS/NFC et publie des posts Google Business.',
      'tarif': 'Nos tarifs démarrent à 49€/mois par application. Essai gratuit de 14 jours disponible. Contactez-nous pour un devis personnalisé !',
      'demo': 'Vous pouvez accéder à la démo de Fidalyz en vous connectant avec : jason@behype-app.com / Demo123',
      'essai': 'Profitez de 14 jours d\'essai gratuit sans carte bancaire ! Cliquez sur "Essai gratuit" pour commencer.',
      
      // Questions générales
      'bonjour': 'Bonjour ! 👋 Je suis l\'assistant DigiFlow. Comment puis-je vous aider aujourd\'hui ?',
      'aide': 'Je peux vous renseigner sur nos 8 applications, les tarifs, ou vous aider à démarrer votre essai gratuit. Que souhaitez-vous savoir ?',
      'contact': 'Pour nous contacter : support@digiflow.com ou utilisez le formulaire de contact. Notre équipe répond sous 24h.',
      
      // Default
      'default': 'Je suis là pour répondre à vos questions sur DigiFlow et ses applications. N\'hésitez pas à me demander des informations sur Fidalyz, les tarifs, ou comment démarrer votre essai gratuit !'
    };

    // Chercher une réponse correspondante
    const messageLower = message.toLowerCase();
    let response = fallbackResponses.default;

    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (messageLower.includes(key)) {
        response = value;
        break;
      }
    }

    return NextResponse.json({
      response,
      aiGenerated: false
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du message',
        response: 'Désolé, je rencontre un problème technique. Veuillez réessayer.'
      },
      { status: 500 }
    );
  }
}