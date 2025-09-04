'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingProvider } from '@/lib/contexts/OnboardingContext';
import Step1Account from '@/components/onboarding/Step1Account';
import Step2Company from '@/components/onboarding/Step2Company';
import Step3Modules from '@/components/onboarding/Step3Modules';
import Step4Connections from '@/components/onboarding/Step4Connections';
import StepIndicator from '@/components/onboarding/StepIndicator';
import GlassCard from '@/components/ui/GlassCard';

const steps = [
  { id: 1, name: 'Compte', icon: '👤' },
  { id: 2, name: 'Entreprise', icon: '🏢' },
  { id: 3, name: 'Modules', icon: '📦' },
  { id: 4, name: 'Connexions', icon: '🔌' }
];

function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Account onNext={() => setCurrentStep(2)} />;
      case 2:
        return <Step2Company onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <Step3Modules onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Step4Connections onComplete={() => router.push('/app/dashboard')} onBack={() => setCurrentStep(3)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                DigiFlow <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hub</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <GlassCard className="p-6 sm:p-8 lg:p-10 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {/* Login link */}
        <p className="text-center text-white/60 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterV2Page() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}