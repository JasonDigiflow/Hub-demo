import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_PERSONAS, getEnrichedPrompt, getRelevantPersona, addMemory } from '@/lib/ai-personas';

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

        // Utiliser Ava comme persona principal du chatbot
        const enrichedPrompt = getEnrichedPrompt('ava', {
          history: history
        });

        // Construire le contexte avec le persona Ava
        const messages = [
          {
            role: 'system',
            content: enrichedPrompt
          },
          {
            role: 'user',
            content: message
          }
        ];

        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          temperature: 0.7,
          messages: messages
        });

        const aiResponse = response.content[0].text;

        // Ajouter à la mémoire si c'est une information importante
        if (message.includes('mon nom est') || message.includes('je suis')) {
          addMemory('ava', `Client: ${message}`);
        }

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
      'bonjour': 'Bonjour ! 👋 Je suis Ava, votre assistante virtuelle DigiFlow. Comment puis-je vous aider aujourd\'hui ?',
      'aide': 'Je suis Ava, et je peux vous présenter nos 8 applications gérées par mes collègues IA : Clark (Fidalyz), Octavia (AIDs), Jerry (SEOly), Claude (Supportia), Valérie (Salesia), Lexa (Lexa), Papin (CashFlow) et Eden (Eden). Que souhaitez-vous savoir ?',
      'contact': 'Pour nous contacter : support@digiflow.com ou utilisez le formulaire de contact. Notre équipe répond sous 24h.',
      
      // Default
      'default': 'Je suis Ava, votre assistante DigiFlow. Je peux vous orienter vers la bonne solution parmi nos 8 applications. Dites-moi quel est votre besoin principal !'
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