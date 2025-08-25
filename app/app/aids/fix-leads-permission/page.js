'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FixLeadsPermission() {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/meta/check-permissions');
      const data = await response.json();
      setResult(data);
      
      if (data.hasLeadsRetrieval) {
        setStep(3); // Success
      } else {
        setStep(2); // Need to fix
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleSaveToken = async () => {
    if (!token.trim()) {
      alert('Veuillez coller votre token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/aids/meta/update-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setStep(3);
        setResult(data);
      } else {
        setResult({ error: data.error });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Configuration des Permissions Meta
        </h1>

        {/* Step 1: Check current permissions */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Étape 1: Vérifier vos permissions actuelles</h2>
            <p className="text-gray-300 mb-6">
              Vérifions d'abord si votre connexion Meta a les bonnes permissions pour récupérer les leads.
            </p>
            
            <button
              onClick={handleCheckPermissions}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Vérifier mes permissions'}
            </button>

            {result && result.error && (
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg">
                <p className="text-red-400">{result.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Fix permissions */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                ⚠️ Permission "leads_retrieval" manquante
              </h3>
              <p className="text-gray-300">
                Votre connexion actuelle n'a pas la permission de récupérer les leads. 
                Voici comment corriger cela :
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Solution: Réautoriser avec les bonnes permissions</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Option 1: Réautorisation directe (Recommandé)</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Déconnectez-vous de votre compte Meta actuel</li>
                    <li>
                      Allez sur{' '}
                      <a 
                        href="https://www.facebook.com/settings?tab=business_tools" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Facebook Business Tools Settings
                      </a>
                    </li>
                    <li>Trouvez "Octavia AIds" et cliquez sur "Voir et modifier"</li>
                    <li>Assurez-vous que "Leads Retrieval" est coché</li>
                    <li>Reconnectez-vous via la page de connexion</li>
                  </ol>
                  
                  <button
                    onClick={() => window.location.href = '/app/aids/connect'}
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Aller à la page de connexion
                  </button>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Option 2: Token temporaire (Solution immédiate)</h3>
                  <p className="text-gray-300 mb-3">
                    Générez un token avec toutes les permissions pour importer vos leads maintenant :
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
                    <li>
                      Ouvrez{' '}
                      <a 
                        href="https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Fadaccounts&version=v18.0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Graph API Explorer
                      </a>
                    </li>
                    <li>Sélectionnez l'app "Octavia AIds"</li>
                    <li>Cliquez sur "Generate Access Token"</li>
                    <li>
                      Cochez ces permissions :
                      <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                        <li>ads_management</li>
                        <li>ads_read</li>
                        <li>business_management</li>
                        <li>leads_retrieval ✅ (IMPORTANT)</li>
                        <li>pages_read_engagement</li>
                        <li>pages_manage_ads</li>
                      </ul>
                    </li>
                    <li>Générez le token et collez-le ci-dessous</li>
                  </ol>

                  <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Collez votre token ici..."
                    className="w-full h-24 p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500 focus:outline-none mb-3"
                  />
                  
                  <button
                    onClick={handleSaveToken}
                    disabled={loading || !token.trim()}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour...' : 'Utiliser ce token'}
                  </button>
                </div>
              </div>
            </div>

            {result && result.error && (
              <div className="p-4 bg-red-900/50 rounded-lg">
                <p className="text-red-400">{result.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/50 border border-green-600/50 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              ✅ Permissions configurées avec succès !
            </h2>
            
            {result && result.permissions && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Permissions actives :</h3>
                <div className="flex flex-wrap gap-2">
                  {result.permissions.map(perm => (
                    <span 
                      key={perm}
                      className="px-3 py-1 bg-green-800 text-green-300 rounded-full text-sm"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-gray-300 mb-4">
              Vous pouvez maintenant synchroniser vos prospects depuis le Lead Center.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/app/aids/prospects'}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
              >
                Aller aux prospects
              </button>
              
              <button
                onClick={() => window.location.href = '/app/aids/token'}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Importer avec token manuel
              </button>
            </div>
          </motion.div>
        )}

        {/* Information box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-600/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            ℹ️ Pourquoi cette étape est nécessaire ?
          </h3>
          <p className="text-gray-300 text-sm">
            Facebook requiert une autorisation explicite pour accéder aux données des leads. 
            Même si la permission "leads_retrieval" est en Standard Access, elle doit être 
            accordée manuellement par chaque utilisateur pour des raisons de sécurité et de 
            confidentialité. Cela garantit que chaque utilisateur contrôle l'accès à ses propres données.
          </p>
        </div>
      </div>
    </div>
  );
}