import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (server-side only)
let anthropic = null;

if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Génère une suggestion de réponse pour un avis client
 */
export async function generateReviewResponse(review) {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const prompt = `Tu es Zoë, l'assistant IA de Fidalyz spécialisé dans la gestion de la réputation en ligne. 
Tu dois générer 3 suggestions de réponses professionnelles pour cet avis client.

Avis client:
- Auteur: ${review.author}
- Note: ${review.rating}/5
- Source: ${review.source}
- Commentaire: ${review.text}

Analyse le sentiment et génère 3 réponses avec des tons différents:
1. Professionnel et formel
2. Amical et chaleureux
3. Empathique et compréhensif

Pour chaque réponse:
- Adapte le ton au sentiment de l'avis (positif, neutre ou négatif)
- Reste concis (max 3-4 phrases)
- Personnalise avec le nom du client
- Si négatif, propose une solution ou un contact
- Si positif, remercie et encourage le partage

Format de réponse JSON uniquement.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: "Tu es un assistant spécialisé dans la gestion de la réputation en ligne. Tu réponds uniquement en JSON valide.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parser la réponse JSON
    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback si pas de JSON valide
    return {
      suggestions: [
        {
          tone: 'professional',
          text: `Merci ${review.author} pour votre retour. Nous prenons en compte vos commentaires pour améliorer nos services.`,
          confidence: 0.8
        },
        {
          tone: 'friendly',
          text: `Bonjour ${review.author} ! Merci d'avoir pris le temps de partager votre expérience avec nous.`,
          confidence: 0.7
        },
        {
          tone: 'empathetic',
          text: `${review.author}, nous comprenons votre point de vue et apprécions votre franchise. Votre satisfaction est notre priorité.`,
          confidence: 0.75
        }
      ],
      sentiment: review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral'
    };
  } catch (error) {
    console.error('Error generating review response:', error);
    throw error;
  }
}

/**
 * Génère un post Google Business
 */
export async function generateGooglePost(businessInfo, topic) {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const prompt = `Génère un post Google Business professionnel pour:
Entreprise: ${businessInfo.name}
Secteur: ${businessInfo.industry}
Sujet: ${topic}

Le post doit:
- Être engageant et professionnel
- Maximum 1500 caractères
- Inclure un appel à l'action
- Utiliser des emojis avec parcimonie
- Être optimisé pour le SEO local

Format JSON avec: title, content, callToAction, hashtags`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.8,
      system: "Tu es un expert en marketing digital et SEO local. Réponds uniquement en JSON valide.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      title: `${topic} chez ${businessInfo.name}`,
      content: `Découvrez nos dernières nouveautés ! Nous sommes ravis de vous présenter ${topic}.`,
      callToAction: "Visitez-nous ou contactez-nous pour en savoir plus",
      hashtags: ['#local', '#business', '#nouveauté']
    };
  } catch (error) {
    console.error('Error generating Google post:', error);
    throw error;
  }
}

/**
 * Analyse le sentiment d'un texte
 */
export async function analyzeSentiment(text) {
  if (!anthropic) {
    return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0.3,
      system: "Analyse le sentiment du texte. Réponds en JSON avec: sentiment (positive/neutral/negative), confidence (0-1), keywords (array).",
      messages: [
        {
          role: 'user',
          content: `Analyse le sentiment de ce texte: "${text}"`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
  }
}

export default anthropic;