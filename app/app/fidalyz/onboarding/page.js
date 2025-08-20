'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';

export default function FidalyzOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessSector: '',
    businessDescription: '',
    platforms: {
      google: false,
      tripadvisor: false,
      facebook: false
    },
    voiceTone: 'professional',
    aiAutonomy: 'moderate',
    notifications: true
  });

  const steps = [
    { number: 1, title: 'Informations entreprise', icon: '🏢' },
    { number: 2, title: 'Plateformes', icon: '🌐' },
    { number: 3, title: 'Ton de voix', icon: '🎯' },
    { number: 4, title: 'Configuration IA', icon: '🤖' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('fidalyz_onboarding_completed', 'true');
      localStorage.setItem('fidalyz_config', JSON.stringify(formData));
      router.push('/app/fidalyz');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('platforms.')) {
      const platform = name.split('.')[1];
      setFormData({
        ...formData,
        platforms: {
          ...formData.platforms,
          [platform]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Configuration de <span className="gradient-text">Fidalyz</span>
          </h1>
          <p className="text-white/70">
            Personnalisons votre expérience en quelques étapes
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center ${step.number < 4 ? 'flex-1' : ''}`}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${currentStep >= step.number 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                  : 'bg-white/10'
                }
              `}>
                <span className="text-xl">{step.icon}</span>
              </div>
              {step.number < 4 && (
                <div className={`
                  flex-1 h-0.5 mx-2
                  ${currentStep > step.number ? 'bg-purple-500' : 'bg-white/10'}
                `} />
              )}
            </div>
          ))}
        </div>

        <GlassCard className="p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Informations sur votre entreprise</h2>
                <Input
                  name="businessName"
                  label="Nom de l'entreprise"
                  placeholder="Behype"
                  value={formData.businessName}
                  onChange={handleChange}
                  icon="🏢"
                />
                <Input
                  name="businessSector"
                  label="Secteur d'activité"
                  placeholder="Marketing Digital"
                  value={formData.businessSector}
                  onChange={handleChange}
                  icon="📊"
                />
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description de l'entreprise
                  </label>
                  <textarea
                    name="businessDescription"
                    placeholder="Décrivez votre activité en quelques mots..."
                    value={formData.businessDescription}
                    onChange={handleChange}
                    className="w-full h-32 resize-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Plateformes à connecter</h2>
                <p className="text-white/70 mb-6">
                  Sélectionnez les plateformes où vous souhaitez gérer vos avis
                </p>
                <div className="space-y-4">
                  {Object.entries({
                    google: { name: 'Google My Business', icon: '🔍', color: 'from-blue-500 to-blue-600' },
                    tripadvisor: { name: 'TripAdvisor', icon: '✈️', color: 'from-green-500 to-green-600' },
                    facebook: { name: 'Facebook', icon: '👍', color: 'from-indigo-500 to-indigo-600' }
                  }).map(([key, platform]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                          <span className="text-2xl">{platform.icon}</span>
                        </div>
                        <span className="font-semibold">{platform.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        name={`platforms.${key}`}
                        checked={formData.platforms[key]}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Ton de voix</h2>
                <p className="text-white/70 mb-6">
                  Comment souhaitez-vous que Zoë réponde à vos clients ?
                </p>
                <div className="space-y-3">
                  {[
                    { value: 'professional', label: 'Professionnel', desc: 'Formel et structuré' },
                    { value: 'friendly', label: 'Amical', desc: 'Chaleureux et accessible' },
                    { value: 'casual', label: 'Décontracté', desc: 'Simple et naturel' }
                  ].map((tone) => (
                    <label
                      key={tone.value}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div>
                        <p className="font-semibold">{tone.label}</p>
                        <p className="text-sm text-white/50">{tone.desc}</p>
                      </div>
                      <input
                        type="radio"
                        name="voiceTone"
                        value={tone.value}
                        checked={formData.voiceTone === tone.value}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Configuration de l'IA</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-4">
                      Niveau d'autonomie de Zoë
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'low', label: 'Faible', desc: 'Suggestions uniquement' },
                        { value: 'moderate', label: 'Modéré', desc: 'Réponses semi-automatiques' },
                        { value: 'high', label: 'Élevé', desc: 'Réponses automatiques' }
                      ].map((level) => (
                        <label
                          key={level.value}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                        >
                          <div>
                            <p className="font-semibold">{level.label}</p>
                            <p className="text-sm text-white/50">{level.desc}</p>
                          </div>
                          <input
                            type="radio"
                            name="aiAutonomy"
                            value={level.value}
                            checked={formData.aiAutonomy === level.value}
                            onChange={handleChange}
                            className="w-5 h-5"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-semibold">Notifications</p>
                      <p className="text-sm text-white/50">Recevoir des alertes pour les nouveaux avis</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              ← Précédent
            </Button>
            <Button onClick={handleNext}>
              {currentStep === 4 ? 'Terminer' : 'Suivant →'}
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}