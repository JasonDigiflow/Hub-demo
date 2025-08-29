'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterWithSiret() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Organization info
    siret: '',
    organizationData: null,
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validatingSiret, setValidatingSiret] = useState(false);

  // Valider le SIRET
  const validateSiret = async (siret) => {
    setValidatingSiret(true);
    setErrors({ ...errors, siret: null });
    
    try {
      const response = await fetch(`/api/siret/validate?siret=${siret}`);
      const data = await response.json();
      
      if (data.valid) {
        setFormData({
          ...formData,
          siret,
          organizationData: data.organization
        });
        setErrors({ ...errors, siret: null });
      } else {
        setErrors({ ...errors, siret: data.error });
        setFormData({
          ...formData,
          organizationData: null
        });
      }
    } catch (error) {
      setErrors({ ...errors, siret: 'Erreur lors de la validation' });
    } finally {
      setValidatingSiret(false);
    }
  };

  // Gérer le changement de SIRET
  const handleSiretChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setFormData({ ...formData, siret: value });
    
    // Valider automatiquement quand on a 14 chiffres
    if (value.length === 14) {
      validateSiret(value);
    }
  };

  // Passer à l'étape suivante
  const handleNextStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      // Valider les infos personnelles
      if (!formData.name) newErrors.name = 'Nom requis';
      if (!formData.email) newErrors.email = 'Email requis';
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      
      if (Object.keys(newErrors).length === 0) {
        setStep(2);
      }
    }
    
    setErrors(newErrors);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    // Valider l'étape 2
    const newErrors = {};
    if (!formData.siret) newErrors.siret = 'SIRET requis';
    if (!formData.organizationData) newErrors.siret = 'SIRET non validé';
    if (!formData.acceptTerms) newErrors.terms = 'Vous devez accepter les conditions';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Créer le compte avec l'organisation
      const response = await fetch('/api/auth/register-with-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organization: formData.organizationData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Rediriger vers le dashboard
        router.push('/app/aids');
      } else {
        setErrors({ submit: data.error || 'Erreur lors de l\'inscription' });
      }
    } catch (error) {
      setErrors({ submit: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= 1 ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= 2 ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? 'Créer votre compte' : 'Votre organisation'}
          </h2>
          <p className="text-gray-400 mb-6">
            {step === 1 
              ? 'Commencez avec vos informations personnelles'
              : 'Identifiez votre entreprise avec votre SIRET'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Step 1: Personal Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Jean Dupont"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="jean@entreprise.fr"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Organization Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro SIRET
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={handleSiretChange}
                      maxLength={14}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 pr-10"
                      placeholder="12345678901234"
                    />
                    {validatingSiret && (
                      <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-purple-400 animate-spin" />
                    )}
                    {formData.organizationData && !validatingSiret && (
                      <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-400" />
                    )}
                  </div>
                  {errors.siret && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.siret}
                    </p>
                  )}
                </div>

                {/* Organization Details */}
                {formData.organizationData && (
                  <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-semibold">Entreprise vérifiée</span>
                    </div>
                    <p className="text-white font-medium">{formData.organizationData.nom}</p>
                    {formData.organizationData.nomCommercial && (
                      <p className="text-gray-400 text-sm">
                        Enseigne : {formData.organizationData.nomCommercial}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm">{formData.organizationData.adresse}</p>
                    <p className="text-gray-400 text-sm">
                      Code NAF : {formData.organizationData.codeNaf}
                      {formData.organizationData.libelleNaf && ` - ${formData.organizationData.libelleNaf}`}
                    </p>
                    {formData.organizationData.effectif && (
                      <p className="text-gray-400 text-sm">
                        Effectif : {formData.organizationData.effectif}
                      </p>
                    )}
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                      politique de confidentialité
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-400 text-sm">{errors.terms}</p>
                )}
              </>
            )}

            {/* Error message */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all"
                >
                  Retour
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || (step === 2 && !formData.organizationData)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </span>
                ) : (
                  step === 1 ? 'Continuer' : 'Créer mon compte'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}