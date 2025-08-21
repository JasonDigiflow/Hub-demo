/**
 * Service de gestion des expériences A/B
 * Crée, surveille et déclare les gagnants des tests
 */

export class ExperimentService {
  constructor(config) {
    this.config = config;
    this.experiments = new Map();
    this.initializeDemoExperiments();
  }

  initializeDemoExperiments() {
    // Initialise quelques expériences demo
    const exp1 = {
      id: 'exp_demo_1',
      name: 'CTA Button Color Test',
      status: 'running',
      hypothesis: 'Orange CTA will outperform blue by 15%',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 7,
      progress: 45,
      targetMetric: 'CTR',
      variants: [
        {
          id: 'variant_1',
          name: 'Control - Blue',
          metrics: {
            impressions: 25000,
            clicks: 650,
            ctr: 2.6,
            conversions: 32,
            spend: 145
          }
        },
        {
          id: 'variant_2',
          name: 'Test - Orange',
          metrics: {
            impressions: 24800,
            clicks: 744,
            ctr: 3.0,
            conversions: 41,
            spend: 142
          },
          isWinning: true
        }
      ],
      confidence: 78
    };
    
    this.experiments.set(exp1.id, exp1);
  }

  /**
   * Crée une nouvelle expérience
   */
  async create(params) {
    const experiment = {
      id: `exp_${Date.now()}`,
      name: params.name,
      hypothesis: params.hypothesis,
      status: 'scheduled',
      startDate: new Date(),
      duration: params.duration || 7,
      progress: 0,
      targetMetric: params.metrics?.[0] || 'CTR',
      variants: params.variants.map((v, i) => ({
        id: `variant_${Date.now()}_${i}`,
        name: v.name,
        ...v,
        metrics: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          conversions: 0,
          spend: 0
        }
      })),
      budget: params.budget,
      confidence: 0,
      createdAt: new Date().toISOString()
    };
    
    this.experiments.set(experiment.id, experiment);
    
    // Start the experiment
    setTimeout(() => this.startExperiment(experiment.id), 1000);
    
    return experiment;
  }

  /**
   * Démarre une expérience
   */
  async startExperiment(experimentId) {
    const exp = this.experiments.get(experimentId);
    if (exp) {
      exp.status = 'running';
      exp.startDate = new Date();
    }
  }

  /**
   * Vérifie les expériences en cours
   */
  async checkExperiments() {
    const activeExperiments = Array.from(this.experiments.values())
      .filter(exp => exp.status === 'running');
    
    const results = [];
    
    for (const exp of activeExperiments) {
      // Simulate progress
      exp.progress = Math.min(100, 
        Math.floor((Date.now() - new Date(exp.startDate).getTime()) / 
        (exp.duration * 24 * 60 * 60 * 1000) * 100)
      );
      
      // Update metrics (simulation)
      this.updateExperimentMetrics(exp);
      
      // Calculate confidence
      exp.confidence = this.calculateConfidence(exp);
      
      // Check if we should declare a winner
      const shouldDeclareWinner = exp.confidence >= 95 || exp.progress >= 100;
      
      results.push({
        id: exp.id,
        name: exp.name,
        progress: exp.progress,
        confidence: exp.confidence,
        shouldDeclareWinner,
        leadingVariant: this.getLeadingVariant(exp)
      });
    }
    
    return results;
  }

  /**
   * Met à jour les métriques d'une expérience (simulation)
   */
  updateExperimentMetrics(experiment) {
    experiment.variants.forEach((variant, index) => {
      const isWinning = index === 1; // Simulate variant 2 performing better
      const multiplier = isWinning ? 1.2 : 1.0;
      
      variant.metrics.impressions += Math.floor(Math.random() * 1000);
      variant.metrics.clicks += Math.floor(Math.random() * 30 * multiplier);
      variant.metrics.ctr = (variant.metrics.clicks / variant.metrics.impressions * 100).toFixed(2);
      variant.metrics.conversions += Math.floor(Math.random() * 5 * multiplier);
      variant.metrics.spend += Math.random() * 50;
    });
  }

  /**
   * Calcule la confiance statistique
   */
  calculateConfidence(experiment) {
    // Simplified confidence calculation
    const variant1 = experiment.variants[0];
    const variant2 = experiment.variants[1];
    
    if (!variant1 || !variant2) return 0;
    
    const impressions1 = variant1.metrics.impressions || 1;
    const impressions2 = variant2.metrics.impressions || 1;
    
    const minImpressions = Math.min(impressions1, impressions2);
    const ctrDiff = Math.abs(
      parseFloat(variant1.metrics.ctr) - parseFloat(variant2.metrics.ctr)
    );
    
    // Simple confidence based on sample size and difference
    let confidence = Math.min(95, 
      (minImpressions / 1000) * 20 + // Sample size component
      ctrDiff * 10 // Difference component
    );
    
    return Math.floor(confidence);
  }

  /**
   * Trouve la variante gagnante
   */
  getLeadingVariant(experiment) {
    let leading = experiment.variants[0];
    const targetMetric = experiment.targetMetric.toLowerCase();
    
    experiment.variants.forEach(variant => {
      const currentValue = parseFloat(variant.metrics[targetMetric]) || 0;
      const leadingValue = parseFloat(leading.metrics[targetMetric]) || 0;
      
      if (currentValue > leadingValue) {
        leading = variant;
      }
    });
    
    return leading;
  }

  /**
   * Promeut le gagnant d'une expérience
   */
  async promoteWinner(experimentId) {
    const exp = this.experiments.get(experimentId);
    if (!exp) return null;
    
    const winner = this.getLeadingVariant(exp);
    
    exp.status = 'completed';
    exp.winner = winner.name;
    exp.completedAt = new Date().toISOString();
    exp.result = `${winner.name} won with ${exp.targetMetric}: ${winner.metrics[exp.targetMetric.toLowerCase()]}`;
    
    // Mark winner
    exp.variants.forEach(v => {
      v.isWinner = v.id === winner.id;
    });
    
    return {
      experimentId,
      winner: winner.name,
      improvement: this.calculateImprovement(exp),
      action: 'Winner promoted, losing variant paused'
    };
  }

  /**
   * Calcule l'amélioration du gagnant
   */
  calculateImprovement(experiment) {
    const winner = experiment.variants.find(v => v.isWinner);
    const loser = experiment.variants.find(v => !v.isWinner);
    
    if (!winner || !loser) return 0;
    
    const targetMetric = experiment.targetMetric.toLowerCase();
    const winnerValue = parseFloat(winner.metrics[targetMetric]) || 0;
    const loserValue = parseFloat(loser.metrics[targetMetric]) || 1;
    
    return Math.round((winnerValue - loserValue) / loserValue * 100);
  }

  /**
   * Récupère les expériences actives
   */
  async getActiveExperiments() {
    return Array.from(this.experiments.values())
      .filter(exp => exp.status === 'running')
      .map(exp => ({
        id: exp.id,
        name: exp.name,
        progress: exp.progress,
        confidence: exp.confidence,
        leadingVariant: this.getLeadingVariant(exp)?.name
      }));
  }
}