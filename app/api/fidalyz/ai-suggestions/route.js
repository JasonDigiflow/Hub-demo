import { NextResponse } from 'next/server';
import { generateReviewResponse, analyzeSentiment } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const { review } = await request.json();

    if (!review) {
      return NextResponse.json(
        { error: 'Avis requis pour générer une suggestion' },
        { status: 400 }
      );
    }

    // Si l'API Anthropic est configurée, utiliser l'IA réelle
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Analyser le sentiment
        const sentimentData = await analyzeSentiment(review.text);
        
        // Générer les suggestions avec l'IA
        const aiResponse = await generateReviewResponse(review);
        
        return NextResponse.json({
          suggestions: aiResponse.suggestions || [],
          sentiment: sentimentData.sentiment,
          keyPoints: sentimentData.keywords || [],
          confidence: sentimentData.confidence,
          recommendedAction: sentimentData.sentiment === 'negative' ? 'urgent' : 'normal',
          aiGenerated: true
        });
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Fallback vers les suggestions mock si l'IA échoue
      }
    }

    // Fallback: Suggestions mock si pas d'API key ou en cas d'erreur
    const sentiment = review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral';
    
    const templates = {
      positive: [
        `Merci beaucoup ${review.author} pour votre retour positif ! Nous sommes ravis que notre service vous ait satisfait. Au plaisir de vous revoir très bientôt !`,
        `Wow, merci ${review.author} ! Votre avis nous touche énormément. C'est grâce à des clients comme vous que nous continuons à nous améliorer chaque jour.`,
        `Quelle joie de lire votre commentaire ${review.author} ! Votre satisfaction est notre plus belle récompense. À très bientôt !`
      ],
      neutral: [
        `Bonjour ${review.author}, merci pour votre retour constructif. Nous prenons note de vos remarques et travaillons constamment à améliorer nos services.`,
        `Merci ${review.author} pour votre avis. Nous apprécions votre franchise et aimerions comprendre comment mieux répondre à vos attentes.`,
        `Bonjour ${review.author}, nous vous remercions d'avoir pris le temps de partager votre expérience. Vos suggestions nous aident à progresser.`
      ],
      negative: [
        `Bonjour ${review.author}, nous sommes sincèrement désolés que votre expérience n'ait pas été à la hauteur. Nous aimerions vraiment comprendre ce qui s'est passé.`,
        `${review.author}, nous prenons votre retour très au sérieux. Ce n'est pas l'expérience que nous souhaitons offrir. Notre responsable va vous contacter.`,
        `Nous sommes vraiment navrés ${review.author}. Votre satisfaction est primordiale pour nous. Merci de nous donner l'opportunité de corriger cette situation.`
      ]
    };

    const selectedTemplates = templates[sentiment];
    const suggestions = selectedTemplates.map((text, index) => ({
      id: `${index + 1}`,
      text,
      tone: ['professional', 'friendly', 'empathetic'][index],
      confidence: 0.85 - (index * 0.05)
    }));

    // Analyse des points clés
    const keyPoints = [];
    if (review.text) {
      const lowerText = review.text.toLowerCase();
      if (lowerText.includes('service')) keyPoints.push('service');
      if (lowerText.includes('prix')) keyPoints.push('prix');
      if (lowerText.includes('qualité')) keyPoints.push('qualité');
      if (lowerText.includes('délai')) keyPoints.push('délais');
      if (lowerText.includes('équipe')) keyPoints.push('équipe');
    }

    return NextResponse.json({
      suggestions,
      sentiment,
      keyPoints,
      recommendedAction: sentiment === 'negative' ? 'urgent' : 'normal',
      aiGenerated: false
    });
  } catch (error) {
    console.error('Generate AI suggestion error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    );
  }
}