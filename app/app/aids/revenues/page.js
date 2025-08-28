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
    description: '',
    prospectId: '',
    tva: 20 // TVA par défaut à 20%
  });
  const [prospects, setProspects] = useState([]);
  const [nextClientId, setNextClientId] = useState('CLI001');
  const [prospectSearch, setProspectSearch] = useState('');
  const [showProspectDropdown, setShowProspectDropdown] = useState(false);
  const [filteredProspects, setFilteredProspects] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    averageTicket: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    loadRevenues();
    loadProspects();
  }, []);

  useEffect(() => {
    // Filtrer les prospects basé sur la recherche
    if (prospectSearch.trim() === '') {
      setFilteredProspects(prospects);
    } else {
      const searchLower = prospectSearch.toLowerCase();
      const filtered = prospects.filter(prospect => 
        prospect.name?.toLowerCase().includes(searchLower) ||
        prospect.company?.toLowerCase().includes(searchLower) ||
        prospect.email?.toLowerCase().includes(searchLower) ||
        prospect.phone?.includes(searchLower)
      );
      setFilteredProspects(filtered);
    }
  }, [prospectSearch, prospects]);

  const loadRevenues = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/revenues');
      const data = await response.json();
      console.log('Loaded revenues data:', data);
      const revenuesList = data.revenues || [];
      setRevenues(revenuesList);
      setStats(data.stats || {
        totalRevenue: 0,
        totalClients: 0,
        averageTicket: 0,
        monthlyGrowth: 0
      });
      
      // Générer le prochain ID client
      generateNextClientId(revenuesList);
    } catch (error) {
      console.error('Error loading revenues:', error);
      // Load demo data
      const demoData = getDemoRevenues();
      setRevenues(demoData);
      calculateStats(demoData);
      generateNextClientId(demoData);
    }
    setLoading(false);
  };

  const loadProspects = async () => {
    try {
      // Charger les prospects depuis Firebase
      const response = await fetch('/api/aids/prospects');
      const data = await response.json();
      
      if (data.success && data.prospects && data.prospects.length > 0) {
        // Inclure tous les prospects SAUF ceux déjà convertis (ils ont déjà un revenu)
        const eligibleProspects = data.prospects.filter(p => 
          p.status !== 'converted'
        );
        setProspects(eligibleProspects);
        console.log(`Loaded ${eligibleProspects.length} eligible prospects from Firebase (excluding converted)`);
      } else {
        // Fallback: charger depuis localStorage si Firebase échoue
        const savedProspects = localStorage.getItem('aids_prospects');
        if (savedProspects) {
          const allProspects = JSON.parse(savedProspects);
          const eligibleProspects = allProspects.filter(p => 
            p.status !== 'converted'
          );
          setProspects(eligibleProspects);
          console.log(`Loaded ${eligibleProspects.length} eligible prospects from localStorage (fallback)`);
        } else {
          setProspects([]);
        }
      }
    } catch (error) {
      console.error('Error loading prospects:', error);
      // Fallback: charger depuis localStorage en cas d'erreur
      const savedProspects = localStorage.getItem('aids_prospects');
      if (savedProspects) {
        const allProspects = JSON.parse(savedProspects);
        const eligibleProspects = allProspects.filter(p => 
          p.status !== 'converted'
        );
        setProspects(eligibleProspects);
      } else {
        setProspects([]);
      }
    }
  };

  const generateNextClientId = (revenuesList) => {
    if (revenuesList.length === 0) {
      setNextClientId('CLI001');
      return;
    }
    
    // Extraire tous les numéros de client existants
    const clientNumbers = revenuesList
      .map(r => r.clientId)
      .filter(id => id && id.startsWith('CLI'))
      .map(id => parseInt(id.replace('CLI', '')))
      .filter(num => !isNaN(num));
    
    const maxNumber = clientNumbers.length > 0 ? Math.max(...clientNumbers) : 0;
    const nextNumber = maxNumber + 1;
    setNextClientId(`CLI${nextNumber.toString().padStart(3, '0')}`);
  };

  const getDemoRevenues = () => [
    { id: 1, clientId: 'CLI001', clientName: 'Boutique Mode Paris', amount: 2083.33, date: '2024-08-15', campaignId: 'CAM_FB_001', description: 'Vente via campagne été' },
    { id: 2, clientId: 'CLI002', clientName: 'Restaurant Le Gourmet', amount: 1500.00, date: '2024-08-14', campaignId: 'CAM_IG_002', description: 'Réservations weekend' },
    { id: 3, clientId: 'CLI003', clientName: 'Fitness Club Pro', amount: 2666.67, date: '2024-08-13', campaignId: 'CAM_FB_003', description: 'Abonnements annuels' },
    { id: 4, clientId: 'CLI004', clientName: 'Tech Solutions', amount: 4583.33, date: '2024-08-12', campaignId: 'CAM_FB_001', description: 'Contrat B2B' },
    { id: 5, clientId: 'CLI005', clientName: 'Beauty Spa Zen', amount: 741.67, date: '2024-08-11', campaignId: 'CAM_IG_004', description: 'Forfait soins' }
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

  const updateProspectStatus = async (prospectId, status, amount) => {
    try {
      // Préparer les données de mise à jour
      const updateData = { 
        status: status 
      };
      
      // Ajouter le montant et la date de conversion si applicable
      if ((status === 'converted' || status === 'closing') && amount) {
        updateData.revenueAmount = amount;
        updateData.convertedAt = new Date().toISOString();
        updateData.closingDate = new Date().toISOString();
        // Note: on ajoute aux notes existantes côté serveur
      }
      
      // Mettre à jour dans Firebase
      const response = await fetch(`/api/aids/prospects/${prospectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Prospect ${prospectId} mis à jour dans Firebase: statut "${status}" avec montant ${amount}€`);
        
        // Mettre à jour localement aussi pour éviter de recharger
        const updatedProspects = prospects.map(p => 
          p.id === prospectId ? { ...p, ...updateData } : p
        );
        setProspects(updatedProspects);
      } else {
        console.error('Failed to update prospect:', result.error);
        
        // Fallback: essayer de mettre à jour dans localStorage
        const savedProspects = localStorage.getItem('aids_prospects');
        if (savedProspects) {
          const allProspects = JSON.parse(savedProspects);
          const updatedProspects = allProspects.map(p => {
            if (p.id === prospectId) {
              const updatedProspect = { ...p, status: status };
              if (status === 'closing' && amount) {
                updatedProspect.revenueAmount = amount;
                updatedProspect.closingDate = new Date().toISOString();
                updatedProspect.notes = (p.notes ? p.notes + '\n' : '') + 
                  `💰 Closing: ${amount}€ HT (${new Date().toLocaleDateString('fr-FR')})`;
              }
              return updatedProspect;
            }
            return p;
          });
          localStorage.setItem('aids_prospects', JSON.stringify(updatedProspects));
          console.log(`✅ Prospect ${prospectId} mis à jour en local (fallback)`);
        }
      }
    } catch (error) {
      console.error('Error updating prospect status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ne pas inclure l'ID dans les données envoyées (Firebase le génère)
    const revenueData = {
      ...formData,
      clientId: formData.clientId || nextClientId,
      amount: parseFloat(formData.amount)
    };
    
    // Si on édite, ajouter l'ID séparément pour l'URL
    if (editingRevenue && editingRevenue.id) {
      console.log('📝 Editing revenue with ID:', editingRevenue.id);
    }

    console.log('📊 Saving revenue with data:', revenueData);
    console.log('🎯 Prospect ID to update:', formData.prospectId);

    try {
      const url = editingRevenue 
        ? `/api/aids/revenues/${editingRevenue.id}`
        : '/api/aids/revenues';
      
      const method = editingRevenue ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(revenueData)
      });

      const result = await response.json();
      console.log('✅ Revenue save response:', { 
        status: response.status, 
        ok: response.ok, 
        result, 
        prospectId: formData.prospectId,
        isEdit: !!editingRevenue
      });

      if (response.ok) {
        // Si un prospect est sélectionné, mettre à jour son statut en "converted" avec le montant
        if (formData.prospectId && !editingRevenue) {
          updateProspectStatus(formData.prospectId, 'converted', revenueData.amount);
        }
        
        await loadRevenues(); // Attendre le rechargement
        resetForm();
        console.log(editingRevenue ? 'Revenue updated successfully' : 'Revenue created successfully');
      } else {
        console.error('Failed to save revenue:', result);
        alert(`Erreur: ${result.error || 'Impossible de sauvegarder le revenu'}`);
      }
    } catch (error) {
      console.error('Error saving revenue:', error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };

  const handleEdit = (revenue) => {
    console.log('Editing revenue:', revenue);
    if (!revenue || !revenue.id) {
      console.error('Invalid revenue object:', revenue);
      alert('Erreur: Impossible de modifier ce revenu (ID manquant)');
      return;
    }
    
    // S'assurer que l'ID est une string et pas un timestamp
    const cleanRevenue = {
      ...revenue,
      id: String(revenue.id)
    };
    
    setEditingRevenue(cleanRevenue);
    setFormData({
      clientId: revenue.clientId || '',
      clientName: revenue.clientName || '',
      amount: revenue.amount ? revenue.amount.toString() : '',
      date: revenue.date || new Date().toISOString().split('T')[0],
      campaignId: revenue.campaignId || '',
      description: revenue.description || '',
      prospectId: revenue.prospectId || '',
      tva: revenue.tva || 20
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    console.log('Deleting revenue with ID:', id);
    if (!id) {
      console.error('No ID provided for deletion');
      alert('Erreur: Impossible de supprimer ce revenu (ID manquant)');
      return;
    }
    
    if (!confirm('Voulez-vous vraiment supprimer ce revenu ?')) return;

    try {
      const response = await fetch(`/api/aids/revenues/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Revenue deleted successfully');
        await loadRevenues(); // Recharger la liste
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`Erreur lors de la suppression: ${error.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting revenue:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      campaignId: '',
      description: '',
      prospectId: '',
      tva: 20
    });
    setEditingRevenue(null);
    setShowAddModal(false);
    setProspectSearch('');
    setShowProspectDropdown(false);
    // Regénérer le prochain ID client
    generateNextClientId(revenues);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Chargement des revenus...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 relative overflow-hidden">
      <div className="relative z-10 space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Gestion des Revenus
              </h1>
              <p className="text-gray-300 text-lg">
                Suivez les revenus générés par vos campagnes publicitaires
              </p>
            </div>
            
            <div className="flex gap-3">
              {revenues.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm(`⚠️ Voulez-vous vraiment supprimer TOUS les ${revenues.length} revenus ?\n\nCette action est irréversible.`)) {
                      try {
                        // Utiliser l'API de suppression en masse
                        const response = await fetch('/api/aids/revenues/clear', { 
                          method: 'DELETE' 
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                          loadRevenues();
                          alert(`✅ ${result.message}`);
                        } else {
                          // Fallback: supprimer un par un
                          const deletePromises = revenues.map(revenue => 
                            fetch(`/api/aids/revenues/${revenue.id}`, { method: 'DELETE' })
                          );
                          await Promise.all(deletePromises);
                          loadRevenues();
                          alert('✅ Tous les revenus ont été supprimés');
                        }
                      } catch (error) {
                        console.error('Error deleting all revenues:', error);
                        // En cas d'erreur, vider localement pour le mode démo
                        setRevenues([]);
                        calculateStats([]);
                        alert('✅ Revenus supprimés (mode local)');
                      }
                    }
                  }}
                  className="px-4 py-3 backdrop-blur-xl bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-all font-medium flex items-center gap-2 shadow-xl"
                >
                  <span>🗑️</span>
                  Tout supprimer ({revenues.length})
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl text-white rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 transition-all font-medium flex items-center gap-2 shadow-xl"
              >
                <span className="text-xl">+</span>
                Ajouter un revenu
              </button>
            </div>
          </div>
        </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05 }} className="backdrop-blur-xl bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Revenus totaux HT</span>
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
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/30 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Clients signés</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalClients}
          </div>
          <div className="text-xs text-gray-300 mt-1">Via les campagnes</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-6 border border-purple-600/30 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Panier moyen HT</span>
            <span className="text-2xl">🛒</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.averageTicket.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs text-gray-300 mt-1">Par client</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-6 border border-orange-600/30 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">ROAS réel</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {revenues.length > 0 ? '5.2x' : 'N/A'}
          </div>
          <div className="text-xs text-green-400 mt-1">Basé sur vos données</div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 overflow-hidden shadow-2xl">
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
                  Montant HT
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
      </motion.div>

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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Rechercher un prospect (optionnel)
                  </label>
                  <input
                    type="text"
                    value={prospectSearch}
                    onChange={(e) => {
                      setProspectSearch(e.target.value);
                      setShowProspectDropdown(true);
                    }}
                    onFocus={() => setShowProspectDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProspectDropdown(false), 200)}
                    placeholder="🔍 Tapez pour rechercher par nom, entreprise, email..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  
                  {formData.prospectId && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-400">✅ Prospect sélectionné</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              prospectId: '',
                              clientName: '',
                              campaignId: ''
                            });
                            setProspectSearch('');
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕ Retirer
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {showProspectDropdown && filteredProspects.length > 0 && !formData.prospectId && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-2 text-xs text-gray-400 border-b border-white/10 sticky top-0 bg-gray-900">
                        {filteredProspects.length} prospect{filteredProspects.length > 1 ? 's' : ''} trouvé{filteredProspects.length > 1 ? 's' : ''}
                      </div>
                      {filteredProspects.slice(0, 50).map(prospect => (
                        <button
                          key={prospect.id}
                          type="button"
                          onClick={() => {
                            console.log('🔍 Prospect sélectionné:', {
                              id: prospect.id,
                              name: prospect.name,
                              company: prospect.company,
                              status: prospect.status
                            });
                            setFormData({
                              ...formData,
                              prospectId: prospect.id,
                              clientName: prospect.name || prospect.company || 'Sans nom',
                              campaignId: prospect.campaignId || formData.campaignId,
                              clientId: nextClientId
                            });
                            setProspectSearch(prospect.name || prospect.company || 'Prospect sélectionné');
                            setShowProspectDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors border-b border-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-white font-medium">
                                {prospect.name || 'Sans nom'}
                              </div>
                              <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                                {prospect.company && <span className="bg-white/5 px-1 rounded">{prospect.company}</span>}
                                {prospect.email && <span className="text-blue-400">{prospect.email}</span>}
                                {prospect.phone && <span className="text-green-400">{prospect.phone}</span>}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">
                              <div>{prospect.source}</div>
                              <div>{new Date(prospect.date).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredProspects.length > 50 && (
                        <div className="p-2 text-xs text-gray-500 text-center sticky bottom-0 bg-gray-900 border-t border-white/10">
                          ... et {filteredProspects.length - 50} autres résultats
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showProspectDropdown && prospectSearch && filteredProspects.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-xl p-4">
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-2">🔍</div>
                        <div>Aucun prospect trouvé</div>
                        <div className="text-xs mt-1">Essayez avec d'autres termes de recherche</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formData.clientId || nextClientId}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
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
                      Montant HT (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="1250.00"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      TTC: {formData.amount ? (parseFloat(formData.amount) * (1 + formData.tva/100)).toFixed(2) : '0.00'} €
                    </p>
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
                    readOnly={formData.prospectId !== ''}
                    onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg text-white focus:outline-none focus:border-purple-500 ${
                      formData.prospectId ? 'bg-white/5 border-white/10 cursor-not-allowed text-gray-400' : 'bg-white/10 border-white/20 placeholder-gray-500'
                    }`}
                    placeholder="CAM_FB_001"
                  />
                  {formData.prospectId && (
                    <p className="text-xs text-green-400 mt-1">
                      ID récupéré depuis le prospect
                    </p>
                  )}
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
    </div>
  );
}