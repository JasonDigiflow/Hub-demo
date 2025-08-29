'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, LogOut, RefreshCw, Trash2, User, Building, Link, Unlink, ChevronRight, Shield, Database } from 'lucide-react';
import { useAdAccount } from '@/lib/contexts/AdAccountContext';

export default function AccountPage() {
  const router = useRouter();
  const { selectedAccount, setSelectedAccount, accounts } = useAdAccount();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaConnected, setMetaConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchUserData();
    checkMetaConnection();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMetaConnection = () => {
    // Vérifier le cookie meta_connected ou le localStorage
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const metaCookie = getCookie('meta_connected');
    const metaToken = localStorage.getItem('meta_access_token');
    setMetaConnected(metaCookie === 'true' || !!metaToken);
  };

  const handleMetaDisconnect = async () => {
    setDisconnecting(true);
    try {
      // Clear Meta tokens and data
      localStorage.removeItem('meta_access_token');
      localStorage.removeItem('meta_user_id');
      localStorage.removeItem('selected_ad_account');
      localStorage.removeItem('meta_auth_state');
      
      // Clear caches
      localStorage.removeItem('insights_cache');
      localStorage.removeItem('campaigns_cache');
      localStorage.removeItem('adsets_cache');
      localStorage.removeItem('ads_cache');
      
      setMetaConnected(false);
      setSelectedAccount(null);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/app/aids');
      }, 1500);
    } catch (error) {
      console.error('Error disconnecting Meta:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleMetaReconnect = () => {
    // Clear old tokens first
    localStorage.removeItem('meta_access_token');
    localStorage.removeItem('selected_ad_account');
    
    // Redirect to Meta OAuth flow
    window.location.href = '/api/meta/auth';
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    router.push('/app/aids');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleClearCache = () => {
    const cacheKeys = [
      'insights_cache',
      'campaigns_cache',
      'adsets_cache',
      'ads_cache',
      'aids_logs'
    ];
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
    alert('Cache effacé avec succès');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mon Compte</h1>
          <p className="text-gray-400">Gérez votre compte et vos connexions</p>
        </div>

        {/* User Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Informations du compte</h2>
          </div>
          
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Rôle</p>
                <p className="text-white capitalize">{user.role || 'Utilisateur'}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Organization Info */}
        {organization && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Organisation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Nom</p>
                <p className="text-white">{organization.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">SIRET</p>
                <p className="text-white font-mono">{organization.siret}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Meta Connection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Connexion Meta</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              metaConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {metaConnected ? 'Connecté' : 'Déconnecté'}
            </div>
          </div>

          {metaConnected ? (
            <div className="space-y-4">
              {/* Ad Account Selector */}
              {accounts && accounts.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Compte publicitaire actif</p>
                  <select
                    value={selectedAccount || ''}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleMetaDisconnect}
                  disabled={disconnecting}
                  className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Unlink className="w-4 h-4" />
                  {disconnecting ? 'Déconnexion...' : 'Déconnecter Meta'}
                </button>
                
                <button
                  onClick={handleMetaReconnect}
                  className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconnecter
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">
                Connectez votre compte Meta pour accéder aux données publicitaires
              </p>
              <button
                onClick={handleMetaReconnect}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <Link className="w-4 h-4" />
                Connecter Meta
              </button>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">Actions</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Vider le cache</p>
                  <p className="text-xs text-gray-400">Supprime les données temporaires</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => router.push('/app/aids/reset-all')}
              className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white font-medium">Réinitialiser tout</p>
                  <p className="text-xs text-gray-400">Supprime toutes les données</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">Se déconnecter</p>
                  <p className="text-xs text-red-400/70">Ferme votre session</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400/50 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}