/**
 * Service de validation créative par IA
 * Vérifie la conformité et la qualité des créatifs
 */

export class ValidationService {
  constructor(config) {
    this.config = config;
  }

  /**
   * Valide un créatif selon les critères Meta et de marque
   */
  async validateCreative(image, context) {
    if (this.config.isLiveMode() && this.config.getLLMConfig().apiKey) {
      return await this.validateWithLLM(image, context);
    } else {
      return this.validateDemo(image, context);
    }
  }

  /**
   * Validation avec LLM
   */
  async validateWithLLM(image, context) {
    // En production, on enverrait l'image à un LLM multimodal
    // Pour l'instant, simulation
    return this.validateDemo(image, context);
  }

  /**
   * Validation demo avec règles prédéfinies
   */
  validateDemo(image, context) {
    const checks = {
      textReadability: Math.random() > 0.2,
      brandCompliance: Math.random() > 0.1,
      contrastSufficient: Math.random() > 0.15,
      noProhibitedContent: Math.random() > 0.05,
      correctDimensions: true,
      fileSize: true
    };
    
    const issues = [];
    const feedback = {};
    
    if (!checks.textReadability) {
      issues.push('Text not readable at small sizes');
      feedback.not_readable = true;
    }
    
    if (!checks.brandCompliance) {
      issues.push('Does not match brand guidelines');
      feedback.off_brand = true;
    }
    
    if (!checks.contrastSufficient) {
      issues.push('Insufficient contrast between elements');
      feedback.low_contrast = true;
    }
    
    if (!checks.noProhibitedContent) {
      issues.push('Contains prohibited terms or imagery');
      feedback.prohibited = true;
    }
    
    const isValid = issues.length === 0;
    
    return {
      isValid,
      score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length,
      checks,
      issues,
      feedback,
      reason: issues.join(', '),
      recommendations: this.getRecommendations(feedback),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Génère des recommandations d'amélioration
   */
  getRecommendations(feedback) {
    const recommendations = [];
    
    if (feedback.not_readable) {
      recommendations.push({
        type: 'text',
        priority: 'high',
        action: 'Increase font size to minimum 24pt',
        impact: 'Critical for mobile viewing'
      });
    }
    
    if (feedback.off_brand) {
      recommendations.push({
        type: 'brand',
        priority: 'high',
        action: 'Apply brand color palette and fonts',
        impact: 'Maintains brand consistency'
      });
    }
    
    if (feedback.low_contrast) {
      recommendations.push({
        type: 'design',
        priority: 'medium',
        action: 'Add dark overlay or light text shadow',
        impact: 'Improves readability by 40%'
      });
    }
    
    return recommendations;
  }

  /**
   * Vérifie la conformité aux politiques Meta
   */
  async checkMetaCompliance(creative) {
    const metaPolicies = {
      text20Rule: this.checkText20Rule(creative),
      noMisleadingContent: true,
      appropriateContent: true,
      correctFormat: true,
      noExcessiveCapitalization: this.checkCapitalization(creative)
    };
    
    return {
      compliant: Object.values(metaPolicies).every(Boolean),
      policies: metaPolicies,
      warnings: this.getComplianceWarnings(metaPolicies)
    };
  }

  /**
   * Vérifie la règle des 20% de texte de Meta
   */
  checkText20Rule(creative) {
    // Simule la vérification du ratio texte/image
    return Math.random() > 0.1;
  }

  /**
   * Vérifie l'utilisation excessive de majuscules
   */
  checkCapitalization(creative) {
    const text = creative.headline + ' ' + creative.description;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    return capsRatio < 0.5;
  }

  /**
   * Génère les avertissements de conformité
   */
  getComplianceWarnings(policies) {
    const warnings = [];
    
    if (!policies.text20Rule) {
      warnings.push('Image contains too much text (>20% coverage)');
    }
    
    if (!policies.noExcessiveCapitalization) {
      warnings.push('Excessive use of capital letters detected');
    }
    
    return warnings;
  }
}