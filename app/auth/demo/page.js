'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function DemoLoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate demo credentials
    if (email !== 'demo@digiflow-agency.fr' || password !== 'Demovalou123') {
      setError(t('demo.login.invalidCredentials'));
      setLoading(false);
      return;
    }

    try {
      // Create demo session
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store demo session
        sessionStorage.setItem('demoSession', JSON.stringify({
          email: 'demo@digiflow-agency.fr',
          name: 'Demo User',
          company: 'Demo Company',
          isDemo: true,
          timestamp: new Date().toISOString()
        }));

        // Redirect to demo dashboard
        router.push('/app/demo');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector variant="minimal" />
        </div>
        
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center"
            >
              <span className="text-4xl">🚀</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('demo.login.title')}</h1>
            <p className="text-white/60 text-sm">{t('demo.login.subtitle')}</p>
          </div>

          {/* Demo credentials hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-white/10"
          >
            <p className="text-white/80 text-sm mb-2">📧 {t('demo.login.credentials')}:</p>
            <div className="space-y-1">
              <p className="text-white/60 text-xs font-mono">{t('demo.login.email')}: demo@digiflow-agency.fr</p>
              <p className="text-white/60 text-xs font-mono">{t('demo.login.password')}: Demovalou123</p>
            </div>
          </motion.div>

          {/* Login form */}
          <form onSubmit={handleDemoLogin} className="space-y-4">
            <Input
              type="email"
              placeholder={t('demo.login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon="📧"
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder={t('demo.login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon="🔐"
              autoComplete="current-password"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {t('demo.login.accessing')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 {t('demo.login.access')}
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">
              {t('demo.login.disclaimer')}
              <br />
              {t('demo.login.noOperations')}
            </p>
          </div>
        </GlassCard>

        {/* Back to main login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <a
            href="/auth/login"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            {t('demo.login.backToLogin')}
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}