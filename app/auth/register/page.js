'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';
import { registerWithEmail } from '@/lib/firebase-auth';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (joinMode && formData.inviteCode) {
      // TODO: Implement join organization with Firebase
      setError('Fonction en cours de développement');
      setLoading(false);
    } else {
      if (step === 1) {
        // Validate first step
        if (!formData.email || !formData.password || !formData.name) {
          setError('Tous les champs sont requis');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        setStep(2);
        setLoading(false);
      } else {
        // Register with Firebase
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name,
              organizationName: formData.organizationName
            })
          });

          const data = await response.json();

          if (data.success) {
            router.push('/app');
          } else {
            setError(data.error || 'Erreur lors de la création du compte');
            setLoading(false);
          }
        } catch (error) {
          console.error('Registration error:', error);
          setError('Erreur lors de la création du compte');
          setLoading(false);
        }
      }
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
          <p className="text-white/70 mt-2">
            {joinMode ? 'Rejoindre une organisation' : 'Créer votre compte'}
          </p>
        </div>

        <GlassCard className="p-8">
          {!joinMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <Input
                    type="text"
                    name="name"
                    label="Nom complet"
                    placeholder="Jason Sotoca"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    icon="👤"
                  />

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
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Créer votre organisation</h3>
                    <p className="text-sm text-white/70">
                      Vous serez le propriétaire de cette organisation
                    </p>
                  </div>

                  <Input
                    type="text"
                    name="organizationName"
                    label="Nom de l'organisation"
                    placeholder="Behype"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    icon="🏢"
                  />

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    ← Retour
                  </button>
                </>
              )}

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                disabled={loading}
                className="py-3"
              >
                {loading ? 'Traitement...' : step === 1 ? 'Suivant' : 'Créer mon compte'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Code d'invitation</h3>
                <p className="text-sm text-white/70">
                  Entrez le code fourni par votre organisation
                </p>
              </div>

              <Input
                type="text"
                name="inviteCode"
                label="Code d'invitation"
                placeholder="BHY123"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                icon="🎟️"
                className="text-center text-2xl font-mono tracking-wider"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                disabled={loading}
                className="py-3"
              >
                {loading ? 'Vérification...' : 'Rejoindre'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setJoinMode(!joinMode)}
              className="w-full text-center text-sm text-purple-400 hover:text-purple-300"
            >
              {joinMode 
                ? "Créer une nouvelle organisation" 
                : "J'ai un code d'invitation"}
            </button>
          </div>

          <div className="text-center text-sm text-white/70 mt-4">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
              Se connecter
            </Link>
          </div>
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