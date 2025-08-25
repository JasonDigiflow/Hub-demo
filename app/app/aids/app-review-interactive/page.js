'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoData, getRealtimeMetrics, generateNewLead } from '@/lib/demo-data/aids-demo';

export default function AppReviewInteractive() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [campaigns, setCampaigns] = useState(demoData.campaigns);
  const [leads, setLeads] = useState(demoData.leads);
  const [metrics, setMetrics] = useState(demoData.campaigns[0]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Modals
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [showOctaviaChat, setShowOctaviaChat] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Forms
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: 'CONVERSIONS',
    budget: 1000,
    audience: 'broad',
    placement: 'automatic'
  });
  
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newBudget, setNewBudget] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [applyingRecommendation, setApplyingRecommendation] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: "Bonjour ! Je suis Octavia, votre assistante IA. Comment puis-je optimiser vos campagnes aujourd'hui ?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getRealtimeMetrics());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fonctions interactives
  const createCampaign = () => {
    if (!newCampaign.name) {
      showNotificationFunc('❌ Veuillez entrer un nom de campagne');
      return;
    }
    
    const campaign = {
      id: `campaign_${Date.now()}`,
      name: newCampaign.name,
      status: 'ACTIVE',
      objective: newCampaign.objective,
      budget: newCampaign.budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      conversions: 0,
      costPerConversion: 0,
      reach: 0,
      frequency: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      performance: 'new'
    };
    
    setCampaigns([campaign, ...campaigns]);
    setShowCreateCampaignModal(false);
    showNotificationFunc(`✅ Campagne "${campaign.name}" créée avec succès !`);
    setNewCampaign({
      name: '',
      objective: 'CONVERSIONS',
      budget: 1000,
      audience: 'broad',
      placement: 'automatic'
    });
  };

  const updateBudget = () => {
    if (!editingCampaign || newBudget <= 0) {
      showNotificationFunc('❌ Budget invalide');
      return;
    }
    
    const updatedCampaigns = campaigns.map(c => 
      c.id === editingCampaign.id 
        ? { ...c, budget: newBudget }
        : c
    );
    
    setCampaigns(updatedCampaigns);
    setShowEditBudgetModal(false);
    showNotificationFunc(`✅ Budget de "${editingCampaign.name}" modifié : ${newBudget}€`);
    setEditingCampaign(null);
  };

  const syncLeads = async () => {
    setSyncingLeads(true);
    
    // Simuler l'animation de sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Ajouter de nouveaux leads
    const newLeadsList = [];
    for (let i = 0; i < 5; i++) {
      newLeadsList.push(generateNewLead());
    }
    
    setLeads([...newLeadsList, ...leads]);
    setSyncingLeads(false);
    showNotificationFunc(`✅ 5 nouveaux leads synchronisés depuis Meta !`);
  };

  const exportLeads = (format) => {
    if (format === 'csv') {
      // Créer un CSV réel
      const csv = [
        'Nom,Email,Entreprise,Téléphone,Score,Statut,Source,Date',
        ...leads.map(l => 
          `"${l.name}","${l.email}","${l.company}","${l.phone}",${l.score},"${l.status}","${l.source}","${l.createdTime}"`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      showNotificationFunc('✅ Export CSV téléchargé !');
    } else {
      showNotificationFunc('📊 Export PDF en cours de génération...');
      setTimeout(() => {
        showNotificationFunc('✅ Export PDF téléchargé !');
      }, 2000);
    }
    setShowExportModal(false);
  };

  const applyRecommendation = (rec) => {
    setApplyingRecommendation(rec);
    
    setTimeout(() => {
      if (rec.action === 'increase_budget') {
        const campaign = campaigns[0];
        setCampaigns(campaigns.map(c => 
          c.id === campaign.id 
            ? { ...c, budget: c.budget + 500 }
            : c
        ));
        showNotificationFunc('✅ Budget augmenté de 500€');
      } else if (rec.action === 'create_lookalike') {
        showNotificationFunc('✅ Audience lookalike créée');
      } else if (rec.action === 'refresh_creatives') {
        showNotificationFunc('✅ Nouvelles créatives en cours de création');
      } else if (rec.action === 'adjust_schedule') {
        showNotificationFunc('✅ Planning optimisé pour 20h-22h');
      }
      
      setApplyingRecommendation(null);
    }, 1500);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { type: 'user', text: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    
    // Réponse d'Octavia
    setTimeout(() => {
      const responses = [
        "J'analyse vos campagnes... Je vois que votre CTR est excellent à 3.6%. Je recommande d'augmenter le budget de 20%.",
        "Vos leads de qualité proviennent principalement des femmes 25-34 ans. Créons une audience similaire !",
        "Le coût par conversion de 36€ est dans la moyenne. Avec une optimisation créative, on peut le réduire à 28€.",
        "Vos publicités performent mieux le soir. Je vais ajuster automatiquement les enchères pour ces créneaux."
      ];
      
      const botMessage = { 
        type: 'bot', 
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
        : c
    ));
    showNotificationFunc('✅ Statut de la campagne modifié');
  };

  const changeLeadStatus = (leadId, newStatus) => {
    setLeads(leads.map(l => 
      l.id === leadId 
        ? { ...l, status: newStatus }
        : l
    ));
    showNotificationFunc(`✅ Statut du lead modifié : ${newStatus}`);
  };

  const showNotificationFunc = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'campaigns', name: 'Campagnes', icon: '🎯' },
    { id: 'leads', name: 'Prospects', icon: '👥' },
    { id: 'insights', name: 'Insights', icon: '📈' },
    { id: 'attribution', name: 'Attribution', icon: '🔄' },
    { id: 'events', name: 'Événements', icon: '⚡' },
    { id: 'ai', name: 'IA Octavia', icon: '🤖' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AIDs - Mode App Review Interactif
            </h1>
            <p className="text-sm text-gray-400">Version complète pour démonstration Facebook</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm animate-pulse">
              ● Connecté: DigiFlow Agency
            </span>
            <button
              onClick={() => window.location.href = '/app/aids'}
              className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-700"
            >
              Retour au vrai dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Section - ads_read */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Tableau de Bord en Temps Réel (ads_read)</h2>
            
            {/* Métriques animées */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Budget Dépensé"
                value={`${metrics.spent.toLocaleString()} €`}
                change="+12%"
                color="blue"
                isAnimated={true}
              />
              <MetricCard
                title="Impressions"
                value={metrics.impressions.toLocaleString()}
                change="+8%"
                color="green"
                isAnimated={true}
              />
              <MetricCard
                title="Clics"
                value={metrics.clicks.toLocaleString()}
                change="+15%"
                color="purple"
                isAnimated={true}
              />
              <MetricCard
                title="Conversions"
                value={metrics.conversions}
                change="+22%"
                color="pink"
                isAnimated={true}
              />
            </div>

            {/* Graphique interactif */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Performance sur 7 jours</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-purple-600 rounded text-sm">Jour</button>
                  <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">Semaine</button>
                  <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">Mois</button>
                </div>
              </div>
              <div className="h-64 flex items-end gap-2">
                {demoData.insights.performance.daily.map((day, i) => (
                  <motion.div 
                    key={i} 
                    className="flex-1 flex flex-col items-center group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="hidden group-hover:block absolute bg-gray-700 px-2 py-1 rounded text-xs -mt-8">
                      {day.clicks} clics
                    </div>
                    <motion.div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.clicks / 700) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                    <span className="text-xs mt-2">{day.date.split('-')[2]}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Section - ads_management */}
        {activeSection === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Gestion des Campagnes (ads_management)</h2>
              <button 
                onClick={() => setShowCreateCampaignModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                + Créer une nouvelle campagne
              </button>
            </div>

            <div className="space-y-4">
              {campaigns.map(campaign => (
                <motion.div 
                  key={campaign.id} 
                  className="bg-gray-800 rounded-lg p-6"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold">{campaign.name}</h3>
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          campaign.status === 'ACTIVE' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        {campaign.status}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setNewBudget(campaign.budget);
                          setShowEditBudgetModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-all"
                      >
                        Modifier Budget
                      </button>
                      <button className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-all">
                        Dupliquer
                      </button>
                      <button className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-all">
                        Optimiser avec IA
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <p className="font-bold text-lg">{campaign.budget} €</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dépensé:</span>
                      <p className="font-bold text-lg">{campaign.spent} €</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CTR:</span>
                      <p className="font-bold text-lg">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversions:</span>
                      <p className="font-bold text-lg">{campaign.conversions}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Section - leads_retrieval */}
        {activeSection === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Centre de Prospects (leads_retrieval)</h2>
              <div className="flex gap-3">
                <button 
                  onClick={syncLeads}
                  disabled={syncingLeads}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {syncingLeads ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      🔄 Synchroniser Meta Leads
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all"
                >
                  📥 Exporter
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Entreprise</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {leads.slice(0, 10).map((lead, i) => (
                      <motion.tr 
                        key={lead.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-t border-gray-700 hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3">{lead.name}</td>
                        <td className="px-4 py-3">{lead.email}</td>
                        <td className="px-4 py-3">{lead.company}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            lead.score >= 80 ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={lead.status}
                            onChange={(e) => changeLeadStatus(lead.id, e.target.value)}
                            className="px-2 py-1 bg-blue-600 rounded text-sm cursor-pointer hover:bg-blue-700"
                          >
                            <option value="new">Nouveau</option>
                            <option value="contacted">Contacté</option>
                            <option value="qualified">Qualifié</option>
                            <option value="converted">Converti</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowLeadDetailsModal(true);
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Voir détails
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Insights Section - read_insights */}
        {activeSection === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Insights Avancés (read_insights)</h2>

            {/* Démographie interactive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Répartition par âge (Cliquez pour filtrer)</h3>
                {demoData.insights.demographics.age.map((age, i) => (
                  <motion.div 
                    key={age.range} 
                    className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => showNotificationFunc(`Filtrage sur ${age.range} ans : ${age.conversions} conversions`)}
                  >
                    <span>{age.range} ans</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-4">
                        <motion.div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${age.percentage}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-sm">{age.percentage}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Répartition par genre</h3>
                {demoData.insights.demographics.gender.map((gender, i) => (
                  <motion.div 
                    key={gender.type} 
                    className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => showNotificationFunc(`${gender.type}: ${gender.clicks} clics, ${gender.conversions} conversions`)}
                  >
                    <span className="capitalize">{gender.type === 'female' ? 'Femme' : gender.type === 'male' ? 'Homme' : 'Non spécifié'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-4">
                        <motion.div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-4 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${gender.percentage}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-sm">{gender.percentage}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Analyse temporelle interactive */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Meilleurs créneaux horaires (Cliquez pour planifier)</h3>
              <div className="flex items-end gap-2">
                {demoData.insights.timeAnalysis.bestHours.map((hour, i) => (
                  <motion.div 
                    key={hour.hour} 
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => showNotificationFunc(`Planification optimisée pour ${hour.hour}`)}
                  >
                    <span className="hidden group-hover:block absolute -mt-8 bg-gray-700 px-2 py-1 rounded text-xs">
                      Performance: {hour.performance}%
                    </span>
                    <motion.div
                      className="w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-t hover:from-green-500 hover:to-emerald-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${hour.performance}px` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                    <span className="text-xs mt-2">{hour.hour}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attribution Section - attribution_read */}
        {activeSection === 'attribution' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Attribution & Parcours (attribution_read)</h2>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Parcours de conversion interactifs</h3>
              {demoData.attribution.conversionPaths.map((path, i) => (
                <motion.div 
                  key={i} 
                  className="mb-4 p-4 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => showNotificationFunc(`Analyse du parcours: ${path.conversions} conversions, ROI: ${(path.value/1000).toFixed(1)}k€`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {path.path.map((step, j) => (
                      <React.Fragment key={j}>
                        <motion.span 
                          className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-500"
                          whileHover={{ scale: 1.1 }}
                        >
                          {step}
                        </motion.span>
                        {j < path.path.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{path.conversions} conversions</span>
                    <span>{path.value} € de valeur</span>
                    <span>{path.avgDays} jours en moyenne</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {['lastClick', 'linear'].map(model => (
                <div key={model} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Modèle {model === 'lastClick' ? 'Last Click' : 'Linear'}
                  </h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => showNotificationFunc(`Facebook: ${demoData.attribution.models[model].facebook}% des conversions`)}
                    >
                      <span>Facebook</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-600 rounded-full h-6">
                          <motion.div
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                            initial={{ width: 0 }}
                            animate={{ width: `${demoData.attribution.models[model].facebook}%` }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-xs font-bold">{demoData.attribution.models[model].facebook}%</span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => showNotificationFunc(`Instagram: ${demoData.attribution.models[model].instagram}% des conversions`)}
                    >
                      <span>Instagram</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-600 rounded-full h-6">
                          <motion.div
                            className="bg-pink-600 h-6 rounded-full flex items-center justify-end pr-2"
                            initial={{ width: 0 }}
                            animate={{ width: `${demoData.attribution.models[model].instagram}%` }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-xs font-bold">{demoData.attribution.models[model].instagram}%</span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Section - page_events */}
        {activeSection === 'events' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Tracking Événements (page_events)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoData.events.map(event => (
                <motion.div 
                  key={event.type} 
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => showNotificationFunc(`${event.type}: ${event.count} événements trackés`)}
                >
                  <h3 className="text-lg font-bold mb-2">{event.type}</h3>
                  <motion.p 
                    className="text-3xl font-bold text-purple-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {event.count.toLocaleString()}
                  </motion.p>
                  <p className="text-sm text-gray-400">
                    {event.uniqueUsers} utilisateurs uniques
                  </p>
                  {event.avgValue > 0 && (
                    <p className="text-sm text-green-400 mt-2">
                      Valeur moy: {event.avgValue} €
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Entonnoir de conversion interactif */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Entonnoir de conversion (Cliquez pour analyser)</h3>
              <div className="space-y-2">
                {demoData.events.map((event, i) => (
                  <motion.div 
                    key={event.type} 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => showNotificationFunc(`Taux de conversion ${event.type}: ${((event.count / demoData.events[0].count) * 100).toFixed(1)}%`)}
                  >
                    <span className="w-32">{event.type}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-8">
                      <motion.div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-8 rounded-full flex items-center justify-end pr-4 hover:from-purple-500 hover:to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(event.count / demoData.events[0].count) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-sm font-bold">
                          {((event.count / demoData.events[0].count) * 100).toFixed(1)}%
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Section - Octavia */}
        {activeSection === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">🤖 IA Octavia - Optimisation Intelligente</h2>

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-xl font-bold mb-4">Analyse en temps réel par l'IA</h3>
              <p className="text-gray-300">
                Octavia analyse vos campagnes 24/7 et génère des recommandations personnalisées.
                Cliquez sur "Appliquer" pour voir l'optimisation en action !
              </p>
            </div>

            {/* Recommandations interactives */}
            <div className="space-y-4">
              {demoData.aiRecommendations.map((rec, i) => (
                <motion.div 
                  key={i} 
                  className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      rec.priority === 'high' ? 'bg-red-600' :
                      rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {rec.priority === 'high' ? 'Urgent' :
                       rec.priority === 'medium' ? 'Important' : 'Info'}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-400">
                      Impact estimé: {rec.estimatedImpact}
                    </span>
                    <button 
                      onClick={() => applyRecommendation(rec)}
                      disabled={applyingRecommendation === rec}
                      className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {applyingRecommendation === rec ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Application...
                        </>
                      ) : (
                        'Appliquer'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat interactif avec Octavia */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Chat avec Octavia</h3>
                <button
                  onClick={() => setShowOctaviaChat(!showOctaviaChat)}
                  className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700"
                >
                  {showOctaviaChat ? 'Réduire' : 'Ouvrir le chat'}
                </button>
              </div>
              
              {showOctaviaChat && (
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 bg-gray-900 rounded p-4">
                    {chatMessages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.type === 'bot' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {msg.type === 'bot' ? '🤖' : '👤'}
                        </div>
                        <div className={`flex-1 rounded-lg p-3 ${
                          msg.type === 'bot' ? 'bg-gray-700' : 'bg-blue-900'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Posez votre question à Octavia..."
                      className="flex-1 px-4 py-3 bg-gray-700 rounded-lg text-white"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Créer une nouvelle campagne</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom de la campagne</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                    placeholder="Ex: Black Friday 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Objectif</label>
                  <select 
                    value={newCampaign.objective}
                    onChange={(e) => setNewCampaign({...newCampaign, objective: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                  >
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="LEAD_GENERATION">Génération de leads</option>
                    <option value="TRAFFIC">Trafic</option>
                    <option value="BRAND_AWARENESS">Notoriété</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Budget quotidien (€)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Audience</label>
                  <select 
                    value={newCampaign.audience}
                    onChange={(e) => setNewCampaign({...newCampaign, audience: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                  >
                    <option value="broad">Large (recommandé)</option>
                    <option value="custom">Personnalisée</option>
                    <option value="lookalike">Lookalike 1%</option>
                    <option value="retargeting">Retargeting</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createCampaign}
                    className="flex-1 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                  >
                    Créer la campagne
                  </button>
                  <button
                    onClick={() => setShowCreateCampaignModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {showEditBudgetModal && editingCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowEditBudgetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Modifier le budget</h3>
              <p className="text-gray-400 mb-4">Campagne: {editingCampaign.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Budget actuel: {editingCampaign.budget}€</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 rounded text-white text-lg"
                  />
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-sm text-gray-400">Impact estimé:</p>
                  <p className="text-green-400">
                    +{Math.round((newBudget - editingCampaign.budget) * 0.08)} conversions supplémentaires
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={updateBudget}
                    className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowEditBudgetModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Details Modal */}
      <AnimatePresence>
        {showLeadDetailsModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLeadDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Détails du prospect</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nom</p>
                    <p className="font-bold">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-bold">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Téléphone</p>
                    <p className="font-bold">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Entreprise</p>
                    <p className="font-bold">{selectedLead.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Score</p>
                    <p className="font-bold text-green-400">{selectedLead.score}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Valeur estimée</p>
                    <p className="font-bold text-yellow-400">{selectedLead.estimatedValue}€</p>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-sm text-gray-400 mb-2">Source</p>
                  <p>{selectedLead.source}</p>
                  <p className="text-sm text-gray-500">Campagne: {selectedLead.campaignName}</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                    Envoyer un email
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                    Appeler
                  </button>
                  <button
                    onClick={() => setShowLeadDetailsModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Exporter les prospects</h3>
              <p className="text-gray-400 mb-4">
                {leads.length} prospects seront exportés
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => exportLeads('csv')}
                  className="w-full px-4 py-3 bg-green-600 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  📄 Export CSV
                </button>
                <button
                  onClick={() => exportLeads('pdf')}
                  className="w-full px-4 py-3 bg-red-600 rounded hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  📑 Export PDF
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-3 bg-gray-600 rounded hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant MetricCard animé
function MetricCard({ title, value, change, color, isAnimated }) {
  const bgColor = {
    blue: 'from-blue-600/20 to-blue-600/10 border-blue-600/20',
    green: 'from-green-600/20 to-green-600/10 border-green-600/20',
    purple: 'from-purple-600/20 to-purple-600/10 border-purple-600/20',
    pink: 'from-pink-600/20 to-pink-600/10 border-pink-600/20',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border cursor-pointer`}
    >
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <motion.div 
        className="text-2xl font-bold text-white"
        animate={isAnimated ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {value}
      </motion.div>
      <div className="text-green-400 text-sm mt-1">{change}</div>
    </motion.div>
  );
}