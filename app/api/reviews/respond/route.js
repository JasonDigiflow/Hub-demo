import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_PERSONAS, getEnrichedPrompt } from '@/lib/ai-personas';

/**
 * API pour générer des réponses aux avis clients
 * Utilise Clark (IA de Fidalyz) avec le contexte de l'organisation
 */
export async function POST(request) {
  try {
    const { 
      review, 
      organization,
      reviewerName,
      rating,
      platform = 'Google'
    } = await request.json();

    if (!review || !organization) {
      return NextResponse.json(
        { error: 'Avis et organisation requis' },
        { status: 400 }
      );
    }

    // Si l'API Anthropic est configurée
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Utiliser Clark avec le contexte de l'organisation
        const enrichedPrompt = getEnrichedPrompt('clark', {
          organization: {
            name: organization.name,
            sector: organization.sector || 'service',
            tone: organization.tone || 'professionnel et chaleureux',
            values: organization.values || 'excellence, service client, innovation',
            specifics: organization.specifics || ''
          }
        });

        // Créer le prompt spécifique pour cette réponse
        const messages = [
          {
            role: 'system',
            content: enrichedPrompt
          },
          {
            role: 'user',
            content: `Génère une réponse personnalisée à cet avis ${rating}/5 étoiles sur ${platform}.

**Avis de ${reviewerName || 'un client'} :**
"${review}"

**Instructions spécifiques :**
${rating >= 4 ? 
  '- Remercier chaleureusement\n- Mentionner un élément spécifique de leur avis\n- Encourager à revenir ou recommander' :
  rating === 3 ?
  '- Remercier pour le retour constructif\n- Reconnaître les points positifs ET négatifs\n- Proposer une amélioration concrète' :
  '- Remercier pour le retour honnête\n- Présenter des excuses sincères\n- Proposer une solution concrète\n- Inviter à un contact direct pour résoudre le problème'
}

La réponse doit être en français, professionnelle, et ne pas dépasser 150 mots.`
          }
        ];

        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          temperature: 0.7,
          messages: messages
        });

        const aiResponse = response.content[0].text;

        return NextResponse.json({
          response: aiResponse,
          aiGenerated: true,
          persona: 'Clark',
          confidence: 0.95
        });

      } catch (aiError) {
        console.error('Anthropic API error:', aiError);
        // Fallback vers les templates
      }
    }

    // Fallback : Templates de réponses selon la note
    const templates = {
      5: [
        `Bonjour ${reviewerName || ''},\n\nUn immense merci pour votre avis 5 étoiles ! Votre satisfaction est notre plus belle récompense. Nous sommes ravis que notre ${organization.service || 'service'} ait répondu à vos attentes.\n\nAu plaisir de vous revoir très bientôt !\n\nL'équipe ${organization.name}`,
        `Merci infiniment ${reviewerName || ''} pour ce retour si positif ! 🌟\n\nVotre confiance nous touche énormément. Toute l'équipe est heureuse d'avoir contribué à votre satisfaction.\n\nÀ très bientôt !\n\n${organization.name}`
      ],
      4: [
        `Bonjour ${reviewerName || ''},\n\nMerci beaucoup pour votre avis positif ! Nous sommes heureux que vous ayez apprécié notre ${organization.service || 'service'}.\n\nN'hésitez pas à nous faire part de vos suggestions pour atteindre la perfection !\n\nCordialement,\n${organization.name}`
      ],
      3: [
        `Bonjour ${reviewerName || ''},\n\nMerci pour votre retour constructif. Nous prenons note de vos remarques pour améliorer notre service.\n\nNous serions ravis de discuter avec vous pour mieux comprendre vos attentes. N'hésitez pas à nous contacter directement.\n\nBien cordialement,\n${organization.name}`
      ],
      2: [
        `Bonjour ${reviewerName || ''},\n\nNous vous remercions d'avoir pris le temps de partager votre expérience. Nous sommes sincèrement désolés que notre service n'ait pas été à la hauteur.\n\nNous aimerions comprendre ce qui s'est passé et trouver une solution. Pourriez-vous nous contacter directement ?\n\nNos excuses les plus sincères,\n${organization.name}`
      ],
      1: [
        `Bonjour ${reviewerName || ''},\n\nNous sommes profondément désolés de lire votre retour. Cette expérience ne reflète absolument pas nos standards de qualité.\n\nNous prenons votre avis très au sérieux. Notre responsable souhaiterait vous contacter personnellement pour comprendre la situation et vous proposer une solution adaptée.\n\nVeuillez accepter nos excuses les plus sincères.\n\nLa Direction de ${organization.name}`
      ]
    };

    // Sélectionner un template approprié
    const ratingTemplates = templates[rating] || templates[3];
    const selectedTemplate = ratingTemplates[Math.floor(Math.random() * ratingTemplates.length)];

    // Personnaliser avec les éléments de l'avis si possible
    let personalizedResponse = selectedTemplate;
    
    // Extraire des mots-clés de l'avis pour personnaliser
    const keywords = review.toLowerCase().match(/\b(service|qualité|accueil|produit|équipe|rapidité|prix)\b/g);
    if (keywords && keywords.length > 0) {
      const keyword = keywords[0];
      personalizedResponse = personalizedResponse.replace(
        'notre service',
        `notre ${keyword}`
      );
    }

    return NextResponse.json({
      response: personalizedResponse,
      aiGenerated: false,
      persona: 'Clark',
      template: true
    });

  } catch (error) {
    console.error('Review response API error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de la réponse',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET pour tester l'API
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    persona: 'Clark (Fidalyz)',
    capabilities: [
      'Réponses personnalisées aux avis',
      'Adaptation au contexte de l\'organisation',
      'Gestion des avis positifs et négatifs',
      'Support multi-plateforme',
      'Templates de fallback'
    ],
    requiredParams: {
      review: 'Le texte de l\'avis client',
      organization: {
        name: 'Nom de l\'entreprise',
        sector: 'Secteur d\'activité',
        tone: 'Ton de communication',
        values: 'Valeurs de l\'entreprise'
      },
      reviewerName: 'Nom du client (optionnel)',
      rating: 'Note de 1 à 5',
      platform: 'Plateforme (Google, Facebook, etc.)'
    }
  });
}