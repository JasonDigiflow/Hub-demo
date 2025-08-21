/**
 * AIDs Pipeline - Orchestrateur principal
 * Gère le flux complet : ingestion → analyse → génération → validation → lancement → reporting
 */

import { MetricsService } from './services/metrics';
import { AnalysisService } from './services/analysis';
import { CreativeService } from './services/creative';
import { ValidationService } from './services/validation';
import { AdService } from './services/ads';
import { ExperimentService } from './services/experiments';
import { StorageService } from './services/storage';
import { ConfigService } from './services/config';

export class AIDsPipeline {
  constructor() {
    this.config = new ConfigService();
    this.metrics = new MetricsService(this.config);
    this.analysis = new AnalysisService(this.config);
    this.creative = new CreativeService(this.config);
    this.validation = new ValidationService(this.config);
    this.ads = new AdService(this.config);
    this.experiments = new ExperimentService(this.config);
    this.storage = new StorageService(this.config);
    
    this.running = false;
    this.logs = [];
  }

  /**
   * Execute le pipeline complet
   */
  async run(options = {}) {
    if (this.running) {
      this.log('Pipeline already running', 'warning');
      return { success: false, message: 'Pipeline already running' };
    }

    this.running = true;
    this.log('🚀 Starting AIDs Pipeline', 'info');

    try {
      // Étape 1: Ingestion des métriques
      this.log('📊 Step 1: Ingesting metrics...', 'info');
      const metrics = await this.metrics.ingest(options.dateRange);
      this.log(`✅ Ingested ${metrics.campaigns} campaigns, ${metrics.adSets} ad sets`, 'success');

      // Étape 2: Analyse et décisions
      this.log('🧠 Step 2: Analyzing performance...', 'info');
      const decisions = await this.analysis.analyze(metrics);
      this.log(`✅ Generated ${decisions.length} action decisions`, 'success');

      // Étape 3: Exécution des décisions
      for (const decision of decisions) {
        await this.executeDecision(decision);
      }

      // Étape 4: Vérification des expériences A/B
      this.log('🧪 Step 4: Checking A/B experiments...', 'info');
      const experiments = await this.experiments.checkExperiments();
      for (const exp of experiments) {
        if (exp.shouldDeclareWinner) {
          await this.experiments.promoteWinner(exp.id);
          this.log(`🏆 Promoted winner for experiment ${exp.name}`, 'success');
        }
      }

      // Étape 5: Génération du rapport
      this.log('📈 Step 5: Generating reports...', 'info');
      const report = await this.generateReport();
      
      this.log('✨ Pipeline completed successfully!', 'success');
      
      return {
        success: true,
        metrics,
        decisions,
        report,
        logs: this.logs
      };

    } catch (error) {
      this.log(`❌ Pipeline error: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
        logs: this.logs
      };
    } finally {
      this.running = false;
    }
  }

  /**
   * Exécute une décision spécifique
   */
  async executeDecision(decision) {
    this.log(`⚡ Executing: ${decision.type}`, 'info');

    switch (decision.type) {
      case 'GENERATE_CREATIVE':
        await this.generateAndLaunchCreative(decision);
        break;
      
      case 'DUPLICATE_ADSET_FOR_TEST':
        await this.createABTest(decision);
        break;
      
      case 'PAUSE_UNDERPERFORMER':
        await this.ads.pauseAd(decision.targetId);
        this.log(`⏸️ Paused underperforming ad ${decision.targetId}`, 'warning');
        break;
      
      case 'PROMOTE_WINNER':
        await this.ads.promoteAd(decision.targetId);
        this.log(`🚀 Promoted winning ad ${decision.targetId}`, 'success');
        break;
      
      case 'BUDGET_REALLOCATE':
        await this.ads.reallocateBudget(decision.from, decision.to, decision.amount);
        this.log(`💰 Reallocated $${decision.amount} budget`, 'success');
        break;
      
      default:
        this.log(`Unknown decision type: ${decision.type}`, 'warning');
    }
  }

  /**
   * Génère et lance un nouveau créatif
   */
  async generateAndLaunchCreative(decision) {
    try {
      // 1. Générer le prompt pour l'image
      const prompt = await this.creative.generatePrompt(decision.context);
      this.log(`📝 Generated creative prompt`, 'info');

      // 2. Générer l'image
      const image = await this.creative.generateImage(prompt);
      this.log(`🎨 Generated creative image`, 'success');

      // 3. Valider l'image avec l'IA
      let validationResult = await this.validation.validateCreative(image, decision.context);
      let attempts = 0;
      const maxAttempts = 3;

      while (!validationResult.isValid && attempts < maxAttempts) {
        this.log(`🔄 Creative validation failed: ${validationResult.reason}. Retrying...`, 'warning');
        
        // Améliorer le prompt et régénérer
        const improvedPrompt = await this.creative.improvePrompt(prompt, validationResult.feedback);
        image = await this.creative.generateImage(improvedPrompt);
        validationResult = await this.validation.validateCreative(image, decision.context);
        attempts++;
      }

      if (!validationResult.isValid) {
        throw new Error('Failed to generate valid creative after multiple attempts');
      }

      this.log(`✅ Creative validated successfully`, 'success');

      // 4. Stocker l'image
      const assetUrl = await this.storage.uploadCreative(image, {
        campaignId: decision.campaignId,
        type: 'generated',
        prompt: prompt
      });
      this.log(`☁️ Creative uploaded: ${assetUrl}`, 'success');

      // 5. Créer et lancer l'ad
      const ad = await this.ads.createAd({
        campaignId: decision.campaignId,
        adSetId: decision.adSetId,
        creative: {
          imageUrl: assetUrl,
          headline: decision.context.headline,
          description: decision.context.description,
          ctaButton: decision.context.ctaButton || 'Learn More'
        }
      });

      this.log(`🚀 New ad launched: ${ad.id}`, 'success');
      return ad;

    } catch (error) {
      this.log(`❌ Failed to generate creative: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Crée un test A/B
   */
  async createABTest(decision) {
    try {
      const experiment = await this.experiments.create({
        name: decision.experimentName,
        hypothesis: decision.hypothesis,
        variants: decision.variants,
        metrics: decision.targetMetrics || ['CTR', 'ROAS'],
        duration: decision.duration || 7, // jours
        budget: decision.budget
      });

      this.log(`🧪 Created A/B test: ${experiment.name}`, 'success');
      
      // Lancer les variantes
      for (const variant of experiment.variants) {
        await this.ads.launchVariant(variant);
      }

      return experiment;

    } catch (error) {
      this.log(`❌ Failed to create A/B test: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Génère le rapport
   */
  async generateReport() {
    const now = new Date();
    const report = {
      timestamp: now.toISOString(),
      period: 'daily',
      summary: await this.metrics.getSummary(),
      topPerformers: await this.ads.getTopPerformers(5),
      underperformers: await this.ads.getUnderperformers(5),
      experiments: await this.experiments.getActiveExperiments(),
      recommendations: await this.analysis.getRecommendations(),
      logs: this.logs.filter(log => log.level !== 'debug')
    };

    await this.storage.saveReport(report);
    return report;
  }

  /**
   * Log helper
   */
  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[AIDs Pipeline] ${message}`);
  }

  /**
   * Mode automatique avec cron
   */
  async enableAutoPilot(schedule = '0 */6 * * *') {
    // Exécute le pipeline toutes les 6 heures par défaut
    this.log(`🤖 AutoPilot enabled: ${schedule}`, 'info');
    // Implementation avec node-cron ou similar
  }
}

// Export singleton
export const pipeline = new AIDsPipeline();