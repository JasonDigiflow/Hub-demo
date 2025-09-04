'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useOnboarding } from '@/lib/contexts/OnboardingContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Step1Account({ onNext }) {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const { t, locale, setLocale } = useLocale();
  const [formData, setFormData] = useState({
    email: onboardingData.email || '',
    password: '',
    confirmPassword: '',
    firstName: onboardingData.firstName || '',
    lastName: onboardingData.lastName || '',
    locale: locale || 'fr',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'locale') {
      setLocale(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError(t('onboarding.account.errors.required'));
      return false;
    }

    if (formData.password.length < 8) {
      setError(t('onboarding.account.errors.passwordLength'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('onboarding.account.errors.passwordMismatch'));
      return false;
    }

    if (!formData.acceptTerms) {
      setError(t('onboarding.account.errors.acceptTerms'));
      return false;
    }

    // Validation email anti-disposable (simplifiée)
    const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
    const emailDomain = formData.email.split('@')[1];
    if (disposableDomains.includes(emailDomain)) {
      setError(t('onboarding.account.errors.disposableEmail'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    // Note: On ne crée PAS encore le compte Firebase ici
    // On sauvegarde juste les données pour la création finale
    
    const displayName = `${formData.firstName} ${formData.lastName}`;

    // Sauvegarder dans le contexte d'onboarding
    updateOnboardingData({
      email: formData.email,
      password: formData.password, // Sera utilisé à la fin
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName,
      locale: formData.locale
    });

    setLoading(false);
    
    // Passer à l'étape suivante
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('onboarding.account.title')}
        </h2>
        <p className="text-white/60">
          {t('onboarding.account.subtitle')}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('onboarding.account.firstName')}
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={locale === 'fr' ? 'Jean' : 'John'}
            required
          />
          
          <Input
            label={t('onboarding.account.lastName')}
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={locale === 'fr' ? 'Dupont' : 'Doe'}
            required
          />
        </div>

        <Input
          label={t('onboarding.account.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={locale === 'fr' ? 'vous@entreprise.com' : 'you@company.com'}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('onboarding.account.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          
          <Input
            label={t('onboarding.account.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
        
        <p className="text-white/40 text-xs">
          {t('onboarding.account.passwordHint')}
        </p>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            {t('onboarding.account.language')}
          </label>
          <select
            name="locale"
            value={formData.locale}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-200"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="mt-1 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
          />
          <label className="ml-2 text-white/60 text-sm">
            {t('onboarding.account.terms')}{' '}
            <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300">
              {t('onboarding.account.termsLink')}
            </a>
            {' '}{t('onboarding.account.privacy')}{' '}
            <a href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300">
              {t('onboarding.account.privacyLink')}
            </a>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="gradient"
          className="w-full"
        >
          {loading ? t('onboarding.account.submitting') : t('onboarding.account.submit')}
        </Button>
      </form>
    </div>
  );
}