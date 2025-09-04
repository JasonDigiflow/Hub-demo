'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/lib/contexts/OnboardingContext';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

const modules = [
  {
    id: 'ads-master',
    name: 'Ads Master',
    icon: '📊',
    description: 'Gestion multi-plateformes des campagnes publicitaires',
    features: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Analytics'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'hubcrm',
    name: 'HubCRM',
    icon: '👥',
    description: 'CRM intelligent avec automatisation marketing',
    features: ['Gestion contacts', 'Pipeline', 'Automatisation', 'Email marketing'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'leadwarm',
    name: 'LeadWarm',
    icon: '🔥',
    description: 'Nurturing et conversion automatique des leads',
    features: ['WhatsApp Business', 'SMS', 'Email', 'Scoring'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'fidalyz',
    name: 'Fidalyz',
    icon: '⭐',
    description: 'E-réputation et gestion des avis clients',
    features: ['Google My Business', 'Réponse IA', 'Analytics', 'Widget'],
    color: 'from-green-500 to-emerald-500'
  }
];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    seats: 1,
    price: 79,
    features: ['1 utilisateur', '100 crédits/mois', 'Support email']
  },
  {
    id: 'team',
    name: 'Team',
    seats: 5,
    price: 59,
    pricePerSeat: true,
    features: ['5 utilisateurs', '500 crédits/mois', 'Support prioritaire'],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    seats: 10,
    price: 49,
    pricePerSeat: true,
    features: ['10+ utilisateurs', '1000 crédits/mois', 'Support dédié']
  }
];

export default function Step3Modules({ onNext, onBack }) {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const [selectedModules, setSelectedModules] = useState(
    onboardingData.selectedModules || ['ads-master']
  );
  const [selectedPlan, setSelectedPlan] = useState(
    onboardingData.selectedPlan || 'starter'
  );
  const [seats, setSeats] = useState(onboardingData.seats || 1);

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        // Ne pas permettre de désélectionner tous les modules
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== moduleId);
      }
      return [...prev, moduleId];
    });
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSeats(plan.seats);
    }
  };

  const calculatePrice = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    
    if (plan.pricePerSeat) {
      return plan.price * seats;
    }
    return plan.price;
  };

  const handleContinue = () => {
    updateOnboardingData({
      selectedModules,
      selectedPlan,
      seats
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Modules & Abonnement
        </h2>
        <p className="text-white/60">
          Activez les modules dont vous avez besoin
        </p>
      </div>

      {/* Modules */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Sélectionnez vos modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => {
            const isSelected = selectedModules.includes(module.id);
            
            return (
              <motion.button
                key={module.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleModule(module.id)}
                className={`
                  relative p-4 rounded-lg border transition-all duration-200 text-left
                  ${isSelected 
                    ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="text-green-400">✓</span>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{module.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">
                      {module.name}
                    </h4>
                    <p className="text-white/60 text-xs mb-2">
                      {module.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {module.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Choisissez votre abonnement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            
            return (
              <motion.button
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanSelect(plan.id)}
                className={`
                  relative p-4 rounded-lg border transition-all duration-200
                  ${isSelected 
                    ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full">
                      Populaire
                    </span>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="text-green-400">✓</span>
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-2">
                    {plan.name}
                  </h4>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-white">
                      {plan.price}€
                    </span>
                    {plan.pricePerSeat && (
                      <span className="text-white/60 text-sm">/siège/mois</span>
                    )}
                    {!plan.pricePerSeat && (
                      <span className="text-white/60 text-sm">/mois</span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-white/70 text-sm">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Ajustement du nombre de sièges */}
        {selectedPlan !== 'starter' && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Nombre de sièges
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center"
                min="1"
              />
              <button
                onClick={() => setSeats(seats + 1)}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                +
              </button>
              <span className="text-white/60 text-sm ml-4">
                Total : <span className="text-white font-semibold">{calculatePrice()}€/mois</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Crédits offerts */}
      <GlassCard className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-white font-semibold">50 crédits offerts</p>
            <p className="text-white/60 text-sm">
              Pour démarrer immédiatement avec tous les modules
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
        >
          ← Retour
        </Button>
        
        <Button
          onClick={handleContinue}
          variant="gradient"
          disabled={selectedModules.length === 0}
        >
          Continuer →
        </Button>
      </div>
    </div>
  );
}