'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FidalyzDemo() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReview, setSelectedReview] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Mode démo sans authentification
        setUser({
          name: 'Utilisateur Démo',
          email: 'demo@digiflow.com',
          organization: { name: 'Demo Company' }
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const loadData = async () => {
    try {
      // Charger les stats
      const statsRes = await fetch('/api/fidalyz/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Charger les avis
      const reviewsRes = await fetch('/api/fidalyz/reviews');
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestion = async (review) => {
    setSelectedReview(review);
    try {
      const res = await fetch('/api/fidalyz/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review })
      });
      const data = await res.json();
      setAiSuggestions(data);
    } catch (error) {
      console.error('Generate suggestion error:', error);
    }
  };

  const sendResponse = async (reviewId, response) => {
    try {
      const res = await fetch('/api/fidalyz/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, response })
      });
      if (res.ok) {
        alert('Réponse envoyée avec succès !');
        loadData();
        setSelectedReview(null);
        setAiSuggestions(null);
      }
    } catch (error) {
      console.error('Send response error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <h1 className="text-xl font-bold text-white">
                  Fidalyz <span className="text-white/60">Demo</span>
                </h1>
              </Link>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'reviews' 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Avis
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'posts' 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Posts Google
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm">Mode Démo</span>
              <Link href="/">
                <button className="btn-gradient px-4 py-2 rounded-lg text-sm">
                  Retour au site
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Total Avis</span>
                  <span className="text-green-400 text-sm">+{stats.growth?.reviews?.change}%</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.overview?.totalReviews}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Note Moyenne</span>
                  <span className="text-yellow-400">⭐</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.overview?.avgRating}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Taux Réponse</span>
                  <span className="text-blue-400">📊</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.overview?.responseRate}%</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Posts Google</span>
                  <span className="text-purple-400">📱</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.overview?.googlePosts}</div>
              </motion.div>
            </div>

            {/* Activity Feed */}
            <div className="glass-card">
              <h3 className="text-xl font-bold text-white mb-4">Activité Récente</h3>
              <div className="space-y-3">
                {stats.recentActivity?.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        {activity.type === 'new_review' && '⭐'}
                        {activity.type === 'response_sent' && '💬'}
                        {activity.type === 'google_post' && '📱'}
                        {activity.type === 'collect_sent' && '📧'}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {activity.type === 'new_review' && `Nouvel avis ${activity.rating}⭐ de ${activity.author}`}
                          {activity.type === 'response_sent' && `Réponse envoyée à ${activity.author}`}
                          {activity.type === 'google_post' && activity.title}
                          {activity.type === 'collect_sent' && `${activity.count} demandes d'avis envoyées`}
                        </div>
                        <div className="text-white/50 text-sm">{activity.source} • {activity.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Gestion des Avis</h2>
              <div className="flex gap-2">
                <button className="glass-card px-4 py-2 rounded-lg text-white/80 hover:text-white">
                  Tous
                </button>
                <button className="glass-card px-4 py-2 rounded-lg text-white/80 hover:text-white">
                  En attente
                </button>
                <button className="glass-card px-4 py-2 rounded-lg text-white/80 hover:text-white">
                  Répondus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => generateAISuggestion(review)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{review.avatar}</div>
                        <div>
                          <div className="font-semibold text-white">{review.author}</div>
                          <div className="text-sm text-white/60">{review.source} • {review.date}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-white/20'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/80 mb-3">{review.text}</p>
                    {review.response ? (
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-sm text-green-400 mb-1">✓ Répondu</div>
                        <p className="text-white/70 text-sm">{review.response.text}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 text-sm">⏳ En attente de réponse</span>
                        <button className="text-purple-400 text-sm hover:text-purple-300">
                          Générer réponse IA →
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* AI Response Panel */}
              {selectedReview && aiSuggestions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card sticky top-24"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Assistant IA Zoë</h3>
                  
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-1">Analyse de l'avis</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                        Sentiment: {aiSuggestions.sentiment}
                      </span>
                      {aiSuggestions.keyPoints?.map((point) => (
                        <span key={point} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-white/60 text-sm">Suggestions de réponse :</div>
                    {aiSuggestions.suggestions?.map((suggestion) => (
                      <div key={suggestion.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/50">Ton {suggestion.tone}</span>
                          <span className="text-xs text-green-400">
                            {Math.round(suggestion.confidence * 100)}% confiance
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-3">{suggestion.text}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => sendResponse(selectedReview.id, suggestion.text)}
                            className="flex-1 btn-gradient py-2 rounded text-sm"
                          >
                            Utiliser cette réponse
                          </button>
                          <button className="px-3 py-2 glass-card rounded text-sm text-white/60">
                            Modifier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedReview(null);
                      setAiSuggestions(null);
                    }}
                    className="mt-4 w-full py-2 glass-card rounded-lg text-white/60 hover:text-white"
                  >
                    Fermer
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-white mb-2">Posts Google Business</h3>
            <p className="text-white/60 mb-6">Créez et planifiez vos posts Google automatiquement</p>
            <button className="btn-gradient px-6 py-3 rounded-lg">
              Créer un nouveau post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}