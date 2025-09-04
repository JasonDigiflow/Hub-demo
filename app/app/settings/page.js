'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/contexts/LocaleContext';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [savedNotification, setSavedNotification] = useState(false);

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const settings = [
    {
      category: locale === 'fr' ? 'Général' : 'General',
      icon: '⚙️',
      items: [
        {
          label: locale === 'fr' ? 'Langue de l\'application' : 'Application Language',
          description: locale === 'fr' 
            ? 'Choisissez la langue pour toute l\'application' 
            : 'Choose the language for the entire application',
          component: (
            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    locale === lang.code
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {locale === lang.code && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          )
        },
        {
          label: locale === 'fr' ? 'Thème' : 'Theme',
          description: locale === 'fr' ? 'Mode sombre uniquement (pour le moment)' : 'Dark mode only (for now)',
          component: (
            <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌙</span>
                <span className="text-white/70">{locale === 'fr' ? 'Mode Sombre' : 'Dark Mode'}</span>
                <span className="ml-auto text-green-400">✓</span>
              </div>
            </div>
          )
        }
      ]
    },
    {
      category: locale === 'fr' ? 'Notifications' : 'Notifications',
      icon: '🔔',
      items: [
        {
          label: locale === 'fr' ? 'Notifications Email' : 'Email Notifications',
          description: locale === 'fr' ? 'Recevoir des notifications par email' : 'Receive email notifications',
          component: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
            </label>
          )
        },
        {
          label: locale === 'fr' ? 'Notifications Push' : 'Push Notifications',
          description: locale === 'fr' ? 'Recevoir des notifications dans le navigateur' : 'Receive browser notifications',
          component: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
            </label>
          )
        }
      ]
    },
    {
      category: locale === 'fr' ? 'Modules' : 'Modules',
      icon: '🧩',
      items: [
        {
          label: locale === 'fr' ? 'Modules épinglés' : 'Pinned Modules',
          description: locale === 'fr' ? 'Gérer vos modules favoris' : 'Manage your favorite modules',
          component: (
            <div className="grid grid-cols-2 gap-2">
              {['HubCRM', 'Ads Master', 'LeadWarm', 'Fidalyz'].map(module => (
                <div key={module} className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-center">
                  <span className="text-white/70 text-sm">{module}</span>
                </div>
              ))}
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition-all inline-flex items-center gap-2"
        >
          ← {locale === 'fr' ? 'Retour' : 'Back'}
        </button>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          {locale === 'fr' ? 'Paramètres' : 'Settings'}
        </h1>
        <p className="text-white/70 mt-2">
          {locale === 'fr' ? 'Personnalisez votre expérience DigiFlow Hub' : 'Customize your DigiFlow Hub experience'}
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-4xl">
        {settings.map((section, sectionIdx) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
          >
            <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-white">{section.category}</h2>
              </div>
              
              <div className="space-y-6">
                {section.items.map((item, idx) => (
                  <div key={idx} className="pb-6 last:pb-0 border-b last:border-0 border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-white font-medium mb-1">{item.label}</h3>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                    </div>
                    <div>{item.component}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Save Notification */}
      {savedNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="text-white font-medium">
              {locale === 'fr' ? 'Paramètres sauvegardés' : 'Settings saved'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 max-w-4xl"
      >
        <GlassCard className="p-6 backdrop-blur-xl bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="text-white font-medium mb-2">
                {locale === 'fr' ? 'Astuce Pro' : 'Pro Tip'}
              </h3>
              <p className="text-white/70 text-sm">
                {locale === 'fr' 
                  ? 'Le changement de langue s\'applique immédiatement à toute l\'application. Vos préférences sont sauvegardées automatiquement.'
                  : 'Language change applies immediately to the entire application. Your preferences are saved automatically.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}