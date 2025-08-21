'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/experiments');
      const data = await response.json();
      setExperiments(data.experiments || getDemoExperiments());
    } catch (error) {
      console.error('Error loading experiments:', error);
      setExperiments(getDemoExperiments());
    }
    setLoading(false);
  };

  const getDemoExperiments = () => [
    {
      id: 'exp_1',
      name: 'Headline Test - Urgency vs Benefits',
      status: 'running',
      hypothesis: 'Urgency-based headlines will outperform benefit-focused ones',
      startDate: '2024-01-15',
      duration: 7,
      progress: 65,
      variants: [
        {
          name: 'Control - Benefits',
          metrics: { impressions: 45678, clicks: 1234, ctr: 2.7, conversions: 45, spend: 234 }
        },
        {
          name: 'Test - Urgency',
          metrics: { impressions: 44321, clicks: 1456, ctr: 3.3, conversions: 62, spend: 228 },
          isWinning: true
        }
      ],
      confidence: 87,
      estimatedCompletion: '2 days'
    },
    {
      id: 'exp_2',
      name: 'Audience - Broad vs Narrow',
      status: 'completed',
      hypothesis: 'Narrow targeting will have better ROAS despite lower volume',
      startDate: '2024-01-08',
      duration: 7,
      progress: 100,
      winner: 'Narrow Targeting',
      variants: [
        {
          name: 'Broad Targeting',
          metrics: { impressions: 125678, clicks: 2234, ctr: 1.8, conversions: 67, spend: 456 }
        },
        {
          name: 'Narrow Targeting',
          metrics: { impressions: 78432, clicks: 2156, ctr: 2.8, conversions: 89, spend: 412 },
          isWinner: true
        }
      ],
      confidence: 95,
      result: 'Narrow targeting had 32% better ROAS'
    },
    {
      id: 'exp_3',
      name: 'Creative Format - Static vs Carousel',
      status: 'scheduled',
      hypothesis: 'Carousel ads will increase engagement and time spent',
      startDate: '2024-01-20',
      duration: 5,
      progress: 0,
      variants: [
        { name: 'Static Image' },
        { name: 'Carousel (3 cards)' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'scheduled': return 'text-yellow-400 bg-yellow-400/20';
      case 'paused': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const promoteWinner = async (experimentId) => {
    try {
      await fetch(`/api/aids/experiments/${experimentId}/promote`, { method: 'POST' });
      loadExperiments();
    } catch (error) {
      console.error('Error promoting winner:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            A/B Experiments
          </h1>
          <p className="text-gray-400">
            Octavia is running {experiments.filter(e => e.status === 'running').length} active experiments
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
        >
          + New Experiment
        </button>
      </div>

      {/* Active Experiments */}
      <div className="space-y-4">
        {experiments.map((experiment, index) => (
          <motion.div
            key={experiment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10"
          >
            {/* Experiment Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {experiment.name}
                </h3>
                <p className="text-sm text-gray-400">
                  Hypothesis: {experiment.hypothesis}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
                {experiment.status.toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            {experiment.status === 'running' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{experiment.progress}% • {experiment.estimatedCompletion} remaining</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                    style={{ width: `${experiment.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {experiment.variants.map((variant, vIndex) => (
                <div
                  key={vIndex}
                  className={`p-4 rounded-lg border ${
                    variant.isWinning || variant.isWinner
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      {variant.name}
                    </span>
                    {(variant.isWinning || variant.isWinner) && (
                      <span className="text-xs text-green-400">
                        {variant.isWinner ? '🏆 WINNER' : '📈 LEADING'}
                      </span>
                    )}
                  </div>
                  
                  {variant.metrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">CTR:</span>
                        <span className="text-white ml-1">{variant.metrics.ctr}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Conv:</span>
                        <span className="text-white ml-1">{variant.metrics.conversions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Spend:</span>
                        <span className="text-white ml-1">${variant.metrics.spend}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">CPA:</span>
                        <span className="text-white ml-1">
                          ${(variant.metrics.spend / variant.metrics.conversions).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Confidence & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {experiment.confidence && (
                  <div className="text-sm">
                    <span className="text-gray-400">Confidence:</span>
                    <span className={`ml-1 font-medium ${
                      experiment.confidence >= 95 ? 'text-green-400' :
                      experiment.confidence >= 80 ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {experiment.confidence}%
                    </span>
                  </div>
                )}
                {experiment.result && (
                  <div className="text-sm text-green-400">
                    ✓ {experiment.result}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {experiment.status === 'running' && experiment.confidence >= 95 && (
                  <button
                    onClick={() => promoteWinner(experiment.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    Declare Winner
                  </button>
                )}
                {experiment.status === 'running' && (
                  <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors">
                    Pause
                  </button>
                )}
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Create New Experiment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Experiment Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., CTA Button Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Hypothesis
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows="2"
                  placeholder="What do you expect to happen?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Test Duration (days)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  defaultValue="7"
                  min="3"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Success Metric
                </label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option>CTR (Click-Through Rate)</option>
                  <option>ROAS (Return on Ad Spend)</option>
                  <option>CPA (Cost Per Acquisition)</option>
                  <option>Conversion Rate</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create experiment logic
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Create Experiment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}