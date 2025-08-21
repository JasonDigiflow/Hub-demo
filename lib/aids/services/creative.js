/**
 * Service de génération créative pour AIDs
 * Génère des prompts et des images pour les publicités
 */

export class CreativeService {
  constructor(config) {
    this.config = config;
  }

  /**
   * Génère un prompt pour la création d'image
   */
  async generatePrompt(context) {
    const { objective, angle, tone, headline, description } = context;
    
    // Template de prompt optimisé pour les publicités
    const prompt = `Create a high-converting social media ad image:
Style: Modern, clean, professional
Objective: ${objective || 'Drive conversions'}
Angle: ${angle || 'Benefit-focused'}
Tone: ${tone || 'Urgent but positive'}
Text overlay: "${headline || 'Limited Time Offer'}"
Subtext: "${description || 'Shop Now'}"
Colors: Vibrant, eye-catching, brand-aligned
Composition: Rule of thirds, clear focal point
Format: Square 1080x1080 for Meta ads
Quality: Ultra high definition, professional photography`;

    return prompt;
  }

  /**
   * Génère une image via API ou retourne une image demo
   */
  async generateImage(prompt) {
    if (this.config.isLiveMode()) {
      return await this.generateWithAPI(prompt);
    } else {
      return this.generateDemoImage(prompt);
    }
  }

  /**
   * Génération réelle via API (OpenAI, Stability, etc.)
   */
  async generateWithAPI(prompt) {
    const { provider, apiKey } = this.config.getImageConfig();
    
    if (provider === 'openai' && apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'vivid'
          })
        });
        
        const data = await response.json();
        return {
          url: data.data[0].url,
          prompt: prompt,
          provider: 'openai',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Image generation error:', error);
        return this.generateDemoImage(prompt);
      }
    }
    
    return this.generateDemoImage(prompt);
  }

  /**
   * Génère une image demo
   */
  generateDemoImage(prompt) {
    // Utilise un service de placeholder ou génère une URL demo
    const themes = ['summer', 'tech', 'fashion', 'food', 'travel'];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    return {
      url: `https://picsum.photos/1080/1080?random=${Date.now()}`,
      prompt: prompt,
      provider: 'demo',
      theme: theme,
      timestamp: new Date().toISOString(),
      metadata: {
        width: 1080,
        height: 1080,
        format: 'jpg',
        size: '245KB'
      }
    };
  }

  /**
   * Améliore un prompt basé sur le feedback
   */
  async improvePrompt(originalPrompt, feedback) {
    const improvements = {
      'low_contrast': 'Add high contrast between text and background',
      'not_readable': 'Make text larger and bolder, use sans-serif font',
      'off_brand': 'Align with brand colors and guidelines',
      'too_busy': 'Simplify composition, focus on single message',
      'not_engaging': 'Add emotional appeal and urgency'
    };
    
    let improvedPrompt = originalPrompt;
    
    Object.entries(feedback).forEach(([issue, present]) => {
      if (present && improvements[issue]) {
        improvedPrompt += `\nIMPORTANT: ${improvements[issue]}`;
      }
    });
    
    return improvedPrompt;
  }
}