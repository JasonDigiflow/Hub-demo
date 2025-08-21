'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    }
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      setUser(userData);
      setFormData({
        ...formData,
        name: userData.name || '',
        email: userData.email || '',
        company: userData.organizationName || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Simulate saving
    console.log('Saving settings:', formData);
    // Show success message
    alert('Paramètres sauvegardés avec succès !');
  };

  const handlePasswordChange = () => {
    // Simulate password change
    alert('Un email de réinitialisation a été envoyé');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🔐' },
    { id: 'privacy', label: 'Confidentialité', icon: '🛡️' },
    { id: 'integrations', label: 'Intégrations', icon: '🔗' },
    { id: 'advanced', label: 'Avancé', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Paramètres</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Gérez vos préférences et configurations
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informations du profil</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Langue
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                  <option value="Europe/London">Londres (GMT)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Préférences de notifications</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Notifications par email</p>
                  <p className="text-gray-400 text-sm">Recevez des alertes importantes par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, email: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Notifications push</p>
                  <p className="text-gray-400 text-sm">Notifications en temps réel dans l'application</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, push: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Notifications SMS</p>
                  <p className="text-gray-400 text-sm">Alertes critiques par SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.sms}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, sms: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Communications marketing</p>
                  <p className="text-gray-400 text-sm">Nouveautés et offres spéciales</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.marketing}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, marketing: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sécurité du compte</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-medium mb-2">Mot de passe</h3>
                <p className="text-gray-400 text-sm mb-4">Dernière modification il y a 45 jours</p>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Changer le mot de passe
                </button>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-medium mb-2">Authentification à deux facteurs</h3>
                <p className="text-gray-400 text-sm mb-4">Ajoutez une couche de sécurité supplémentaire</p>
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                  Configurer 2FA
                </button>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-medium mb-2">Sessions actives</h3>
                <p className="text-gray-400 text-sm mb-4">Gérez vos sessions sur différents appareils</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💻</span>
                      <div>
                        <p className="text-sm text-white">Chrome - MacOS</p>
                        <p className="text-xs text-gray-400">Session actuelle</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Paramètres de confidentialité</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Profil visible</p>
                  <p className="text-gray-400 text-sm">Votre profil peut être vu par les membres de l'équipe</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.privacy.profileVisible}
                  onChange={(e) => setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, profileVisible: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">Afficher l'email</p>
                  <p className="text-gray-400 text-sm">Les autres peuvent voir votre adresse email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.privacy.showEmail}
                  onChange={(e) => setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, showEmail: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Intégrations tierces</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Google Workspace', icon: '🔷', connected: true },
                { name: 'Slack', icon: '💬', connected: false },
                { name: 'Zapier', icon: '⚡', connected: true },
                { name: 'HubSpot', icon: '🎯', connected: false },
                { name: 'Stripe', icon: '💳', connected: true },
                { name: 'Mailchimp', icon: '📧', connected: false }
              ].map((integration) => (
                <div key={integration.name} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="text-white font-medium">{integration.name}</p>
                        <p className="text-xs text-gray-400">
                          {integration.connected ? 'Connecté' : 'Non connecté'}
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      integration.connected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    } transition-colors`}>
                      {integration.connected ? 'Déconnecter' : 'Connecter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Paramètres avancés</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="text-yellow-400 font-medium mb-2">⚠️ Zone dangereuse</h3>
                <p className="text-gray-400 text-sm mb-4">Ces actions sont irréversibles</p>
                <div className="space-y-2">
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Exporter mes données
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors ml-2">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-medium mb-2">Mode développeur</h3>
                <p className="text-gray-400 text-sm mb-4">Accédez aux fonctionnalités avancées</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-white text-sm">Activer le mode développeur</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium">
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
        >
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
}