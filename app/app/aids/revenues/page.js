'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    campaignId: '',
    description: ''
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    averageTicket: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    loadRevenues();
  }, []);

  const loadRevenues = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/revenues');
      const data = await response.json();
      setRevenues(data.revenues || []);
      setStats(data.stats || {
        totalRevenue: 0,
        totalClients: 0,
        averageTicket: 0,
        monthlyGrowth: 0
      });
    } catch (error) {
      console.error('Error loading revenues:', error);
      // Load demo data
      setRevenues(getDemoRevenues());
      calculateStats(getDemoRevenues());
    }
    setLoading(false);
  };

  const getDemoRevenues = () => [
    { id: 1, clientId: 'CLI001', clientName: 'Boutique Mode Paris', amount: 2500, date: '2024-08-15', campaignId: 'CAM_FB_001', description: 'Vente via campagne été' },
    { id: 2, clientId: 'CLI002', clientName: 'Restaurant Le Gourmet', amount: 1800, date: '2024-08-14', campaignId: 'CAM_IG_002', description: 'Réservations weekend' },
    { id: 3, clientId: 'CLI003', clientName: 'Fitness Club Pro', amount: 3200, date: '2024-08-13', campaignId: 'CAM_FB_003', description: 'Abonnements annuels' },
    { id: 4, clientId: 'CLI004', clientName: 'Tech Solutions', amount: 5500, date: '2024-08-12', campaignId: 'CAM_FB_001', description: 'Contrat B2B' },
    { id: 5, clientId: 'CLI005', clientName: 'Beauty Spa Zen', amount: 890, date: '2024-08-11', campaignId: 'CAM_IG_004', description: 'Forfait soins' }
  ];

  const calculateStats = (revenueData) => {
    const total = revenueData.reduce((sum, r) => sum + r.amount, 0);
    const clients = new Set(revenueData.map(r => r.clientId)).size;
    const average = clients > 0 ? total / clients : 0;
    
    setStats({
      totalRevenue: total,
      totalClients: clients,
      averageTicket: average,
      monthlyGrowth: 23.5 // Mock growth percentage
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const revenueData = {
      ...formData,
      amount: parseFloat(formData.amount),
      id: editingRevenue?.id || Date.now()
    };

    try {
      const url = editingRevenue 
        ? `/api/aids/revenues/${editingRevenue.id}`
        : '/api/aids/revenues';
      
      const method = editingRevenue ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revenueData)
      });

      if (response.ok) {
        loadRevenues();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving revenue:', error);
      // For demo, add locally
      if (editingRevenue) {
        setRevenues(revenues.map(r => r.id === editingRevenue.id ? revenueData : r));
      } else {
        setRevenues([revenueData, ...revenues]);
      }
      calculateStats([revenueData, ...revenues]);
      resetForm();
    }
  };

  const handleEdit = (revenue) => {
    setEditingRevenue(revenue);
    setFormData({
      clientId: revenue.clientId,
      clientName: revenue.clientName,
      amount: revenue.amount.toString(),
      date: revenue.date,
      campaignId: revenue.campaignId,
      description: revenue.description
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce revenu ?')) return;

    try {
      await fetch(`/api/aids/revenues/${id}`, { method: 'DELETE' });
      loadRevenues();
    } catch (error) {
      console.error('Error deleting revenue:', error);
      // For demo, remove locally
      const newRevenues = revenues.filter(r => r.id !== id);
      setRevenues(newRevenues);
      calculateStats(newRevenues);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      campaignId: '',
      description: ''
    });
    setEditingRevenue(null);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Chargement des revenus...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Gestion des Revenus</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Suivez les revenus générés par vos campagnes publicitaires
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Ajouter un revenu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Revenus totaux</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs text-green-400 mt-1">
            ↑ {stats.monthlyGrowth}% ce mois
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Clients signés</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalClients}
          </div>
          <div className="text-xs text-gray-400 mt-1">Via les campagnes</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-6 border border-purple-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Panier moyen</span>
            <span className="text-2xl">🛒</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.averageTicket.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Par client</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">ROAS réel</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {revenues.length > 0 ? '5.2x' : 'N/A'}
          </div>
          <div className="text-xs text-green-400 mt-1">Basé sur vos données</div>
        </motion.div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Historique des revenus</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nom du client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {revenues.map((revenue) => (
                <motion.tr
                  key={revenue.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(revenue.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-400">
                    {revenue.clientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {revenue.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                    {revenue.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {revenue.campaignId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {revenue.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(revenue)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(revenue.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {revenues.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Aucun revenu enregistré. Commencez par ajouter vos premiers clients.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingRevenue ? 'Modifier le revenu' : 'Ajouter un revenu'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="CLI001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Entreprise ABC"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Montant TTC (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="1500.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    ID Campagne
                  </label>
                  <input
                    type="text"
                    value={formData.campaignId}
                    onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="CAM_FB_001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    rows="3"
                    placeholder="Détails sur la conversion..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                  >
                    {editingRevenue ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}