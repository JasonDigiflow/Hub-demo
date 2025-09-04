'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/lib/contexts/OnboardingContext';
import { validateSiretFormat, formatSiret, siretInputMask } from '@/lib/utils/siret';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

export default function Step2Company({ onNext, onBack }) {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const [companyChoice, setCompanyChoice] = useState(onboardingData.companyChoice || '');
  const [siret, setSiret] = useState(onboardingData.siret || '');
  const [inviteCode, setInviteCode] = useState(onboardingData.inviteCode || '');
  const [companyData, setCompanyData] = useState(onboardingData.companyData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orgExists, setOrgExists] = useState(false);

  // État pour entreprise sans SIRET
  const [noSiretForm, setNoSiretForm] = useState({
    name: '',
    country: '',
    type: '', // 'foreign', 'association', 'sandbox'
    taxId: ''
  });

  const handleSiretChange = (e) => {
    const masked = siretInputMask(e.target.value);
    setSiret(masked);
  };

  const verifySiret = async () => {
    const cleanedSiret = siret.replace(/\s/g, '');
    
    if (!validateSiretFormat(cleanedSiret)) {
      setError('Le SIRET doit contenir 14 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vérifier le SIRET via l'API
      const response = await fetch('/api/company/verify-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: cleanedSiret })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Entreprise non trouvée');
        return;
      }

      // Vérifier si l'organisation existe déjà
      const checkResponse = await fetch('/api/company/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: cleanedSiret })
      });

      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        setOrgExists(true);
        setError(`🎯 Cette entreprise existe déjà (${checkResult.organization.name}). Rejoignez-la avec votre code d'invitation.`);
        return;
      }

      // Sauvegarder les données de l'entreprise
      setCompanyData(result.data);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Erreur vérification SIRET:', error);
      setError('Impossible de vérifier le SIRET pour le moment. Réessayez dans quelques minutes.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCompanyCreation = async () => {
    updateOnboardingData({
      companyChoice: 'create',
      siret: siret.replace(/\s/g, ''),
      companyData
    });
    onNext();
  };

  const verifyInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError('Veuillez entrer un code d\'invitation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implémenter la vérification du code d'invitation
      // const response = await fetch('/api/company/verify-invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code: inviteCode })
      // });

      // Simuler pour le moment
      updateOnboardingData({
        companyChoice: 'join',
        inviteCode
      });
      onNext();
    } catch (error) {
      setError('Code d\'invitation invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleNoSiretSubmit = () => {
    if (!noSiretForm.name || !noSiretForm.country || !noSiretForm.type) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateOnboardingData({
      companyChoice: 'no-siret',
      companyData: noSiretForm
    });
    onNext();
  };

  const renderChoice = () => {
    if (!companyChoice) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            Comment souhaitez-vous configurer votre entreprise ?
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCompanyChoice('create')}
            className="w-full p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🏢</span>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Créer mon entreprise (avec SIRET)
                </h4>
                <p className="text-white/60 text-sm">
                  Pour les entreprises françaises avec un numéro SIRET
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCompanyChoice('join')}
            className="w-full p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🤝</span>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Rejoindre une entreprise (code d'invitation)
                </h4>
                <p className="text-white/60 text-sm">
                  Si votre entreprise est déjà inscrite sur DigiFlow Hub
                </p>
              </div>
            </div>
          </motion.button>

          <button
            onClick={() => setCompanyChoice('no-siret')}
            className="text-purple-400 hover:text-purple-300 text-sm underline"
          >
            Je n'ai pas de SIRET / Société étrangère
          </button>
        </div>
      );
    }

    if (companyChoice === 'create' && !showConfirmation) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Créer mon entreprise
            </h3>
            <button
              onClick={() => {
                setCompanyChoice('');
                setSiret('');
                setError('');
                setOrgExists(false);
              }}
              className="text-white/60 hover:text-white text-sm"
            >
              ← Retour
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 ${orgExists ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50'} border rounded-lg`}
            >
              <p className={orgExists ? 'text-yellow-400' : 'text-red-400'} dangerouslySetInnerHTML={{ __html: error }} />
              {orgExists && (
                <button
                  onClick={() => setCompanyChoice('join')}
                  className="mt-2 text-purple-400 hover:text-purple-300 underline text-sm"
                >
                  Rejoindre avec un code →
                </button>
              )}
            </motion.div>
          )}

          <div>
            <Input
              label="Numéro de SIRET (14 chiffres)"
              value={siret}
              onChange={handleSiretChange}
              placeholder="123 456 789 00012"
              maxLength={18} // Avec espaces
            />
            <p className="text-white/40 text-xs mt-1">
              Format : SIREN (9 chiffres) + NIC (5 chiffres)
            </p>
          </div>

          <Button
            onClick={verifySiret}
            disabled={loading || !siret}
            variant="gradient"
            className="w-full"
          >
            {loading ? 'Vérification...' : 'Vérifier le SIRET'}
          </Button>

          <button
            onClick={() => setCompanyChoice('no-siret')}
            className="text-purple-400 hover:text-purple-300 text-sm underline w-full text-center"
          >
            Je n'ai pas de SIRET / Société étrangère
          </button>
        </div>
      );
    }

    if (companyChoice === 'create' && showConfirmation) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Confirmer les informations
            </h3>
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-white/60 hover:text-white text-sm"
            >
              ← Modifier
            </button>
          </div>

          <GlassCard className="p-4 space-y-3">
            <div>
              <p className="text-white/60 text-sm">Raison sociale</p>
              <p className="text-white font-semibold">{companyData.name}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">SIRET</p>
              <p className="text-white font-mono">{formatSiret(companyData.siret)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Adresse</p>
              <p className="text-white">{companyData.address}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Code NAF</p>
              <p className="text-white">{companyData.naf}</p>
            </div>
            {companyData.establishments?.length > 1 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Établissements</p>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  {companyData.establishments.map((etab, idx) => (
                    <option key={idx} value={etab.siret}>
                      {etab.type} - {etab.address}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </GlassCard>

          <Button
            onClick={confirmCompanyCreation}
            variant="gradient"
            className="w-full"
          >
            Confirmer et créer l'entreprise
          </Button>
        </div>
      );
    }

    if (companyChoice === 'join') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Rejoindre une entreprise
            </h3>
            <button
              onClick={() => {
                setCompanyChoice('');
                setInviteCode('');
                setError('');
              }}
              className="text-white/60 hover:text-white text-sm"
            >
              ← Retour
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <Input
            label="Code d'invitation"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="DG-7KQ4X"
            className="font-mono"
          />

          <Button
            onClick={verifyInviteCode}
            disabled={loading || !inviteCode}
            variant="gradient"
            className="w-full"
          >
            {loading ? 'Vérification...' : 'Rejoindre l\'entreprise'}
          </Button>

          <p className="text-white/40 text-sm text-center">
            Demandez le code d'invitation à votre administrateur
          </p>
        </div>
      );
    }

    if (companyChoice === 'no-siret') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Entreprise sans SIRET
            </h3>
            <button
              onClick={() => {
                setCompanyChoice('');
                setNoSiretForm({ name: '', country: '', type: '', taxId: '' });
                setError('');
              }}
              className="text-white/60 hover:text-white text-sm"
            >
              ← Retour
            </button>
          </div>

          <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Sans SIRET, certaines intégrations françaises (ex. Pappers) seront indisponibles.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <Input
            label="Nom légal de l'entreprise"
            value={noSiretForm.name}
            onChange={(e) => setNoSiretForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ma Société Ltd"
            required
          />

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Pays
            </label>
            <select
              value={noSiretForm.country}
              onChange={(e) => setNoSiretForm(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              required
            >
              <option value="">Sélectionner un pays</option>
              <option value="US">États-Unis</option>
              <option value="GB">Royaume-Uni</option>
              <option value="DE">Allemagne</option>
              <option value="ES">Espagne</option>
              <option value="IT">Italie</option>
              <option value="CH">Suisse</option>
              <option value="BE">Belgique</option>
              <option value="CA">Canada</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Type d'organisation
            </label>
            <select
              value={noSiretForm.type}
              onChange={(e) => setNoSiretForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="foreign">Société étrangère</option>
              <option value="association">Association</option>
              <option value="sandbox">Sandbox test</option>
            </select>
          </div>

          <Input
            label="Numéro fiscal (optionnel)"
            value={noSiretForm.taxId}
            onChange={(e) => setNoSiretForm(prev => ({ ...prev, taxId: e.target.value }))}
            placeholder="VAT123456789"
          />

          <Button
            onClick={handleNoSiretSubmit}
            variant="gradient"
            className="w-full"
          >
            Continuer
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Votre entreprise
        </h2>
        <p className="text-white/60">
          Configurez votre espace professionnel
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={companyChoice + showConfirmation}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderChoice()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
        >
          ← Retour
        </Button>
        
        {companyChoice && !showConfirmation && (
          <Button
            onClick={() => setCompanyChoice('')}
            variant="ghost"
          >
            Changer d'option
          </Button>
        )}
      </div>
    </div>
  );
}