import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request) {
  try {
    const { metrics, campaigns } = await request.json();

    // If no Anthropic API key, return demo insights
    if (!anthropic) {
      return NextResponse.json({
        insights: getDemoInsights(),
        recommendations: getDemoRecommendations(),
        autopilotReady: false
      });
    }

    // Prepare context for Octavia
    const prompt = `Tu es Octavia, l'experte IA en publicité digitale de DigiFlow. Analyse ces métriques de campagnes Meta Ads et fournis des insights précis et des recommandations actionnables.

Métriques actuelles:
- Dépenses totales: ${metrics.overview.totalSpend}€
- Revenus: ${metrics.overview.totalRevenue}€
- ROAS: ${metrics.overview.roas}x
- CTR: ${metrics.overview.ctr}%
- CPC: ${metrics.overview.cpc}€
- Taux de conversion: ${metrics.overview.conversionRate}%
- Campagnes actives: ${metrics.overview.campaigns}
- Publicités actives: ${metrics.overview.activeAds}

Tendances sur 7 jours:
- Évolution CTR: ${JSON.stringify(metrics.trend.ctr)}
- Évolution dépenses: ${JSON.stringify(metrics.trend.spend)}
- Évolution revenus: ${JSON.stringify(metrics.trend.revenue)}

Fournis une analyse au format JSON avec:
1. "insights": Array de 3-4 insights clés (observations importantes sur les performances)
2. "recommendations": Array de 3-4 recommandations concrètes pour améliorer les performances
3. "riskAlerts": Array de 0-2 alertes sur des problèmes potentiels
4. "opportunities": Array de 2-3 opportunités d'optimisation

Chaque élément doit avoir:
- "title": Titre court et percutant
- "description": Description détaillée
- "priority": "high", "medium" ou "low"
- "metric": La métrique concernée
- "impact": L'impact potentiel en pourcentage

Réponds uniquement en JSON valide.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.7,
      system: "Tu es Octavia, une experte en publicité digitale. Tu analyses les performances des campagnes Meta Ads et fournis des recommandations stratégiques. Tu es data-driven, précise et orientée résultats.",
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse AI response
    let aiAnalysis;
    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      aiAnalysis = {
        insights: getDemoInsights(),
        recommendations: getDemoRecommendations()
      };
    }

    return NextResponse.json({
      ...aiAnalysis,
      autopilotReady: true,
      analysisTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing campaigns:', error);
    return NextResponse.json({
      insights: getDemoInsights(),
      recommendations: getDemoRecommendations(),
      autopilotReady: false,
      error: error.message
    });
  }
}

function getDemoInsights() {
  return [
    {
      title: "ROAS en hausse de 15%",
      description: "Vos campagnes génèrent un retour sur investissement de 4.0x, dépassant la moyenne du secteur de 3.2x",
      priority: "high",
      metric: "ROAS",
      impact: "+15%"
    },
    {
      title: "CTR optimal sur mobile",
      description: "Le taux de clic mobile (3.2%) surperforme le desktop (2.1%), concentrez vos efforts sur ce segment",
      priority: "medium",
      metric: "CTR",
      impact: "+52%"
    },
    {
      title: "Pic de conversions le week-end",
      description: "Les conversions augmentent de 38% le samedi et dimanche, moment idéal pour intensifier les enchères",
      priority: "high",
      metric: "Conversions",
      impact: "+38%"
    }
  ];
}

function getDemoRecommendations() {
  return [
    {
      title: "Augmenter le budget des top performers",
      description: "Réallouer 30% du budget des campagnes sous-performantes vers vos 3 meilleures campagnes pourrait augmenter le ROAS de 0.8x",
      priority: "high",
      metric: "Budget",
      impact: "+20%"
    },
    {
      title: "Tester de nouvelles créatives",
      description: "Vos créatives actuelles montrent des signes de fatigue après 14 jours. Lancez 2-3 nouvelles variantes cette semaine",
      priority: "medium",
      metric: "Creative",
      impact: "+15%"
    },
    {
      title: "Optimiser les audiences lookalike",
      description: "Créer des audiences lookalike 1-3% basées sur vos meilleurs clients pourrait réduire le CPA de 25%",
      priority: "high",
      metric: "Audience",
      impact: "-25% CPA"
    },
    {
      title: "Ajuster les enchères par heure",
      description: "Augmenter les enchères de 20% entre 19h et 22h où votre taux de conversion est le plus élevé",
      priority: "medium",
      metric: "Bidding",
      impact: "+12%"
    }
  ];
}