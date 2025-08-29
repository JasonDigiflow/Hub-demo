'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function ResetAllPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const handleReset = async () => {
    if (confirmText !== 'RESET ALL') {
      alert('Tapez "RESET ALL" pour confirmer');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // 1. Nettoyer localStorage et sessionStorage
      console.log('Nettoyage du localStorage...');
      const localStorageKeys = [
        'selected_ad_account',
        'meta_auth_state',
        'aids_logs',
        'defaultAccount',
        'isAuthenticated',
        'currentUser',
        'insights_cache',
        'campaigns_cache',
        'adsets_cache',
        'ads_cache'
      ];
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Supprimer tous les cookies
      console.log('Suppression des cookies...');
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // 3. Appeler l'API de reset Firebase (avec le secret)
      console.log('Reset de Firebase...');
      const firebaseResponse = await fetch('/api/admin/reset-database?secret=reset-all-data-2024', {
        method: 'POST'
      });
      const firebaseData = await firebaseResponse.json();

      // 4. Déconnexion complète
      console.log('Déconnexion...');
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      setResults({
        localStorage: 'Nettoyé',
        cookies: 'Supprimés',
        firebase: firebaseData.success ? `${firebaseData.totalDeleted} documents supprimés` : 'Erreur',
        logout: logoutResponse.ok ? 'Déconnecté' : 'Erreur'
      });

      // 5. Rediriger après 3 secondes
      setTimeout(() => {
        window.location.href = '/auth/register';
      }, 3000);

    } catch (error) {
      console.error('Erreur lors du reset:', error);
      setResults({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">Reset Complet du Système</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-gray-300">
              Cette action va :
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Effacer TOUT le localStorage et sessionStorage</li>
              <li>Supprimer TOUS les cookies</li>
              <li>Supprimer TOUTES les données Firebase (users, organizations, insights, etc.)</li>
              <li>Vous déconnecter complètement</li>
              <li>Vous rediriger vers la page d'inscription</li>
            </ul>
          </div>

          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-semibold mb-2">
              ⚠️ DANGER ZONE - Action irréversible !
            </p>
            <p className="text-gray-400 text-sm">
              Pour confirmer, tapez exactement : <span className="font-mono bg-red-900/50 px-2 py-1 rounded">RESET ALL</span>
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez RESET ALL pour confirmer"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              disabled={loading}
            />

            <button
              onClick={handleReset}
              disabled={loading || confirmText !== 'RESET ALL'}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Reset en cours...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Reset Total du Système
                </>
              )}
            </button>
          </div>

          {results && (
            <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Résultats :</h3>
              {results.error ? (
                <p className="text-red-400">Erreur : {results.error}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li className="text-green-400">✓ localStorage : {results.localStorage}</li>
                  <li className="text-green-400">✓ Cookies : {results.cookies}</li>
                  <li className="text-green-400">✓ Firebase : {results.firebase}</li>
                  <li className="text-green-400">✓ Session : {results.logout}</li>
                  <li className="text-yellow-400 mt-3">→ Redirection dans 3 secondes...</li>
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}