'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function TestTokensPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [newToken, setNewToken] = useState({ name: '', token: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadTokens();
    checkActiveToken();
  }, []);

  const loadTokens = () => {
    const saved = localStorage.getItem('test_tokens');
    if (saved) {
      setTokens(JSON.parse(saved));
    }
  };

  const checkActiveToken = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      if (data.connected && data.session) {
        setActiveToken(data.session.userName);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const saveToken = () => {
    if (!newToken.name || !newToken.token) {
      alert('Nom et token requis');
      return;
    }

    const updatedTokens = [...tokens, { ...newToken, id: Date.now() }];
    setTokens(updatedTokens);
    localStorage.setItem('test_tokens', JSON.stringify(updatedTokens));
    setNewToken({ name: '', token: '', description: '' });
  };

  const deleteToken = (id) => {
    const updatedTokens = tokens.filter(t => t.id !== id);
    setTokens(updatedTokens);
    localStorage.setItem('test_tokens', JSON.stringify(updatedTokens));
  };

  const testToken = async (token) => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Test du token via l'API manual-token
      const response = await fetch('/api/aids/meta/manual-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult({
          success: true,
          message: `✅ Token valide pour ${token.name}`,
          details: data
        });
        setActiveToken(token.name);
        
        // Recharger la page après succès
        setTimeout(() => {
          router.push('/app/aids');
        }, 2000);
      } else {
        setTestResult({
          success: false,
          message: `❌ Token invalide: ${data.error}`,
          details: data
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '❌ Erreur lors du test',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectMeta = async () => {
    try {
      await fetch('/api/aids/meta/disconnect', { method: 'POST' });
      setActiveToken(null);
      setTestResult({ success: true, message: '✅ Déconnecté' });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Gestion des Tokens de Test
              </h1>
              <p className="text-gray-300">
                Gérez vos tokens Meta pour tester avec différents comptes publicitaires
              </p>
            </div>
            <button
              onClick={() => router.push('/app/aids')}
              className="px-4 py-2 backdrop-blur-xl bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 border border-white/20"
            >
              Retour
            </button>
          </div>
        </motion.div>

        {/* Status actuel */}
        {activeToken && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-green-600/20 rounded-xl p-4 border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white">Connecté avec: <strong>{activeToken}</strong></span>
              </div>
              <button
                onClick={disconnectMeta}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-600/30"
              >
                Déconnecter
              </button>
            </div>
          </motion.div>
        )}

        {/* Ajouter un nouveau token */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Ajouter un Token</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nom du compte"
              value={newToken.name}
              onChange={(e) => setNewToken({...newToken, name: e.target.value})}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <input
              type="password"
              placeholder="Token Meta"
              value={newToken.token}
              onChange={(e) => setNewToken({...newToken, token: e.target.value})}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={newToken.description}
              onChange={(e) => setNewToken({...newToken, description: e.target.value})}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <button
            onClick={saveToken}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
          >
            Ajouter le Token
          </button>
          
          <div className="mt-4 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-300">
              💡 Pour obtenir un token de test :
            </p>
            <ol className="text-sm text-gray-300 mt-2 space-y-1">
              <li>1. Allez sur <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener" className="text-blue-400 underline">Graph API Explorer</a></li>
              <li>2. Connectez-vous avec le compte Meta souhaité</li>
              <li>3. Sélectionnez votre app ou "Graph API Explorer"</li>
              <li>4. Ajoutez les permissions : ads_read, ads_management, leads_retrieval</li>
              <li>5. Copiez le token d'accès généré</li>
            </ol>
          </div>
        </motion.div>

        {/* Liste des tokens */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Tokens Enregistrés</h2>
          </div>
          
          {tokens.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Aucun token enregistré. Ajoutez-en un pour commencer.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {tokens.map((token) => (
                <div key={token.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">{token.name}</h3>
                      {token.description && (
                        <p className="text-sm text-gray-400 mt-1">{token.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Token: {token.token.substring(0, 20)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testToken(token)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 border border-green-600/30 disabled:opacity-50"
                      >
                        {loading ? 'Test...' : 'Utiliser'}
                      </button>
                      <button
                        onClick={() => deleteToken(token.id)}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-600/30"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Résultat du test */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-xl rounded-xl p-6 border ${
              testResult.success 
                ? 'bg-green-600/20 border-green-500/30' 
                : 'bg-red-600/20 border-red-500/30'
            }`}
          >
            <p className={`text-lg font-medium ${
              testResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testResult.message}
            </p>
            
            {testResult.details && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                  Voir les détails
                </summary>
                <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}