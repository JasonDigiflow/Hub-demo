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
      'digiflow': 'DigiFlow est une plateforme tout-en-un qui automatise et optimise votre business avec 8 applications intelligentes. Actuellement, Fidalyz est déployée et les 7 autres arrivent progressivement en 2025.',
      'fidalyz': 'Fidalyz est notre première application déployée ! Gérée par Clark, elle automatise votre réputation en ligne : réponses IA aux avis, collecte SMS/NFC, posts Google Business. Déjà 2.5k+ utilisateurs satisfaits !',
      'pourquoi': 'Excellente question ! Fidalyz est notre première app déployée car la gestion de réputation est le besoin #1. Les 7 autres applications arrivent progressivement au Q1-Q2 2025. Voulez-vous une démo de Fidalyz ?',
      'accès': 'Pour l\'instant, seule Fidalyz est accessible. C\'est notre produit phare avec d\'excellents résultats ! Les autres apps (AIDs, SEOly, Supportia...) arrivent très bientôt. Voulez-vous être notifié ?',
      'autres': 'Les 7 autres applications arrivent progressivement ! Supportia (janvier), AIDs (février), SEOly (mars)... Je peux vous mettre en liste d\'attente prioritaire. En attendant, découvrez Fidalyz !',
      'tarif': 'Fidalyz est à 49€/mois avec 14 jours d\'essai gratuit. Les autres apps auront des tarifs similaires. Pack complet prévu à tarif préférentiel !',
      'demo': 'Accédez à la démo Fidalyz : jason@behype-app.com / Demo123. Les démos des autres apps seront disponibles à leur lancement.',
      'essai': '14 jours d\'essai gratuit sur Fidalyz, sans carte ! Les autres apps auront aussi leur période d\'essai à leur sortie.',
      
      // Questions générales
      'bonjour': 'Bonjour ! 👋 Je suis Ava, votre assistante virtuelle DigiFlow. Comment puis-je vous aider aujourd\'hui ?',
      'aide': 'Je suis Ava, et je peux vous présenter nos 8 applications gérées par mes collègues IA : Clark (Fidalyz), Octavia (AIDs), Jerry (SEOly), Claude (Supportia), Valérie (Salesia), Lexa (Lexa), Papin (CashFlow) et Eden (Eden). Que souhaitez-vous savoir ?',
      'contact': 'Pour nous contacter : support@digiflow.com ou utilisez le formulaire de contact. Notre équipe répond sous 24h.',
      
      // Default
      'default': 'Je suis Ava, votre assistante DigiFlow. Actuellement, Fidalyz (gestion réputation) est disponible et les 7 autres apps arrivent en 2025. Comment puis-je vous aider ?'
    };

    // Chercher une réponse correspondante
    const messageLower = message.toLowerCase();
    let response = fallbackResponses.default;

    // Questions spécifiques sur l'accès limité
    if (messageLower.includes('pourquoi') && (messageLower.includes('fidalyz') || messageLower.includes('seul') || messageLower.includes('accès'))) {
      response = fallbackResponses.pourquoi;
    } else if (messageLower.includes('autres') || messageLower.includes('reste') || messageLower.includes('quand')) {
      response = fallbackResponses.autres;
    } else if (messageLower.includes('accès') || messageLower.includes('disponible')) {
      response = fallbackResponses.accès;
    } else {
      // Recherche normale par mots-clés
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (messageLower.includes(key)) {
          response = value;
          break;
        }
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