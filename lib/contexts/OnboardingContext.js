'use client';

import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext({});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    // Step 1 - Account
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
    locale: 'fr',
    
    // Step 2 - Company
    companyChoice: '', // 'create' | 'join' | 'no-siret'
    siret: '',
    inviteCode: '',
    companyData: null,
    
    // Step 3 - Modules & Subscription
    selectedModules: [],
    selectedPlan: null,
    seats: 1,
    
    // Step 4 - Connections
    connections: {
      metaAds: null,
      googleAds: null,
      tiktokAds: null,
      whatsapp: null,
      email: null,
      sms: null,
      stripe: null
    }
  });

  const updateOnboardingData = (data) => {
    setOnboardingData(prev => ({
      ...prev,
      ...data
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const value = {
    currentStep,
    onboardingData,
    updateOnboardingData,
    nextStep,
    previousStep,
    goToStep
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};