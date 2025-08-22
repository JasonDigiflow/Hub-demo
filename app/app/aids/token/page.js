'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TokenPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      alert('Veuillez coller votre token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/aids/meta/manual-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setTimeout(() => {
          router.push('/app/aids/prospects');
        }, 3000);
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
          Import avec Token Graph API Explorer
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">📋 Instructions :</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>
              Allez sur{' '}
              <a 
                href="https://developers.facebook.com/tools/explorer/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Graph API Explorer
              </a>
            </li>
            <li>Sélectionnez votre app "Octavia AIds"</li>
            <li>
              Cliquez sur "Generate Access Token" et cochez ces permissions :
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>leads_retrieval ✅</li>
                <li>ads_management ✅</li>
                <li>ads_read ✅</li>
                <li>business_management ✅</li>
                <li>pages_read_engagement ✅</li>
              </ul>
            </li>
            <li>Générez le token</li>
            <li>Copiez le token et collez-le ci-dessous</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
          <label className="block mb-2 text-sm font-medium">
            Access Token Graph API Explorer :
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Collez votre token ici..."
            className="w-full h-32 p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Récupération des leads...' : '🚀 Récupérer mes 107 prospects'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="text-xl font-bold mb-2">
              {result.success ? '✅ Succès!' : '❌ Erreur'}
            </h3>
            <p>{result.message || result.error}</p>
            
            {result.success && result.accounts && (
              <div className="mt-4">
                <h4 className="font-bold">Comptes trouvés :</h4>
                {result.accounts.map((acc, i) => (
                  <div key={i} className="mt-2 p-2 bg-black/30 rounded">
                    <p>{acc.accountName}</p>
                    <p className="text-sm text-gray-400">
                      {acc.formsCount} formulaires, {acc.totalLeads} leads
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {result.success && (
              <p className="mt-4 text-yellow-400">
                ↻ Redirection vers les prospects dans 3 secondes...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}