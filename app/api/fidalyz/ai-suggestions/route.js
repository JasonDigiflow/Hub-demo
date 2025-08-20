import { NextResponse } from 'next/server';

// Générateur de suggestions IA pour les réponses
function generateAISuggestion(review) {
  const templates = {
    positive: [
      `Merci beaucoup ${review.author} pour votre retour positif ! Nous sommes ravis que notre service vous ait satisfait. Au plaisir de vous revoir très bientôt !`,
      `Wow, merci ${review.author} ! Votre avis nous touche énormément. C'est grâce à des clients comme vous que nous continuons à nous améliorer chaque jour.`,
      `Quelle joie de lire votre commentaire ${review.author} ! Votre satisfaction est notre plus belle récompense. À très bientôt !`
    ],
    neutral: [
      `Bonjour ${review.author}, merci pour votre retour constructif. Nous prenons note de vos remarques et travaillons constamment à améliorer nos services. N'hésitez pas à nous contacter directement pour en discuter.`,
      `Merci ${review.author} pour votre avis. Nous apprécions votre franchise et aimerions comprendre comment mieux répondre à vos attentes. Contactez-nous pour en parler !`,
      `Bonjour ${review.author}, nous vous remercions d'avoir pris le temps de partager votre expérience. Vos suggestions nous aident à progresser.`
    ],
    negative: [
      `Bonjour ${review.author}, nous sommes sincèrement désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Nous aimerions vraiment comprendre ce qui s'est passé. Pourriez-vous nous contacter directement pour en discuter ?`,
      `${review.author}, nous prenons votre retour très au sérieux. Ce n'est pas l'expérience que nous souhaitons offrir. Notre responsable va vous contacter dans les plus brefs délais pour résoudre cette situation.`,
      `Nous sommes vraiment navrés ${review.author}. Votre satisfaction est primordiale pour nous. Merci de nous donner l'opportunité de corriger cette situation. Contactez-nous au plus vite.`
    ]
  };

  const sentimentTemplates = templates[review.sentiment] || templates.neutral;
  const randomIndex = Math.floor(Math.random() * sentimentTemplates.length);
  
  return sentimentTemplates[randomIndex];
}

export async function POST(request) {
  try {
    const { review } = await request.json();

    if (!review) {
      return NextResponse.json(
        { error: 'Avis requis pour générer une suggestion' },
        { status: 400 }
      );
    }

    // Analyser le sentiment (simulation)
    let sentiment = 'neutral';
    if (review.rating >= 4) sentiment = 'positive';
    else if (review.rating <= 2) sentiment = 'negative';

    // Générer plusieurs suggestions
    const suggestions = [
      {
        id: '1',
        text: generateAISuggestion({ ...review, sentiment }),
        tone: 'professional',
        confidence: 0.95
      },
      {
        id: '2',
        text: generateAISuggestion({ ...review, sentiment }),
        tone: 'friendly',
        confidence: 0.92
      },
      {
        id: '3',
        text: generateAISuggestion({ ...review, sentiment }),
        tone: 'empathetic',
        confidence: 0.88
      }
    ];

    // Analyse des points clés
    const keyPoints = [];
    if (review.text) {
      if (review.text.toLowerCase().includes('service')) keyPoints.push('service');
      if (review.text.toLowerCase().includes('prix')) keyPoints.push('prix');
      if (review.text.toLowerCase().includes('qualité')) keyPoints.push('qualité');
      if (review.text.toLowerCase().includes('délai')) keyPoints.push('délais');
      if (review.text.toLowerCase().includes('équipe')) keyPoints.push('équipe');
    }

    return NextResponse.json({
      suggestions,
      sentiment,
      keyPoints,
      recommendedAction: sentiment === 'negative' ? 'urgent' : 'normal'
    });
  } catch (error) {
    console.error('Generate AI suggestion error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    );
  }
}