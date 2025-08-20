import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AVA_CONCISE_PROMPT } from '@/lib/ai-personas-concise';

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

        // Utiliser la version CONCISE d'Ava (max 3 phrases)
        const messages = [
          {
            role: 'system',
            content: AVA_CONCISE_PROMPT
          },
          {
            role: 'user',
            content: message
          }
        ];

        const response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022', // Dernière version de Haiku
          max_tokens: 200, // Réduit pour forcer la concision
          temperature: 0.7,
          messages: messages
        });

        const aiResponse = response.content[0].text;

        return NextResponse.json({
          response: aiResponse,
          aiGenerated: true,
          persona: 'Ava'
        });
      } catch (aiError) {
        console.error('Anthropic API error:', aiError);
        // Fallback vers les réponses pré-définies
      }
    }

    // Fallback : Réponses CONCISES pré-définies
    const fallbackResponses = {
      // Questions sur DigiFlow
      'digiflow': 'DigiFlow Hub est une plateforme d\'automatisation business par IA. 8 applications IA, dont Fidalyz disponible actuellement.',
      'fidalyz': 'Fidalyz gère votre e-réputation avec l\'IA Clark. Prix : 49€/mois, essai 14 jours gratuit.',
      'fondateur': 'Jason Sotoca est le fondateur de DigiFlow Hub.',
      'jason': 'Jason Sotoca est le CEO et fondateur de DigiFlow Hub.',
      'prix': 'Fidalyz : 49€/mois. Packs à venir : Starter 119€, Growth 189€, Ultimate 299€.',
      'tarif': 'Fidalyz : 49€/mois. Essai gratuit 14 jours disponible.',
      'demo': 'Accès démo : jason@behype-app.com / Demo123',
      'sécurité': 'DigiFlow est totalement sécurisé. Serveurs en France, RGPD compliant, données chiffrées.',
      'sécurisé': 'Oui, totalement sécurisé. Serveurs français, conformité RGPD, chiffrement AES-256.',
      'rgpd': 'DigiFlow est 100% conforme RGPD. Données hébergées en France.',
      'pourquoi': 'Nous perfectionnons chaque app avant lancement. Les 7 autres arrivent en 2025.',
      'quand': 'Supportia en janvier, AIDs en février, puis une app par mois jusqu\'en juillet.',
      'différence': 'HubSpot : vous faites le travail. DigiFlow : l\'IA fait le travail à votre place.',
      'concurrent': 'Contrairement à Monday ou HubSpot, nos IA font le travail, pas juste l\'assister.',
      'contact': 'Support : support@digiflow.com. Site : digiflow-agency.fr.',
      'essai': '14 jours d\'essai gratuit sur Fidalyz, sans carte bancaire.',
      'résultat': 'Fidalyz : +0.8 étoiles en moyenne, +47% d\'avis positifs.',
      
      // Questions générales
      'bonjour': 'Bonjour ! Je suis Ava, assistante DigiFlow. Comment puis-je vous aider ?',
      'aide': 'Je peux vous informer sur DigiFlow et Fidalyz. Que souhaitez-vous savoir ?',
      
      // Default
      'default': 'Je n\'ai pas cette information précise. Contactez support@digiflow.com pour plus de détails.'
    };

    // Chercher une réponse correspondante
    const messageLower = message.toLowerCase();
    let response = fallbackResponses.default;

    // Recherche par mots-clés
    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (messageLower.includes(key)) {
        response = value;
        break;
      }
    }

    return NextResponse.json({
      response,
      aiGenerated: false,
      persona: 'Ava'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement',
        response: 'Désolé, erreur technique. Réessayez ou contactez support@digiflow.com.'
      },
      { status: 500 }
    );
  }
}