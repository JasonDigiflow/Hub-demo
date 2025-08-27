'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ManageDataPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Revenue form state
  const [revenueForm, setRevenueForm] = useState({
    amount: '',
    campaignId: '',
    campaignName: '',
    date: new Date().toISOString().split('T')[0],
    source: 'meta_ads'
  });

  // Prospect form state
  const [prospectForm, setProspectForm] = useState({
    name: '',
    email: '',
    phone: '',
    campaignId: '',
    campaignName: '',
    status: 'new',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/revenues/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...revenueForm,
          amount: parseFloat(revenueForm.amount),
          createdAt: new Date(revenueForm.date).toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Revenue ajouté avec succès !');
        setRevenueForm({
          amount: '',
          campaignId: '',
          campaignName: '',
          date: new Date().toISOString().split('T')[0],
          source: 'meta_ads'
        });
      } else {
        setMessage('Erreur : ' + (data.error || 'Impossible d\'ajouter le revenue'));
      }
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddProspect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/prospects/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prospectForm,
          createdAt: new Date(prospectForm.date).toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Prospect ajouté avec succès !');
        setProspectForm({
          name: '',
          email: '',
          phone: '',
          campaignId: '',
          campaignName: '',
          status: 'new',
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        setMessage('Erreur : ' + (data.error || 'Impossible d\'ajouter le prospect'));
      }
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generateSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/generate-sample-data', {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Données générées : ${data.prospects} prospects, ${data.revenues} revenus`);
      } else {
        setMessage('Erreur lors de la génération des données');
      }
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gestion des Données</h1>
        <p className="text-gray-400">Ajouter manuellement des revenus et prospects</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.includes('succès') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="mb-8 bg-white/5 rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Actions Rapides</h2>
        <button
          onClick={generateSampleData}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Générer des données d\'exemple
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Génère automatiquement 10 prospects et 5 revenus pour tester
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'revenue'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Ajouter un Revenue
        </button>
        <button
          onClick={() => setActiveTab('prospect')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'prospect'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Ajouter un Prospect
        </button>
      </div>

      {/* Revenue Form */}
      {activeTab === 'revenue' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Nouveau Revenue</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={revenueForm.amount}
                onChange={(e) => setRevenueForm({...revenueForm, amount: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="150.00"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">ID Campagne</label>
              <input
                type="text"
                value={revenueForm.campaignId}
                onChange={(e) => setRevenueForm({...revenueForm, campaignId: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="campaign_123"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom Campagne</label>
              <input
                type="text"
                value={revenueForm.campaignName}
                onChange={(e) => setRevenueForm({...revenueForm, campaignName: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="Lead Generation Summer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={revenueForm.date}
                onChange={(e) => setRevenueForm({...revenueForm, date: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Source</label>
              <select
                value={revenueForm.source}
                onChange={(e) => setRevenueForm({...revenueForm, source: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              >
                <option value="meta_ads">Meta Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="organic">Organique</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <button
              onClick={handleAddRevenue}
              disabled={loading || !revenueForm.amount}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le Revenue'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Prospect Form */}
      {activeTab === 'prospect' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Nouveau Prospect</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                value={prospectForm.name}
                onChange={(e) => setProspectForm({...prospectForm, name: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={prospectForm.email}
                onChange={(e) => setProspectForm({...prospectForm, email: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="jean@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
              <input
                type="tel"
                value={prospectForm.phone}
                onChange={(e) => setProspectForm({...prospectForm, phone: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">ID Campagne</label>
              <input
                type="text"
                value={prospectForm.campaignId}
                onChange={(e) => setProspectForm({...prospectForm, campaignId: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="campaign_123"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom Campagne</label>
              <input
                type="text"
                value={prospectForm.campaignName}
                onChange={(e) => setProspectForm({...prospectForm, campaignName: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                placeholder="Lead Generation Summer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Statut</label>
              <select
                value={prospectForm.status}
                onChange={(e) => setProspectForm({...prospectForm, status: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              >
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="qualified">Qualifié</option>
                <option value="converted">Converti</option>
                <option value="lost">Perdu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={prospectForm.date}
                onChange={(e) => setProspectForm({...prospectForm, date: e.target.value})}
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              />
            </div>

            <button
              onClick={handleAddProspect}
              disabled={loading || !prospectForm.name || !prospectForm.email}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le Prospect'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}