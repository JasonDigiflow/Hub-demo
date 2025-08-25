'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function OctaviaAIPage() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    aidsLogger.info(LogCategories.OCTAVIA_AI, 'Page Octavia AI initialisée');
    // Message de bienvenue
    setConversation([
      {
        role: 'assistant',
        content: 'Bonjour ! Je suis Octavia, votre assistante IA pour optimiser vos campagnes publicitaires. Comment puis-je vous aider aujourd\'hui ?'
      }
    ]);
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/aids/octavia/suggestions');
      const data = await response.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      aidsLogger.error(LogCategories.OCTAVIA_AI, 'Erreur récupération suggestions', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      aidsLogger.info(LogCategories.OCTAVIA_AI, 'Envoi message à Octavia', { message: userMessage });
      
      const response = await fetch('/api/aids/octavia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (data.response) {
        setConversation(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
        aidsLogger.success(LogCategories.OCTAVIA_AI, 'Réponse Octavia reçue');
      }
    } catch (error) {
      aidsLogger.error(LogCategories.OCTAVIA_AI, 'Erreur chat Octavia', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolée, j\'ai rencontré une erreur. Pouvez-vous reformuler votre question ?'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: '📊', label: 'Analyser mes campagnes', action: 'analyze_campaigns' },
    { icon: '💡', label: 'Suggestions d\'optimisation', action: 'optimization_tips' },
    { icon: '🎯', label: 'Améliorer le ciblage', action: 'improve_targeting' },
    { icon: '💰', label: 'Optimiser le budget', action: 'optimize_budget' }
  ];

  const handleQuickAction = (action) => {
    const actionMessages = {
      analyze_campaigns: 'Analyse mes campagnes actuelles et donne-moi un rapport de performance',
      optimization_tips: 'Quelles optimisations me recommandes-tu pour améliorer mes résultats ?',
      improve_targeting: 'Comment puis-je améliorer le ciblage de mes publicités ?',
      optimize_budget: 'Comment optimiser mon budget publicitaire pour de meilleurs résultats ?'
    };
    
    setMessage(actionMessages[action]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🤖 Octavia AI</h1>
          <p className="text-gray-400">Assistant IA pour optimiser vos campagnes publicitaires</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[600px] flex flex-col"
            >
              {/* Conversation */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400">🤖 Octavia</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-200"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-400"></div>
                        </div>
                        <span className="text-gray-400 text-sm">Octavia réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mb-4 flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-all"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question à Octavia..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Envoyer
                </button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Status IA</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mode</span>
                  <span className="text-green-400">Actif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Apprentissage</span>
                  <span className="text-purple-400">En cours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Optimisations</span>
                  <span className="text-white">24/7</span>
                </div>
              </div>
            </motion.div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">💡 Suggestions</h3>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-gray-300">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">📈 Analyse</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Score global</p>
                    <p className="text-2xl font-bold text-white">{analysis.score}/100</p>
                  </div>
                  {analysis.insights && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-300">{analysis.insights}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}