'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 29, yearly: 290 },
      features: [
        '1 utilisateur',
        '2 applications',
        '1,000 crédits/mois',
        'Support par email',
        'Analytics de base'
      ],
      color: 'from-blue-600 to-cyan-600',
      icon: '🚀'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 99, yearly: 990 },
      features: [
        '5 utilisateurs',
        '5 applications',
        '10,000 crédits/mois',
        'Support prioritaire',
        'Analytics avancé',
        'API access',
        'Intégrations illimitées'
      ],
      color: 'from-purple-600 to-pink-600',
      icon: '⭐',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 299, yearly: 2990 },
      features: [
        'Utilisateurs illimités',
        'Applications illimitées',
        'Crédits illimités',
        'Support dédié 24/7',
        'Analytics personnalisé',
        'API avancée',
        'Formation équipe',
        'SLA garanti'
      ],
      color: 'from-orange-600 to-red-600',
      icon: '👑'
    }
  ];

  const invoices = [
    { id: 'INV-2024-008', date: '01/08/2024', amount: 99, status: 'paid' },
    { id: 'INV-2024-007', date: '01/07/2024', amount: 99, status: 'paid' },
    { id: 'INV-2024-006', date: '01/06/2024', amount: 99, status: 'paid' },
    { id: 'INV-2024-005', date: '01/05/2024', amount: 99, status: 'paid' },
    { id: 'INV-2024-004', date: '01/04/2024', amount: 99, status: 'paid' }
  ];

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    setCurrentPlan(selectedPlan.id);
    setShowUpgradeModal(false);
    alert(`Passage au plan ${selectedPlan.name} confirmé !`);
  };

  const calculateSavings = (plan) => {
    const monthlyCost = plan.price.monthly * 12;
    const yearlyCost = plan.price.yearly;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Facturation</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez votre abonnement et vos paiements
          </p>
        </div>
        
        {/* Billing Period Toggle */}
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Annuel
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-600/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Plan actuel : Pro</h2>
            <p className="text-gray-300">
              Prochain paiement : 99€ le 1er septembre 2024
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-400">Crédits utilisés</p>
                <p className="text-2xl font-bold text-white">6,543 / 10,000</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div>
                <p className="text-sm text-gray-400">Utilisateurs</p>
                <p className="text-2xl font-bold text-white">3 / 5</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors mb-2">
              Gérer le paiement
            </button>
            <p className="text-xs text-gray-400">Renouvelé automatiquement</p>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white/5 rounded-xl border ${
                plan.id === currentPlan ? 'border-purple-500' : 'border-white/10'
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAIRE
                </div>
              )}
              
              {plan.id === currentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  ACTUEL
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl">{plan.icon}</span>
                    <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                      -{calculateSavings(plan)}%
                    </span>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">
                      {plan.price[billingPeriod]}€
                    </span>
                    <span className="text-gray-400 ml-2">
                      /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-gray-400 mt-1">
                      soit {Math.round(plan.price.yearly / 12)}€/mois
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.id === currentPlan ? (
                  <button className="w-full py-3 bg-white/10 text-white rounded-lg font-medium cursor-not-allowed">
                    Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-3 bg-gradient-to-r ${plan.color} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
                  >
                    {plan.id === 'starter' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Moyen de paiement</h2>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-400">Expire 12/2025</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
            Modifier
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Historique des factures</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Numéro</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Montant</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-white">{invoice.amount}€</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Payée
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                      Télécharger PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <div className="text-center mb-6">
                <span className="text-5xl">{selectedPlan.icon}</span>
                <h2 className="text-2xl font-bold text-white mt-4 mb-2">
                  Passer au plan {selectedPlan.name}
                </h2>
                <p className="text-gray-300">
                  {selectedPlan.price[billingPeriod]}€/{billingPeriod === 'monthly' ? 'mois' : 'an'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Ce plan inclut :</h3>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmUpgrade}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r ${selectedPlan.color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}