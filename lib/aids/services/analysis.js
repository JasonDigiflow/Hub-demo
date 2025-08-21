/**
 * Service d'analyse par Octavia (IA)
 * Analyse les métriques et génère des décisions stratégiques
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalysisService {
  constructor(config) {
    this.config = config;
    this.llm = this.initializeLLM();
  }

  initializeLLM() {
    if (this.config.isLiveMode() && this.config.getLLMConfig().apiKey) {
      return new Anthropic({
        apiKey: this.config.getLLMConfig().apiKey
      });
    }
    return null;
  }

  /**
   * Analyse les métriques et génère des décisions
   */
  async analyze(metrics) {
    if (this.config.isLiveMode() && this.llm) {
      return await this.analyzeWithLLM(metrics);
    } else {
      return this.generateDemoDecisions(metrics);
    }
  }

  /**
   * Analyse avec LLM (Octavia)
   */
  async analyzeWithLLM(metrics) {
    const prompt = this.buildAnalysisPrompt(metrics);
    
    try {
      const response = await this.llm.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0.7,
        system: `Tu es Octavia, l'IA experte en publicité digitale d'AIDs. 
Tu analyses les performances des campagnes Meta et génères des décisions stratégiques.
Tu es data-driven, créative et obsédée par le ROI.
Réponds UNIQUEMENT avec un JSON valide contenant un array de décisions.`,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const decisions = JSON.parse(response.content[0].text);
      return this.validateDecisions(decisions);
    } catch (error) {
      console.error('LLM Analysis Error:', error);
      return this.generateDemoDecisions(metrics);
    }
  }

  /**
   * Construit le prompt d'analyse
   */
  buildAnalysisPrompt(metrics) {
    return `Analyse ces métriques de campagnes Meta et génère des décisions d'optimisation :

MÉTRIQUES AGRÉGÉES :
- Spend total : $${metrics.aggregated?.totalSpend || 0}
- ROAS : ${metrics.aggregated?.roas || 0}x
- CTR moyen : ${metrics.aggregated?.avgCTR || 0}%
- CPC moyen : $${metrics.aggregated?.avgCPC || 0}
- Taux de conversion : ${metrics.aggregated?.conversionRate || 0}%

CAMPAGNES (${metrics.campaigns} actives) :
${JSON.stringify(metrics.data?.slice(0, 3), null, 2)}

CONTEXTE :
- Objectif : Maximiser le ROAS tout en maintenant le volume
- Budget journalier : $1000
- Seuils : CTR minimum 1.5%, ROAS minimum 3x

Génère un JSON avec des décisions sous ce format :
[
  {
    "type": "GENERATE_CREATIVE|PAUSE_UNDERPERFORMER|BUDGET_REALLOCATE|DUPLICATE_ADSET_FOR_TEST|PROMOTE_WINNER",
    "priority": "high|medium|low",
    "reason": "Explication claire",
    "targetId": "ID de l'élément ciblé",
    "params": { /* paramètres spécifiques */ }
  }
]

Limite-toi à 5 décisions maximum, les plus impactantes.`;
  }

  /**
   * Génère des décisions demo intelligentes
   */
  generateDemoDecisions(metrics) {
    const decisions = [];
    
    // Analyser les performances
    const avgCTR = metrics.aggregated?.avgCTR || 2;
    const roas = metrics.aggregated?.roas || 3;
    
    // Décision 1 : Générer un créatif si CTR faible
    if (avgCTR < 2) {
      decisions.push({
        type: 'GENERATE_CREATIVE',
        priority: 'high',
        reason: `CTR moyen de ${avgCTR.toFixed(1)}% est sous l'objectif de 2%. Nouveau créatif nécessaire.`,
        targetId: 'demo_campaign_0',
        params: {
          campaignId: 'demo_campaign_0',
          adSetId: 'demo_adset_0_0',
          context: {
            objective: 'Améliorer le CTR',
            angle: 'Benefit-focused',
            tone: 'Urgent mais positif',
            headline: 'Dernière chance - Offre limitée',
            description: 'Profitez de -30% maintenant',
            ctaButton: 'Shop Now'
          }
        }
      });
    }

    // Décision 2 : Réallouer le budget si ROAS élevé
    if (roas > 4) {
      decisions.push({
        type: 'BUDGET_REALLOCATE',
        priority: 'high',
        reason: `ROAS de ${roas.toFixed(1)}x dépasse l'objectif. Augmenter le budget des top performers.`,
        from: 'demo_campaign_2',
        to: 'demo_campaign_0',
        amount: 200,
        params: {
          strategy: 'shift_to_winners'
        }
      });
    }

    // Décision 3 : Créer un test A/B
    if (Math.random() > 0.5) {
      decisions.push({
        type: 'DUPLICATE_ADSET_FOR_TEST',
        priority: 'medium',
        reason: 'Tester une nouvelle audience pour améliorer la conversion',
        targetId: 'demo_adset_0_0',
        params: {
          experimentName: 'Audience Test - Lookalike vs Interest',
          hypothesis: 'Les lookalikes 1% convertiront mieux que les interest-based',
          variants: [
            { name: 'Control - Interest', audienceType: 'interest' },
            { name: 'Test - Lookalike 1%', audienceType: 'lookalike' }
          ],
          budget: 100,
          duration: 7
        }
      });
    }

    // Décision 4 : Mettre en pause les sous-performants
    const underperformers = metrics.data?.flatMap(c => 
      c.adSets.flatMap(as => 
        as.ads.filter(ad => {
          const adMetrics = ad.metrics?.[0];
          return adMetrics && adMetrics.ctr < 1;
        })
      )
    ) || [];

    if (underperformers.length > 0) {
      decisions.push({
        type: 'PAUSE_UNDERPERFORMER',
        priority: 'medium',
        reason: `${underperformers.length} ads avec CTR < 1%. Pause pour optimiser le budget.`,
        targetId: underperformers[0]?.id || 'demo_ad_2_0_0',
        params: {
          threshold: { metric: 'ctr', value: 1 }
        }
      });
    }

    // Décision 5 : Promouvoir un gagnant
    if (Math.random() > 0.6) {
      decisions.push({
        type: 'PROMOTE_WINNER',
        priority: 'low',
        reason: 'Ad performante identifiée après période de test',
        targetId: 'demo_ad_0_0_0',
        params: {
          boostBudget: 50,
          expandTargeting: true
        }
      });
    }

    return decisions.slice(0, 5); // Max 5 décisions
  }

  /**
   * Valide et nettoie les décisions
   */
  validateDecisions(decisions) {
    const validTypes = [
      'GENERATE_CREATIVE',
      'PAUSE_UNDERPERFORMER', 
      'BUDGET_REALLOCATE',
      'DUPLICATE_ADSET_FOR_TEST',
      'PROMOTE_WINNER'
    ];

    return decisions
      .filter(d => validTypes.includes(d.type))
      .map(d => ({
        ...d,
        priority: d.priority || 'medium',
        timestamp: new Date().toISOString()
      }));
  }

  /**
   * Génère des recommandations
   */
  async getRecommendations() {
    return [
      {
        type: 'optimization',
        title: 'Optimiser les heures de diffusion',
        description: 'Les performances sont 40% meilleures entre 18h et 22h',
        impact: 'high',
        estimatedGain: '+15% CTR'
      },
      {
        type: 'creative',
        title: 'Rafraîchir les créatifs',
        description: 'Les créatifs actuels montrent des signes de fatigue après 14 jours',
        impact: 'medium',
        estimatedGain: '+0.5% CTR'
      },
      {
        type: 'audience',
        title: 'Exclure les convertisseurs récents',
        description: 'Éviter la sur-exposition aux clients existants',
        impact: 'low',
        estimatedGain: '-10% CPA'
      }
    ];
  }
}