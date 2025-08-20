'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getCurrentUser, generateInviteCode } from '@/lib/auth';
import { organizationData } from '@/lib/mockData';

export default function OrganizationPage() {
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleGenerateCode = () => {
    const newCode = generateInviteCode();
    setInviteCode(newCode);
    setShowInviteModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          Gestion de l'<span className="gradient-text">Organisation</span>
        </h1>
        <p className="text-white/70">
          Gérez votre équipe et les paramètres de votre organisation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Informations de l'organisation</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Nom</p>
                  <p className="text-lg font-semibold">{organizationData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">ID Organisation</p>
                  <p className="text-lg font-mono">{organizationData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Propriétaire</p>
                  <p className="text-lg">{organizationData.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Plan actuel</p>
                  <p className="text-lg">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-sm">
                      {organizationData.plan}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/50 mb-1">Date de création</p>
                <p className="text-lg">{organizationData.createdAt}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Membres de l'équipe</h2>
              <Button onClick={handleGenerateCode}>
                + Inviter un membre
              </Button>
            </div>

            <div className="space-y-3">
              {organizationData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-white/50">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm
                      ${member.role === 'owner' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-white/10'
                      }
                    `}>
                      {member.role === 'owner' ? 'Propriétaire' : 'Membre'}
                    </span>
                    {member.status === 'active' && (
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Button fullWidth variant="outline">
                📊 Rapport d'activité
              </Button>
              <Button fullWidth variant="outline">
                ⚙️ Paramètres avancés
              </Button>
              <Button fullWidth variant="outline">
                📈 Mettre à niveau le plan
              </Button>
              <Button fullWidth variant="outline">
                📋 Audit de sécurité
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Code d'invitation actif</h3>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-2xl font-mono text-center mb-2">
                {organizationData.inviteCode}
              </p>
              <p className="text-xs text-white/50 text-center">
                Valide pendant 7 jours
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold mb-4">Code d'invitation généré</h2>
              
              <div className="p-6 bg-white/5 rounded-xl mb-4">
                <p className="text-3xl font-mono text-center mb-2">
                  {inviteCode}
                </p>
                <p className="text-sm text-white/50 text-center">
                  Ce code est valide pendant 7 jours
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  📋 Copier le code
                </Button>
                <Button
                  fullWidth
                  onClick={() => setShowInviteModal(false)}
                >
                  Fermer
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}