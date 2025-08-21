'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';
import { login, initializeAuth } from '@/lib/auth';
import { DEFAULT_ACCOUNT } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: DEFAULT_ACCOUNT.email,
    password: DEFAULT_ACCOUNT.password
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/app');

  useEffect(() => {
    initializeAuth();
    // Get redirect URL from query params
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Appel à l'API de connexion
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Connexion réussie - redirection vers l'URL demandée ou /app
        router.push(redirectUrl);
      } else {
        setError(data.error || 'Email ou mot de passe incorrect');
        setLoading(false);
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">DigiFlow Hub</h1>
          <p className="text-white/70 mt-2">Connectez-vous à votre espace</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="jason@behype-app.com"
              value={formData.email}
              onChange={handleChange}
              required
              icon="📧"
            />

            <Input
              type="password"
              name="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              icon="🔒"
            />

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-white/70 mb-2">Compte de démonstration :</p>
              <p className="text-xs text-white/50">Email: jason@behype-app.com</p>
              <p className="text-xs text-white/50">Mot de passe: Demo123</p>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
              className="py-3"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-white/70">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-purple-400 hover:text-purple-300">
                Créer un compte
              </Link>
            </div>
          </form>
        </GlassCard>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/50 hover:text-white/70 text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}