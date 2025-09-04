'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { t } from '@/lib/i18n/translations';

const LocaleContext = createContext({});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }) => {
  const { user } = useAuth();
  const [locale, setLocale] = useState('fr');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // D'abord, vérifier le localStorage
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
    } else if (user?.locale) {
      // Ensuite, récupérer la langue de l'utilisateur connecté
      setLocale(user.locale);
      localStorage.setItem('locale', user.locale);
    } else if (typeof navigator !== 'undefined') {
      // Sinon, détecter la langue du navigateur
      const browserLang = navigator.language.split('-')[0];
      const detectedLocale = browserLang === 'en' ? 'en' : 'fr';
      setLocale(detectedLocale);
      localStorage.setItem('locale', detectedLocale);
    }
    setIsInitialized(true);
  }, [user]);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('locale', newLocale);
    // Optionnel: Recharger la page pour appliquer partout
    // window.location.reload();
  };

  // Fonction de traduction contextualisée
  const translate = (key) => {
    return t(key, locale);
  };

  const value = {
    locale,
    setLocale: changeLocale,
    t: translate
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};