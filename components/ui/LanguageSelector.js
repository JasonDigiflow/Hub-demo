'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function LanguageSelector({ variant = 'default' }) {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLang = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (langCode) => {
    setLocale(langCode);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
        >
          <span className="text-lg">{currentLang?.flag}</span>
          <span className="text-sm">{currentLang?.code.toUpperCase()}</span>
          <span className="text-white/40 text-xs">▼</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden z-50"
            >
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all ${
                    locale === lang.code ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-white text-sm">{lang.name}</span>
                  {locale === lang.code && (
                    <span className="ml-auto text-green-400">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <span className="text-xl">{currentLang?.flag}</span>
        <div className="text-left">
          <p className="text-sm font-medium">{currentLang?.name}</p>
          <p className="text-xs text-white/40">Language</p>
        </div>
        <span className="text-white/40 ml-2">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full mt-2 right-0 min-w-[200px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-50"
          >
            <div className="p-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all ${
                    locale === lang.code ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left flex-1">
                    <p className="text-white font-medium">{lang.name}</p>
                    <p className="text-white/40 text-xs">{lang.code.toUpperCase()}</p>
                  </div>
                  {locale === lang.code && (
                    <span className="text-green-400 text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}