'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LinkDataPage() {
  const [status, setStatus] = useState(null);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/aids/auto-link-revenues');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleAutoLink = async () => {
    setLinking(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/aids/auto-link-revenues', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        await checkStatus(); // Refresh status
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-8">
          Liaison Revenues ↔ Prospects
        </h1>

        {status && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Statut Actuel</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400">Total Revenues</div>
                <div className="text-2xl font-bold text-white">{status.totalRevenues}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Avec Lead Date</div>
                <div className="text-2xl font-bold text-green-400">{status.withLeadDate}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Sans Lead Date</div>
                <div className="text-2xl font-bold text-orange-400">{status.withoutLeadDate}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">% Liées</div>
                <div className="text-2xl font-bold text-blue-400">{status.percentLinked}%</div>
              </div>
            </div>

            {status.averageTTD > 0 && (
              <div className="mt-4 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <div className="text-sm text-indigo-400">TTD Moyen Actuel</div>
                <div className="text-3xl font-bold text-indigo-400">
                  {status.averageTTD} jours
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Sur {status.ttdCount} deals avec données complètes
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Liaison Automatique
          </h2>
          
          <p className="text-gray-400 mb-6">
            Cette fonction va automatiquement lier les revenues existantes aux prospects
            correspondants pour récupérer leur date d'entrée dans le funnel (leadDate).
            Cela permettra de calculer le TTD et le ROAS correctement.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">
                Recherche par ID de prospect
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">
                Correspondance par nom du client
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">
                Correspondance par email
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">
                Calcul automatique du TTD
              </span>
            </div>
          </div>

          <button
            onClick={handleAutoLink}
            disabled={linking || (status?.withoutLeadDate === 0)}
            className={`mt-6 w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              linking || (status?.withoutLeadDate === 0)
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {linking ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Liaison en cours...
              </>
            ) : status?.withoutLeadDate === 0 ? (
              '✅ Toutes les revenues sont déjà liées'
            ) : (
              `Lancer la liaison (${status?.withoutLeadDate || 0} à traiter)`
            )}
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}