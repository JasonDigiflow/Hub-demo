'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Jason Sotoca',
    email: 'jason@behype-app.com',
    phone: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    console.log('Settings saved:', formData);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'preferences', label: 'Préférences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🔒' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Paramètres</span>
        </h1>
        <p className="text-white/70">
          Gérez vos préférences et la configuration de votre compte
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 text-left
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                      : 'hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <GlassCard className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Informations du profil</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      label="Nom complet"
                      value={formData.name}
                      onChange={handleChange}
                      icon="👤"
                    />
                    <Input
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      icon="📧"
                    />
                    <Input
                      name="phone"
                      label="Téléphone"
                      placeholder="+33 6 00 00 00 00"
                      value={formData.phone}
                      onChange={handleChange}
                      icon="📱"
                    />
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Rôle
                      </label>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-sm">
                          Propriétaire
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Préférences générales</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Langue
                    </label>
                    <select 
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Fuseau horaire
                    </label>
                    <select 
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Préférences de notifications</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-semibold">Notifications par email</p>
                      <p className="text-sm text-white/50">Recevoir les mises à jour par email</p>
                    </div>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-semibold">Notifications push</p>
                      <p className="text-sm text-white/50">Notifications dans le navigateur</p>
                    </div>
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={formData.pushNotifications}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-semibold">Rapport hebdomadaire</p>
                      <p className="text-sm text-white/50">Résumé de vos performances</p>
                    </div>
                    <input
                      type="checkbox"
                      name="weeklyReport"
                      checked={formData.weeklyReport}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Sécurité du compte</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">Mot de passe</p>
                      <Button variant="outline" className="text-sm py-2 px-4">
                        Modifier
                      </Button>
                    </div>
                    <p className="text-sm text-white/50">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">Authentification à deux facteurs</p>
                      <Button variant="outline" className="text-sm py-2 px-4">
                        Activer
                      </Button>
                    </div>
                    <p className="text-sm text-white/50">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">Sessions actives</p>
                      <Button variant="outline" className="text-sm py-2 px-4">
                        Voir tout
                      </Button>
                    </div>
                    <p className="text-sm text-white/50">
                      1 appareil connecté
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline">
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer les modifications
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}