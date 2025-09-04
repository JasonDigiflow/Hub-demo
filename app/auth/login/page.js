'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/app/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.code === 'auth/user-not-found' ? 'Aucun compte trouvé avec cet email' :
        error.code === 'auth/wrong-password' ? 'Mot de passe incorrect' :
        error.code === 'auth/invalid-email' ? 'Email invalide' :
        'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e]" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 lg:max-w-xl"
      >
        <GlassCard className="p-6 sm:p-8 lg:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                  DigiFlow <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hub</span>
                </h1>
              </div>
            </Link>
            <p className="text-white/60 text-sm">Connectez-vous à votre espace</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span className="ml-2 text-white/60 text-sm">Se souvenir de moi</span>
              </label>
              <Link href="/auth/forgot-password" className="text-purple-400 text-sm hover:text-purple-300">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="gradient"
              className="w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/40">ou</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg px-4 py-3 flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-white/80">Continuer avec Google</span>
            </button>

            <button className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg px-4 py-3 flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-200">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-white/80">Continuer avec Facebook</span>
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-white/60 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium">
              S'inscrire gratuitement
            </Link>
          </p>
        </GlassCard>

        {/* Demo access button - Below the card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link href="/app/demo">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl py-4 px-6 flex items-center justify-center gap-3 hover:from-purple-600/30 hover:to-blue-600/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-white font-semibold">Essayer le Mode Démo</p>
                  <p className="text-white/60 text-xs">Sans création de compte</p>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}