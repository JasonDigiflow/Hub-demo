'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

// Données de facturation mockées
const invoices = [
  {
    id: 'INV-2024-001',
    date: '2024-12-01',
    amount: 79,
    status: 'paid',
    period: 'Décembre 2024',
    plan: 'Starter'
  },
  {
    id: 'INV-2024-002',
    date: '2024-11-01',
    amount: 79,
    status: 'paid',
    period: 'Novembre 2024',
    plan: 'Starter'
  },
  {
    id: 'INV-2024-003',
    date: '2024-10-01',
    amount: 79,
    status: 'paid',
    period: 'Octobre 2024',
    plan: 'Starter'
  }
];

const paymentMethods = [
  {
    id: 1,
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
];

export default function BillingPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [seats, setSeats] = useState(1);
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 79,
      seats: 1,
      features: [
        '1 utilisateur',
        '100 crédits/mois',
        'Support email',
        'Tous les modules'
      ]
    },
    {
      id: 'team',
      name: 'Team',
      price: 59,
      pricePerSeat: true,
      seats: 5,
      features: [
        '5 utilisateurs',
        '500 crédits/mois',
        'Support prioritaire',
        'Formations incluses'
      ],
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 49,
      pricePerSeat: true,
      seats: 10,
      features: [
        '10+ utilisateurs',
        '1000 crédits/mois',
        'Support dédié',
        'API avancée'
      ]
    }
  ];

  const calculatePrice = (plan) => {
    if (plan.pricePerSeat) {
      return plan.price * (plan.id === currentPlan ? seats : plan.seats);
    }
    return plan.price;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Facturation & Abonnement' : 'Billing & Subscription'}
        </h1>
        <p className="text-white/60">
          {locale === 'fr' 
            ? 'Gérez votre abonnement et consultez vos factures'
            : 'Manage your subscription and view your invoices'
          }
        </p>
      </motion.div>

      {/* Current Plan */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {locale === 'fr' ? 'Abonnement actuel' : 'Current Subscription'}
          </h2>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
            Actif
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-white/60 text-sm">Plan</p>
            <p className="text-white text-xl font-bold">Starter</p>
          </div>
          <div>
            <p className="text-white/60 text-sm">{locale === 'fr' ? 'Prochaine facture' : 'Next invoice'}</p>
            <p className="text-white text-xl font-bold">79€</p>
            <p className="text-white/40 text-sm">1 janvier 2025</p>
          </div>
          <div>
            <p className="text-white/60 text-sm">{locale === 'fr' ? 'Crédits restants' : 'Credits remaining'}</p>
            <p className="text-white text-xl font-bold">50/100</p>
          </div>
        </div>
      </GlassCard>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Plans disponibles' : 'Available Plans'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            
            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard 
                  className={`p-6 relative ${
                    isCurrentPlan ? 'border-purple-500/50' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full">
                        {locale === 'fr' ? 'Populaire' : 'Popular'}
                      </span>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <span className="text-green-400">✓</span>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                      {calculatePrice(plan)}€
                    </span>
                    <span className="text-white/60 text-sm">
                      {plan.pricePerSeat ? '/mois' : '/mois'}
                    </span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant={isCurrentPlan ? 'outline' : 'gradient'}
                    className="w-full"
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan 
                      ? (locale === 'fr' ? 'Plan actuel' : 'Current plan')
                      : (locale === 'fr' ? 'Choisir ce plan' : 'Choose this plan')
                    }
                  </Button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {locale === 'fr' ? 'Moyens de paiement' : 'Payment Methods'}
          </h2>
          <Button variant="outline" className="text-sm">
            {locale === 'fr' ? '+ Ajouter' : '+ Add'}
          </Button>
        </div>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-white">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-white/40 text-sm">
                    Expire {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              
              {method.isDefault && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  {locale === 'fr' ? 'Par défaut' : 'Default'}
                </span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Invoices */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Historique des factures' : 'Invoice History'}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 text-sm pb-3">
                  {locale === 'fr' ? 'Facture' : 'Invoice'}
                </th>
                <th className="text-left text-white/60 text-sm pb-3">
                  {locale === 'fr' ? 'Date' : 'Date'}
                </th>
                <th className="text-left text-white/60 text-sm pb-3">
                  {locale === 'fr' ? 'Période' : 'Period'}
                </th>
                <th className="text-left text-white/60 text-sm pb-3">
                  {locale === 'fr' ? 'Montant' : 'Amount'}
                </th>
                <th className="text-left text-white/60 text-sm pb-3">
                  Status
                </th>
                <th className="text-left text-white/60 text-sm pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5">
                  <td className="py-3 text-white">{invoice.id}</td>
                  <td className="py-3 text-white/80">
                    {new Date(invoice.date).toLocaleDateString(locale)}
                  </td>
                  <td className="py-3 text-white/80">{invoice.period}</td>
                  <td className="py-3 text-white">{invoice.amount}€</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      {locale === 'fr' ? 'Payée' : 'Paid'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      {locale === 'fr' ? 'Télécharger' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}