'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OrganizationPage() {
  const [organization, setOrganization] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      
      setOrganization(userData.organization || {
        name: 'Mon Organisation',
        id: 'org_demo',
        role: 'owner',
        plan: 'free'
      });

      // Mock members data
      setMembers([
        { id: 1, name: userData.name || 'Vous', email: userData.email, role: 'owner', status: 'active', avatar: '👤' },
        { id: 2, name: 'Sarah Martin', email: 'sarah@example.com', role: 'admin', status: 'active', avatar: '👩' },
        { id: 3, name: 'Thomas Dubois', email: 'thomas@example.com', role: 'member', status: 'active', avatar: '👨' },
        { id: 4, name: 'Julie Petit', email: 'julie@example.com', role: 'member', status: 'pending', avatar: '👩' }
      ]);
    } catch (error) {
      console.error('Error loading organization:', error);
    }
    setLoading(false);
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    setShowInviteModal(true);
  };

  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    member: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    inactive: 'bg-gray-500/20 text-gray-400'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Organisation</h1>
        <p className="text-gray-400">Gérez votre équipe et les paramètres de l'organisation</p>
      </div>

      {/* Organization Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Informations générales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nom de l'organisation
              </label>
              <input
                type="text"
                value={organization?.name || ''}
                onChange={(e) => setOrganization({...organization, name: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ID Organisation
                </label>
                <div className="px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-gray-500 font-mono text-sm">
                  {organization?.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Plan actuel
                </label>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg text-purple-400 font-medium text-center">
                  {organization?.plan === 'premium' ? 'Premium' : 'Gratuit'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                placeholder="contact@example.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
              Enregistrer
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
              Annuler
            </button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Membres actifs</p>
              <p className="text-2xl font-bold text-white">{members.filter(m => m.status === 'active').length}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Applications actives</p>
              <p className="text-2xl font-bold text-white">2 / 8</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Utilisation API</p>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">12,847 / 50,000</span>
                  <span className="text-purple-400">26%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-400 rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 transition-all">
              🚀 Passer au plan Premium
            </button>
          </div>
        </motion.div>
      </div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-xl border border-white/10"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Membres de l'équipe</h2>
            <button
              onClick={generateInviteCode}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <span>+</span>
              Inviter un membre
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{member.avatar}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${roleColors[member.role]}`}>
                      {member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[member.status]}`}>
                      {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    Il y a 2 heures
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-purple-400 hover:text-purple-300 mr-3">
                      Modifier
                    </button>
                    {member.role !== 'owner' && (
                      <button className="text-red-400 hover:text-red-300">
                        Retirer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Code d'invitation</h3>
            <p className="text-gray-400 mb-6">
              Partagez ce code avec votre collaborateur pour qu'il rejoigne l'organisation
            </p>
            
            <div className="bg-black/50 rounded-xl p-6 mb-6 border border-white/10">
              <p className="text-center text-3xl font-mono text-purple-400 tracking-wider">
                {inviteCode}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  // Show toast notification
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                📋 Copier le code
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}