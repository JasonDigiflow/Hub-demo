'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import ReviewItem from '@/components/fidalyz/ReviewItem';
import { mockReviews } from '@/lib/mockData';

export default function ReviewsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');

  const filteredReviews = mockReviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'pending') return review.status === 'pending';
    if (filter === 'responded') return review.status === 'responded';
    return true;
  });

  const handleRespond = (review) => {
    setSelectedReview(review);
    setResponseText('');
  };

  const submitResponse = () => {
    console.log('Response submitted for review:', selectedReview.id);
    console.log('Response text:', responseText);
    setSelectedReview(null);
    setResponseText('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Gestion des <span className="gradient-text">Avis</span>
            </h1>
            <p className="text-white/70">
              Gérez et répondez à tous vos avis clients
            </p>
          </div>
          <Link href="/app/fidalyz">
            <Button variant="outline">
              ← Retour au dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-2">
          {['all', 'pending', 'responded'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'gradient' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' && 'Tous'}
              {status === 'pending' && '⏳ En attente'}
              {status === 'responded' && '✓ Répondus'}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ReviewItem 
                  review={review} 
                  onRespond={handleRespond}
                />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold mb-4">Répondre à l'avis</h2>
              
              <div className="p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{selectedReview.avatar}</span>
                  <div>
                    <p className="font-semibold">{selectedReview.author}</p>
                    <p className="text-sm text-white/50">{selectedReview.platform} • {selectedReview.date}</p>
                  </div>
                </div>
                <p className="text-white/80">{selectedReview.text}</p>
              </div>

              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Rédigez votre réponse..."
                className="w-full h-32 mb-4"
              />

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setResponseText("Merci pour votre retour ! Nous prenons en compte vos remarques pour améliorer notre service.")}
                >
                  🤖 Suggestion Zoë
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReview(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={submitResponse}
                    disabled={!responseText.trim()}
                  >
                    Envoyer la réponse
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}