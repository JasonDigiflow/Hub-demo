'use client';

import { useLocale } from '@/lib/contexts/LocaleContext';
import { motion } from 'framer-motion';

export default function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }}
    >
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </motion.div>
  );
}