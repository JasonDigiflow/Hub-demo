'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ConnectMetaAds() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fbLoaded, setFbLoaded] = useState(false);

  useEffect(() => {
    // Initialize Facebook SDK
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId: '1994469434647099',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          
          window.FB.AppEvents.logPageView();
          setFbLoaded(true);
          console.log('Facebook SDK initialized');
        }
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          // SDK already loaded, just mark as loaded
          if (window.FB) {
            setFbLoaded(true);
          }
          return;
        }
        js = d.createElement(s); 
        js.id = id;
        js.src = "https://connect.facebook.net/fr_FR/sdk.js";
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'facebook-jssdk'));
    }

    // Check existing connection
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setConnected(true);
        setCurrentUser(data.user);
        setAccounts(data.accounts || []);
        setSelectedAccount(data.selectedAccount);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK pas encore chargé. Veuillez patienter...');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Use regular function, not async
    window.FB.login(function(response) {
      console.log('FB Login Response:', response);
      
      if (response.authResponse) {
        const { accessToken, userID } = response.authResponse;
        
        // Send token to backend
        fetch('/api/aids/meta/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accessToken,
            userID 
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setConnected(true);
            setAccounts(data.accounts || []);
            setCurrentUser(data.user);
            setError(null);
            
            // Show success message
            if (data.message) {
              console.log(data.message);
            }
          } else {
            setError(data.error || 'Connexion échouée. Vérifiez que votre compte a accès à des comptes publicitaires.');
            console.error('Connection failed:', data);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Connect error:', error);
          setError('Erreur de connexion au serveur');
          setLoading(false);
        });
      } else {
        setError('Connexion Facebook annulée');
        setLoading(false);
      }
    }, {
      scope: 'email,ads_management,ads_read,business_management,pages_read_engagement',
      auth_type: 'rerequest',
      return_scopes: true
    });
  };

  const handleSelectAccount = async (accountId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/meta/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedAccount(accountId);
        setTimeout(() => {
          router.push('/app/aids');
        }, 1500);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Erreur lors de la sélection du compte');
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter votre compte Meta ?')) {
      try {
        await fetch('/api/aids/meta/disconnect', { method: 'POST' });
        setConnected(false);
        setAccounts([]);
        setSelectedAccount(null);
        setCurrentUser(null);
        
        // Also logout from Facebook
        if (window.FB) {
          window.FB.logout(function(response) {
            console.log('User logged out from Facebook');
          });
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Connexion Meta Ads
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Connectez votre compte Meta Business pour gérer vos campagnes publicitaires
        </p>
      </div>

      {/* Connection Status */}
      {connected && currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium">Connecté en tant que {currentUser.name}</p>
                <p className="text-gray-400 text-sm">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Déconnecter
            </button>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-medium">Erreur de connexion</p>
              <p className="text-gray-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connect Button */}
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-8 border border-white/10"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Connectez votre compte Meta Business
            </h2>
            <p className="text-gray-400 mb-8">
              Accordez à AIDs la permission de gérer vos campagnes publicitaires
            </p>

            <button
              onClick={handleFacebookLogin}
              disabled={loading || !fbLoaded}
              className={`
                inline-flex items-center px-8 py-4 rounded-xl font-medium transition-all
                ${loading || !fbLoaded
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connexion en cours...
                </>
              ) : !fbLoaded ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Chargement du SDK...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Se connecter avec Facebook
                </>
              )}
            </button>

            {/* SDK Loading Status */}
            {!fbLoaded && (
              <p className="text-xs text-gray-500 mt-3">
                Chargement du SDK Facebook en cours...
              </p>
            )}

            <div className="mt-8 text-left bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Permissions requises :</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Lecture des données de vos comptes publicitaires
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Création et gestion de campagnes
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Analyse des performances
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Gestion des créatives publicitaires
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Selection */}
      {connected && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Sélectionner un compte publicitaire
          </h2>
          <p className="text-gray-400 mb-6">
            Choisissez le compte que AIDs doit gérer :
          </p>

          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${selectedAccount === account.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                  }
                  ${!account.isActive ? 'opacity-60' : ''}
                `}
                onClick={() => account.isActive && handleSelectAccount(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{account.name}</p>
                    <p className="text-sm text-gray-400">ID: {account.id}</p>
                    <p className="text-sm text-gray-500">
                      {account.currency} • {account.timezone_name}
                      {!account.isActive && ' • ' + (account.statusText || 'Inactif')}
                    </p>
                  </div>
                  {selectedAccount === account.id && (
                    <span className="text-2xl">✅</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedAccount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => router.push('/app/aids')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Aller au Dashboard AIDs →
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Demo Mode Notice */}
      {!connected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-yellow-400 font-medium">Mode démo disponible</p>
              <p className="text-gray-400 text-sm mt-1">
                Si vous n'avez pas de compte Meta Business, vous pouvez utiliser AIDs en mode démo 
                en retournant au <a href="/app/aids" className="text-purple-400 hover:text-purple-300">dashboard</a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-800/50 rounded-lg p-4 text-xs text-gray-400">
          <p>SDK Loaded: {fbLoaded ? 'Yes' : 'No'}</p>
          <p>Connected: {connected ? 'Yes' : 'No'}</p>
          <p>Accounts: {accounts.length}</p>
        </div>
      )}

      {/* Privacy Note */}
      <div className="text-center text-sm text-gray-500">
        <p>
          En vous connectant, vous acceptez notre{' '}
          <a href="/privacy" className="text-purple-400 hover:text-purple-300">
            Politique de confidentialité
          </a>
          {' '}et nos{' '}
          <a href="/terms" className="text-purple-400 hover:text-purple-300">
            Conditions d'utilisation
          </a>
        </p>
      </div>
    </div>
  );
}