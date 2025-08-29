'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MetaCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const metaConnected = searchParams.get('meta_connected');
      const error = searchParams.get('error');

      if (error) {
        console.error('Meta connection error:', error);
        router.push(`/app/aids/account?error=${encodeURIComponent(error)}`);
        return;
      }

      if (metaConnected === 'true') {
        // Récupérer les cookies et les stocker dans localStorage pour le client
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };

        const userId = getCookie('meta_user_id');
        const selectedAccount = getCookie('selected_ad_account');

        if (userId) {
          localStorage.setItem('meta_user_id', userId);
        }
        if (selectedAccount) {
          localStorage.setItem('selected_ad_account', selectedAccount);
        }

        // Marquer Meta comme connecté
        localStorage.setItem('meta_connected', 'true');

        // Rediriger vers le dashboard
        router.push('/app/aids');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Connexion à Meta en cours...</h2>
        <p className="text-gray-400">Veuillez patienter</p>
      </div>
    </div>
  );
}

export default function MetaCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Chargement...</h2>
        </div>
      </div>
    }>
      <MetaCallbackContent />
    </Suspense>
  );
}