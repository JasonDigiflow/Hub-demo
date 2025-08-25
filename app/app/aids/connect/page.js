'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export default function ConnectMetaAds() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fbLoaded, setFbLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  useEffect(() => {
    // Initialize Facebook SDK
    if (typeof window !== 'undefined') {
      // Clean up any existing SDK
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
      
      window.fbAsyncInit = function() {
        if (window.FB) {
          try {
            window.FB.init({
              appId: '1994469434647099',
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            
            window.FB.AppEvents.logPageView();
            setFbLoaded(true);
            setSdkError(null);
            console.log('Facebook SDK initialized successfully');
            aidsLogger.info(LogCategories.AUTH, 'Facebook SDK initialisé');
          } catch (error) {
            console.error('Error initializing Facebook SDK:', error);
            setSdkError('Erreur initialisation SDK Facebook');
            aidsLogger.error(LogCategories.AUTH, 'Erreur init SDK Facebook', error);
          }
        }
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          // SDK already exists, try to init again
          if (window.FB) {
            setFbLoaded(true);
            console.log('Facebook SDK already loaded');
          }
          return;
        }
        js = d.createElement(s); 
        js.id = id;
        js.src = "https://connect.facebook.net/fr_FR/sdk.js";
        js.onerror = function() {
          setSdkError('Impossible de charger le SDK Facebook');
          aidsLogger.error(LogCategories.AUTH, 'Erreur chargement SDK Facebook');
        };
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
      aidsLogger.info(LogCategories.AUTH, 'Vérification connexion Meta existante');
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setConnected(true);
        setCurrentUser(data.user);
        setAccounts(data.accounts || []);
        setSelectedAccount(data.selectedAccount);
        aidsLogger.success(LogCategories.AUTH, 'Connexion Meta existante trouvée', {
          user: data.user?.name,
          accountsCount: data.accounts?.length
        });
      } else {
        aidsLogger.info(LogCategories.AUTH, 'Pas de connexion Meta existante');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      aidsLogger.error(LogCategories.AUTH, 'Erreur vérification connexion', error);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK pas encore chargé. Veuillez patienter...');
      aidsLogger.warning(LogCategories.AUTH, 'Tentative connexion sans SDK');
      return;
    }

    setLoading(true);
    setError(null);
    
    aidsLogger.info(LogCategories.AUTH, 'Démarrage connexion Facebook');
    console.log('Starting Facebook login with reauthorize...');
    
    // First, check current login status
    window.FB.getLoginStatus(function(statusResponse) {
      console.log('Current login status:', statusResponse.status);
      
      // Force logout first if connected to ensure fresh authorization
      if (statusResponse.status === 'connected') {
        console.log('User already connected, logging out first...');
        window.FB.logout(function() {
          console.log('Logged out, now requesting new login...');
          performLogin();
        });
      } else {
        performLogin();
      }
    });
    
    function performLogin() {
      // Use FB.login with auth_type: 'reauthorize' to force permission dialog
      window.FB.login(function(response) {
        console.log('FB Login Response:', response);
        aidsLogger.info(LogCategories.AUTH, 'Réponse login Facebook', {
          status: response.status,
          hasAuthResponse: !!response.authResponse
        });
        
        if (response.authResponse) {
          const { accessToken, userID, grantedScopes } = response.authResponse;
          
          console.log('Granted scopes:', grantedScopes);
          aidsLogger.info(LogCategories.AUTH, 'Permissions accordées', {
            scopes: grantedScopes
          });
          
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
              
              aidsLogger.success(LogCategories.AUTH, 'Connexion Meta réussie', {
                user: data.user?.name,
                accountsCount: data.accounts?.length
              });
              
              // Show success message
              if (data.message) {
                console.log(data.message);
              }
            } else {
              const errorMsg = data.error || 'Connexion échouée. Vérifiez que votre compte a accès à des comptes publicitaires.';
              setError(errorMsg);
              console.error('Connection failed:', data);
              aidsLogger.error(LogCategories.AUTH, 'Échec connexion Meta', {
                error: data.error,
                details: data.details
              });
            }
            setLoading(false);
          })
          .catch(error => {
            console.error('Connect error:', error);
            setError('Erreur de connexion au serveur');
            aidsLogger.critical(LogCategories.AUTH, 'Erreur critique connexion', error);
            setLoading(false);
          });
        } else {
          setError('Connexion Facebook annulée ou permissions refusées');
          aidsLogger.warning(LogCategories.AUTH, 'Connexion Facebook annulée');
          setLoading(false);
        }
      }, {
        scope: 'email,ads_management,ads_read,business_management,pages_read_engagement,leads_retrieval,pages_manage_metadata,pages_manage_ads',
        auth_type: 'reauthorize', // Force showing the permission dialog
        return_scopes: true
      });
    }
  };

  const handleSelectAccount = async (accountId) => {
    setLoading(true);
    try {
      aidsLogger.info(LogCategories.META_API, 'Sélection compte publicitaire', { accountId });
      
      const response = await fetch('/api/aids/meta/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedAccount(accountId);
        aidsLogger.success(LogCategories.META_API, 'Compte publicitaire sélectionné', { accountId });
        setTimeout(() => {
          router.push('/app/aids');
        }, 1500);
      } else {
        setError(data.error);
        aidsLogger.error(LogCategories.META_API, 'Erreur sélection compte', {
          accountId,
          error: data.error
        });
      }
    } catch (error) {
      setError('Erreur lors de la sélection du compte');
      aidsLogger.error(LogCategories.META_API, 'Erreur sélection compte', error);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter votre compte Meta ?')) {
      setLoading(true);
      try {
        aidsLogger.info(LogCategories.AUTH, 'Déconnexion Meta initiée par l\'utilisateur');
        
        // First disconnect from our backend
        const response = await fetch('/api/aids/meta/disconnect', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
          setConnected(false);
          setAccounts([]);
          setSelectedAccount(null);
          setCurrentUser(null);
          
          aidsLogger.success(LogCategories.AUTH, 'Déconnexion backend réussie', {
            tokenRevoked: data.tokenRevoked
          });
          
          // Then logout from Facebook SDK
          if (window.FB) {
            window.FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                window.FB.logout(function(response) {
                  console.log('User logged out from Facebook SDK');
                  aidsLogger.success(LogCategories.AUTH, 'Déconnexion Facebook SDK réussie');
                });
              }
            });
          }
          
          // Clear any cached data
          if (typeof window !== 'undefined') {
            // Clear Facebook cookies if possible
            document.cookie.split(";").forEach(function(c) { 
              if (c.indexOf('fbsr_') === 0 || c.indexOf('fbm_') === 0) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              }
            });
          }
          
          // Reload page to clear any cached state
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          setError(data.error || 'Erreur lors de la déconnexion');
          aidsLogger.error(LogCategories.AUTH, 'Échec déconnexion', {
            error: data.error
          });
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        setError('Erreur lors de la déconnexion');
        aidsLogger.critical(LogCategories.AUTH, 'Erreur critique déconnexion', error);
      } finally {
        setLoading(false);
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

      {/* SDK Status */}
      {!fbLoaded && !sdkError && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-blue-400">Chargement du SDK Facebook...</p>
          </div>
        </div>
      )}

      {/* SDK Error */}
      {sdkError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-medium">Erreur SDK Facebook</p>
              <p className="text-gray-400 text-sm mt-1">{sdkError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
              disabled={loading}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {loading ? 'Déconnexion...' : 'Déconnecter'}
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
      {!connected && fbLoaded && (
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
            <p className="text-gray-400 mb-6">
              Gérez vos campagnes publicitaires, audiences et analyses directement depuis AIDs
            </p>

            <button
              onClick={handleFacebookLogin}
              disabled={loading || !fbLoaded}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Se connecter avec Facebook</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              En vous connectant, vous autorisez AIDs à accéder à vos données publicitaires Meta
            </p>
          </div>
        </motion.div>
      )}

      {/* Ad Accounts Selection */}
      {connected && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Sélectionnez un compte publicitaire
          </h3>
          <div className="space-y-3">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSelectAccount(account.id)}
                disabled={loading || selectedAccount === account.id}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  selectedAccount === account.id
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-400">{account.id}</p>
                    {account.currency && (
                      <p className="text-xs text-gray-500 mt-1">
                        {account.currency} • {account.timezone_name || 'UTC'}
                      </p>
                    )}
                  </div>
                  {selectedAccount === account.id && (
                    <div className="text-purple-400">
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* No accounts warning */}
      {connected && accounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-medium">Aucun compte publicitaire trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                Votre compte Facebook n\'a accès à aucun compte publicitaire. 
                Veuillez vérifier vos permissions dans Meta Business Manager.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}