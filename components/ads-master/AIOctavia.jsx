'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/contexts/LocaleContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AIOctavia({ insights, adAccountId }) {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [credits, setCredits] = useState(50); // TODO: Fetch from user's wallet
  const [selectedAction, setSelectedAction] = useState(null);

  const aiActions = [
    {
      id: 'insights',
      name: t('adsMaster.ai.generateInsights'),
      description: t('adsMaster.ai.insightsDescription'),
      cost: 0.2,
      icon: '💡',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'optimize',
      name: t('adsMaster.ai.optimizeBudget'),
      description: t('adsMaster.ai.optimizeDescription'),
      cost: 0.5,
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'creative',
      name: t('adsMaster.ai.createAd'),
      description: t('adsMaster.ai.creativeDescription'),
      cost: 1.0,
      icon: '🎨',
      color: 'from-pink-500 to-purple-500',
      comingSoon: true
    }
  ];

  const handleGenerateInsights = async (actionId) => {
    const action = aiActions.find(a => a.id === actionId);
    if (!action || action.comingSoon) return;

    // Check credits
    if (credits < action.cost) {
      alert(t('adsMaster.ai.insufficientCredits'));
      return;
    }

    setSelectedAction(actionId);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ads-master/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionId,
          adAccountId,
          insights
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiInsights(data.insights);
        setShowInsights(true);
        setCredits(prev => prev - action.cost);
        
        // Log credit transaction
        await fetch('/api/credits/debit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: action.cost,
            module: 'ads-master',
            action: actionId,
            description: action.name
          })
        });
      } else {
        alert(data.error || t('adsMaster.ai.generationFailed'));
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      alert(t('adsMaster.ai.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock AI insights for demo
  const mockAiInsights = {
    insights: {
      strengths: [
        t('adsMaster.ai.mockStrength1'),
        t('adsMaster.ai.mockStrength2'),
        t('adsMaster.ai.mockStrength3')
      ],
      weaknesses: [
        t('adsMaster.ai.mockWeakness1'),
        t('adsMaster.ai.mockWeakness2')
      ],
      recommendations: [
        t('adsMaster.ai.mockRecommendation1'),
        t('adsMaster.ai.mockRecommendation2'),
        t('adsMaster.ai.mockRecommendation3'),
        t('adsMaster.ai.mockRecommendation4')
      ],
      score: 72
    },
    optimize: {
      currentBudget: 1234.56,
      recommendedBudget: 1450.00,
      expectedImprovement: '+18%',
      actions: [
        t('adsMaster.ai.mockOptimization1'),
        t('adsMaster.ai.mockOptimization2'),
        t('adsMaster.ai.mockOptimization3')
      ]
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Octavia Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Octavia</h3>
              <p className="text-white/40 text-xs">{t('adsMaster.ai.subtitle')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs">{t('adsMaster.ai.credits')}</p>
            <p className="text-white font-semibold">💎 {credits.toFixed(1)}</p>
          </div>
        </div>

        {/* AI Actions */}
        <div className="space-y-3">
          {aiActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: action.comingSoon ? 1 : 1.02 }}
              whileTap={{ scale: action.comingSoon ? 1 : 0.98 }}
              onClick={() => !action.comingSoon && handleGenerateInsights(action.id)}
              disabled={isGenerating || action.comingSoon || credits < action.cost}
              className={`w-full relative ${action.comingSoon ? 'opacity-60' : ''}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-10 rounded-lg`} />
              <div className="relative p-4 bg-white/5 border border-white/10 rounded-lg text-left hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <p className="text-white font-medium">{action.name}</p>
                      <p className="text-white/40 text-xs">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {action.comingSoon ? (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {t('common.comingSoon')}
                      </span>
                    ) : (
                      <>
                        <p className="text-white/40 text-xs">{t('adsMaster.ai.cost')}</p>
                        <p className="text-white font-semibold">💎 {action.cost}</p>
                      </>
                    )}
                  </div>
                </div>
                {isGenerating && selectedAction === action.id && (
                  <div className="mt-3 flex items-center gap-2 text-purple-400 text-sm">
                    <span className="animate-spin">⏳</span>
                    {t('adsMaster.ai.generating')}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* AI Insights Display */}
      <AnimatePresence>
        {showInsights && aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>💡</span>
                  {t('adsMaster.ai.insightsTitle')}
                </h4>
                <button
                  onClick={() => setShowInsights(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedAction === 'insights' && (
                <div className="space-y-4">
                  {/* Performance Score */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(mockAiInsights.insights.score / 100) * 226} 226`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{mockAiInsights.insights.score}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium">{t('adsMaster.ai.performanceScore')}</p>
                      <p className="text-white/40 text-sm">{t('adsMaster.ai.scoreDescription')}</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h5 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                      <span>✅</span>
                      {t('adsMaster.ai.strengths')}
                    </h5>
                    <ul className="space-y-1">
                      {mockAiInsights.insights.strengths.map((strength, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h5 className="text-orange-400 font-medium mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      {t('adsMaster.ai.weaknesses')}
                    </h5>
                    <ul className="space-y-1">
                      {mockAiInsights.insights.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                      <span>💡</span>
                      {t('adsMaster.ai.recommendations')}
                    </h5>
                    <ul className="space-y-1">
                      {mockAiInsights.insights.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedAction === 'optimize' && (
                <div className="space-y-4">
                  {/* Budget Optimization */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-sm">{t('adsMaster.ai.currentBudget')}</p>
                      <p className="text-white font-semibold">€ {mockAiInsights.optimize.currentBudget}</p>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-sm">{t('adsMaster.ai.recommendedBudget')}</p>
                      <p className="text-green-400 font-semibold">€ {mockAiInsights.optimize.recommendedBudget}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/60 text-sm">{t('adsMaster.ai.expectedImprovement')}</p>
                      <p className="text-purple-400 font-semibold">{mockAiInsights.optimize.expectedImprovement}</p>
                    </div>
                  </div>

                  {/* Optimization Actions */}
                  <div>
                    <h5 className="text-white font-medium mb-2">{t('adsMaster.ai.optimizationActions')}</h5>
                    <ul className="space-y-2">
                      {mockAiInsights.optimize.actions.map((action, index) => (
                        <li key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-white/80 text-sm">{action}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => alert(t('adsMaster.ai.applyOptimizations'))}
                  >
                    {t('adsMaster.ai.applyChanges')}
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}