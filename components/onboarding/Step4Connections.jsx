'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/lib/contexts/OnboardingContext';
import { completeOnboarding } from '@/lib/services/onboarding';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

const connections = [
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    icon: '📘',
    description: 'Facebook & Instagram Ads',
    required: true,
    module: 'ads-master'
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    icon: '🔍',
    description: 'Search & Display campaigns',
    required: false,
    module: 'ads-master'
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    icon: '🎵',
    description: 'TikTok advertising',
    required: false,
    module: 'ads-master'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '💬',
    description: 'Messaging automation',
    required: false,
    module: 'leadwarm'
  },
  {
    id: 'email',
    name: 'Email Provider',
    icon: '📧',
    description: 'SendGrid, Mailgun, etc.',
    required: false,
    module: 'leadwarm'
  },
  {
    id: 'sms',
    name: 'SMS Provider',
    icon: '📱',
    description: 'Twilio, Vonage, etc.',
    required: false,
    module: 'leadwarm'
  },
  {
    id: 'stripe',
    name: 'Stripe Connect',
    icon: '💳',
    description: 'Payment processing',
    required: false,
    module: 'hubcrm'
  }
];

export default function Step4Connections({ onComplete, onBack }) {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const [connectedServices, setConnectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedModules = onboardingData.selectedModules || [];

  // Filtrer les connexions basées sur les modules sélectionnés
  const availableConnections = connections.filter(conn => 
    selectedModules.some(module => conn.module === module)
  );

  const requiredConnection = availableConnections.find(c => c.required);

  const handleConnect = async (connectionId) => {
    setLoading(true);
    
    // Simuler la connexion OAuth
    setTimeout(() => {
      setConnectedServices(prev => [...prev, connectionId]);
      setLoading(false);
    }, 1500);
  };

  const handleSkip = async () => {
    setLoading(true);
    
    try {
      // Mettre à jour les connexions dans le contexte (vide si skip)
      const finalData = {
        ...onboardingData,
        connections: []
      };
      
      // Finaliser l'inscription complète même sans connexions
      await completeOnboarding(finalData);
      
      // Rediriger vers le dashboard
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Cet email est déjà utilisé. Veuillez vous connecter.');
        window.location.href = '/auth/login';
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Mettre à jour les connexions dans le contexte
      const finalData = {
        ...onboardingData,
        connections: connectedServices
      };
      
      // Finaliser l'inscription complète
      await completeOnboarding(finalData);
      
      // Rediriger vers le dashboard
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      // Gérer l'erreur selon le type
      if (error.code === 'auth/email-already-in-use') {
        alert('Cet email est déjà utilisé. Veuillez vous connecter.');
        window.location.href = '/auth/login';
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (connectionId) => connectedServices.includes(connectionId);
  const canFinish = !requiredConnection || isConnected(requiredConnection.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Connexions
        </h2>
        <p className="text-white/60">
          Connectez vos plateformes pour démarrer
        </p>
      </div>

      {requiredConnection && !isConnected(requiredConnection.id) && (
        <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ {requiredConnection.name} est obligatoire pour utiliser Ads Master
          </p>
        </div>
      )}

      <div className="space-y-3">
        {availableConnections.map((connection) => {
          const connected = isConnected(connection.id);
          
          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${connected 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{connection.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold">
                      {connection.name}
                      {connection.required && (
                        <span className="ml-2 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          Obligatoire
                        </span>
                      )}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {connection.description}
                    </p>
                  </div>
                </div>
                
                {connected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400 text-sm">Connecté</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(connection.id)}
                    disabled={loading}
                    variant="outline"
                    className="text-sm"
                  >
                    {loading ? 'Connexion...' : 'Connecter'}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {availableConnections.length === 0 && (
        <GlassCard className="p-6 text-center">
          <p className="text-white/60">
            Aucune connexion requise pour les modules sélectionnés
          </p>
        </GlassCard>
      )}

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 Vous pourrez ajouter d'autres connexions plus tard depuis votre tableau de bord
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
        >
          ← Retour
        </Button>
        
        <div className="flex gap-3">
          {!canFinish && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              disabled={loading}
            >
              {loading ? 'Finalisation...' : 'Passer'}
            </Button>
          )}
          
          <Button
            onClick={handleFinish}
            variant="gradient"
            disabled={!canFinish || loading}
          >
            {loading ? 'Finalisation...' : canFinish ? 'Terminer l\'inscription' : 'Connecter Meta Ads d\'abord'}
          </Button>
        </div>
      </div>
    </div>
  );
}