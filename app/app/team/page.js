'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      
      // Mock team data
      setMembers([
        { 
          id: 1, 
          name: userData.name || 'Vous', 
          email: userData.email, 
          role: 'owner', 
          status: 'active', 
          avatar: '👤',
          department: 'Direction',
          joinedAt: '2024-01-15'
        },
        { 
          id: 2, 
          name: 'Sarah Martin', 
          email: 'sarah@example.com', 
          role: 'admin', 
          status: 'active', 
          avatar: '👩',
          department: 'Marketing',
          joinedAt: '2024-02-20'
        },
        { 
          id: 3, 
          name: 'Thomas Dubois', 
          email: 'thomas@example.com', 
          role: 'member', 
          status: 'active', 
          avatar: '👨',
          department: 'Commercial',
          joinedAt: '2024-03-10'
        },
        { 
          id: 4, 
          name: 'Julie Petit', 
          email: 'julie@example.com', 
          role: 'member', 
          status: 'pending', 
          avatar: '👩',
          department: 'Support',
          joinedAt: '2024-08-01'
        },
        { 
          id: 5, 
          name: 'Marc Leroy', 
          email: 'marc@example.com', 
          role: 'member', 
          status: 'active', 
          avatar: '👨',
          department: 'Technique',
          joinedAt: '2024-06-15'
        }
      ]);
    } catch (error) {
      console.error('Error loading team:', error);
      // Use demo data
      setMembers([
        { id: 1, name: 'Admin', email: 'admin@digiflow.fr', role: 'owner', status: 'active', avatar: '👤', department: 'Direction', joinedAt: '2024-01-15' }
      ]);
    }
    setLoading(false);
  };

  const handleInvite = () => {
    if (inviteEmail) {
      // Simulate adding a new member
      const newMember = {
        id: members.length + 1,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        avatar: '👤',
        department: 'Non assigné',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      setMembers([...members, newMember]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    member: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-500'
  };

  const departmentIcons = {
    'Direction': '👔',
    'Marketing': '📢',
    'Commercial': '💼',
    'Support': '🎧',
    'Technique': '⚙️',
    'Non assigné': '❓'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Équipe</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez les membres de votre équipe et leurs permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Inviter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total membres</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">{members.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Actifs</span>
            <span className="text-xl">✅</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {members.filter(m => m.status === 'active').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">En attente</span>
            <span className="text-xl">⏳</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {members.filter(m => m.status === 'pending').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Départements</span>
            <span className="text-xl">🏢</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {new Set(members.map(m => m.department)).size}
          </div>
        </motion.div>
      </div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Membres de l'équipe</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Membre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Département</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date d'arrivée</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-xl">{member.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{departmentIcons[member.department]}</span>
                      <span className="text-sm text-gray-300">{member.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={member.role === 'owner'}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[member.role]} bg-transparent cursor-pointer disabled:cursor-not-allowed`}
                    >
                      <option value="owner" disabled>Propriétaire</option>
                      <option value="admin">Admin</option>
                      <option value="member">Membre</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[member.status]}`} />
                      <span className="text-sm text-gray-300 capitalize">{member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{member.joinedAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-sm"
                      >
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
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Inviter un membre</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="membre@example.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Rôle
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Membre</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}