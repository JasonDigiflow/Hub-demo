'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter,
  ComposedChart, Treemap, Sankey, Funnel, FunnelChart, LabelList
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/ui/Sidebar';
import { useLocale } from '@/lib/contexts/LocaleContext';
import { useRouter } from 'next/navigation';

export default function DemoHubCRM() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState('pipe');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // kanban ou table
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [columnPages, setColumnPages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      city: '',
      contactName: '',
      position: ''
    },
    stage: 'NEW',
    value: 0,
    score: 5,
    ownerUserId: 'user_1',
    source: 'Manuel',
    product: '',
    notes: '',
    decisionMaker: false,
    utms: {
      source: 'direct',
      medium: 'manual',
      campaign: '',
      content: ''
    }
  });
  const [activeFilters, setActiveFilters] = useState({
    stage: 'all',
    owner: 'all',
    source: 'all',
    score: 'all'
  });
  
  const LEADS_PER_PAGE = 10;

  // PIPE - Données des leads
  const [leads, setLeads] = useState([
    {
      id: 1,
      contact: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@techcorp.fr',
        phone: '+33612345678',
        company: 'TechCorp',
        website: 'techcorp.fr'
      },
      stage: 'QUALIFIED',
      source: 'meta_lead',
      campaign: {
        platform: 'meta',
        campaignId: 'CMP-2024-01',
        adsetId: 'ADS-001',
        adId: 'AD-1234'
      },
      utms: {
        source: 'facebook',
        medium: 'cpc',
        campaign: 'winter_promo',
        term: 'saas',
        content: 'video_ad'
      },
      score: { label: 'CHAUD', value: 0.85 },
      tags: ['Premium', 'Decision Maker', 'Budget OK'],
      ownerUserId: 'Sophie Martin',
      amountExpected: 45000,
      createdAt: Date.now() - 86400000 * 15,
      lastActivity: Date.now() - 3600000 * 2,
      consents: { whatsapp: true, email: true },
      meta: { notesCount: 3, tasksCount: 2 }
    },
    {
      id: 2,
      contact: {
        firstName: 'Marie',
        lastName: 'Laurent',
        email: 'marie@globalinc.com',
        phone: '+33698765432',
        company: 'Global Inc',
        website: 'globalinc.com'
      },
      stage: 'NEW',
      source: 'csv',
      score: { label: 'TIÈDE', value: 0.62 },
      tags: ['Prospect', 'International'],
      ownerUserId: 'Pierre Dubois',
      amountExpected: 28000,
      createdAt: Date.now() - 86400000 * 3,
      lastActivity: Date.now() - 3600000 * 12,
      consents: { whatsapp: false, email: true },
      meta: { notesCount: 1, tasksCount: 4 }
    },
    {
      id: 3,
      contact: {
        firstName: 'Sophie',
        lastName: 'Moreau',
        email: 'sophie.moreau@dataco.fr',
        phone: '+33611223344',
        company: 'DataCo Solutions',
        website: 'dataco.fr'
      },
      stage: 'PROPOSAL',
      source: 'manual',
      score: { label: 'CHAUD', value: 0.92 },
      tags: ['VIP', 'Fast Track', 'Enterprise'],
      ownerUserId: 'Marie Laurent',
      amountExpected: 120000,
      createdAt: Date.now() - 86400000 * 30,
      lastActivity: Date.now() - 3600000,
      consents: { whatsapp: true, email: true },
      meta: { notesCount: 8, tasksCount: 1 }
    }
  ]);

  // REVENUES - Données des revenus
  const [revenues] = useState([
    {
      id: 1,
      leadId: 1,
      amount: 45000,
      currency: 'EUR',
      date: Date.now() - 86400000 * 5,
      type: 'SERVICE',
      channel: 'meta',
      linked: {
        campaignId: 'CMP-2024-01',
        adsetId: 'ADS-001',
        adId: 'AD-1234'
      },
      notes: 'Premier paiement - Contrat annuel'
    },
    {
      id: 2,
      leadId: 3,
      amount: 60000,
      currency: 'EUR',
      date: Date.now() - 86400000 * 10,
      type: 'SAAS',
      channel: 'google',
      notes: 'Abonnement Enterprise 12 mois'
    }
  ]);

  // AUTOMATIONS - Règles actives
  const [automationRules] = useState([
    {
      id: 1,
      name: 'Assignation auto leads chauds',
      enabled: true,
      trigger: 'lead.created',
      conditions: [
        { field: 'score.value', op: '>=', value: 0.7 }
      ],
      actions: ['assign(ownerUserId=best_available)', 'create_task("Appeler sous 1h")'],
      runs: 234,
      successRate: 98
    },
    {
      id: 2,
      name: 'Relance leads tièdes',
      enabled: true,
      trigger: 'lead.stage_changed',
      conditions: [
        { field: 'stage', op: '=', value: 'CONTACTED' },
        { field: 'score.value', op: '<', value: 0.7 }
      ],
      actions: ['start_leadwarm(template="nurturing")', 'notify("slack")'],
      runs: 456,
      successRate: 95
    },
    {
      id: 3,
      name: 'Escalade leads abandonnés',
      enabled: false,
      trigger: 'lead.no_activity',
      conditions: [
        { field: 'days_since_activity', op: '>', value: 7 }
      ],
      actions: ['assign(ownerUserId=manager)', 'create_task("Reprise urgente")'],
      runs: 89,
      successRate: 87
    }
  ]);

  // Pipeline stages configuration
  const pipelineConfig = {
    NEW: { label: locale === 'fr' ? 'Nouveau' : 'New', color: '#8B5CF6', icon: '🆕', probability: 0.05 },
    CONTACTED: { label: locale === 'fr' ? 'Contacté' : 'Contacted', color: '#3B82F6', icon: '📞', probability: 0.2 },
    QUALIFIED: { label: locale === 'fr' ? 'Qualifié' : 'Qualified', color: '#10B981', icon: '✅', probability: 0.45 },
    PROPOSAL: { label: locale === 'fr' ? 'Proposition' : 'Proposal', color: '#F59E0B', icon: '📄', probability: 0.7 },
    WON: { label: locale === 'fr' ? 'Gagné' : 'Won', color: '#22C55E', icon: '🎉', probability: 1 },
    LOST: { label: locale === 'fr' ? 'Perdu' : 'Lost', color: '#EF4444', icon: '❌', probability: 0 }
  };

  // Calcul des métriques
  const calculateMetrics = () => {
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.stage === 'WON').length;
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const avgDealSize = totalRevenue / (wonLeads || 1);
    const winRate = (wonLeads / totalLeads) * 100;
    
    // Forecast (somme des probabilités)
    const forecast30d = leads.reduce((sum, lead) => {
      const prob = pipelineConfig[lead.stage].probability;
      return sum + (lead.amountExpected * prob);
    }, 0);

    return {
      totalLeads,
      wonLeads,
      totalRevenue,
      avgDealSize,
      winRate,
      forecast30d
    };
  };

  const metrics = calculateMetrics();

  // ENRICHISSEMENT - Simulation
  const enrichLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      // Simulation enrichissement
      setTimeout(() => {
        setLeads(prev => prev.map(l => 
          l.id === leadId 
            ? {
                ...l,
                contact: {
                  ...l.contact,
                  siret: '12345678901234',
                  naf: '6201Z',
                  effectif: '50-100'
                },
                tags: [...l.tags, 'Enriched'],
                enrichmentScore: 0.85
              }
            : l
        ));
      }, 1500);
    }
  };

  // Drag & Drop pour Kanban
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, stage: newStage, lastActivity: Date.now() }
        : lead
    ));
  };

  const tabs = [
    { id: 'pipe', name: locale === 'fr' ? 'Pipeline' : 'Pipe', icon: '🎯' },
    { id: 'revenues', name: locale === 'fr' ? 'Revenus' : 'Revenues', icon: '💰' },
    { id: 'automations', name: locale === 'fr' ? 'Automations' : 'Automations', icon: '⚡' },
    { id: 'forecast', name: locale === 'fr' ? 'Prévisions' : 'Forecast', icon: '📊' },
    { id: 'enrichment', name: locale === 'fr' ? 'Enrichissement' : 'Enrichment', icon: '🔍' }
  ];

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-72'}`}>
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-emerald-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
      </div>

      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        moduleIcon="💎"
        moduleName="HubCRM Elite"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="relative z-10">
        <div className="p-6">
          {/* Header avec KPIs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              HubCRM Elite
            </h1>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Total Leads', value: metrics.totalLeads, icon: '👥', color: 'from-purple-600 to-blue-600' },
                { label: 'Won Deals', value: metrics.wonLeads, icon: '🎉', color: 'from-green-600 to-emerald-600' },
                { label: 'Revenue', value: `€${(metrics.totalRevenue/1000).toFixed(0)}K`, icon: '💰', color: 'from-blue-600 to-cyan-600' },
                { label: 'Avg Deal', value: `€${(metrics.avgDealSize/1000).toFixed(0)}K`, icon: '📊', color: 'from-orange-600 to-red-600' },
                { label: 'Win Rate', value: `${metrics.winRate.toFixed(0)}%`, icon: '🎯', color: 'from-purple-600 to-pink-600' },
                { label: 'Forecast 30d', value: `€${(metrics.forecast30d/1000).toFixed(0)}K`, icon: '🔮', color: 'from-indigo-600 to-purple-600' }
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-4 backdrop-blur-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                        <span className="text-xl">{kpi.icon}</span>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content based on active tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'pipe' && (
              <motion.div
                key="pipe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Search & Filters */}
                <GlassCard className="p-4 mb-6 backdrop-blur-xl bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={locale === 'fr' ? 'Rechercher un lead...' : 'Search leads...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-3 top-2.5 text-white/40">🔍</span>
                    </div>
                    
                    <select 
                      value={activeFilters.stage}
                      onChange={(e) => setActiveFilters({...activeFilters, stage: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    >
                      <option value="all">{locale === 'fr' ? 'Tous les stades' : 'All stages'}</option>
                      {Object.entries(pipelineConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>

                    <select 
                      value={activeFilters.score}
                      onChange={(e) => setActiveFilters({...activeFilters, score: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    >
                      <option value="all">{locale === 'fr' ? 'Tous les scores' : 'All scores'}</option>
                      <option value="hot">🔥 CHAUD</option>
                      <option value="warm">🌡️ TIÈDE</option>
                      <option value="cold">❄️ FROID</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-purple-600' : 'bg-white/10'}`}
                      >
                        📋 Kanban
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-purple-600' : 'bg-white/10'}`}
                      >
                        📊 Table
                      </button>
                      <button
                        onClick={() => setShowAddLeadModal(true)}
                        className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                      >
                        <span className="text-lg">➕</span>
                        <span>{locale === 'fr' ? 'Ajouter un lead' : 'Add lead'}</span>
                      </button>
                    </div>
                  </div>
                </GlassCard>

                {/* Vue Kanban */}
                {viewMode === 'kanban' ? (
                  <div className="grid grid-cols-6 gap-4">
                    {Object.entries(pipelineConfig).map(([stage, config]) => (
                      <div 
                        key={stage}
                        className="min-h-[600px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-white font-bold flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </h3>
                          <span className="text-white/50 text-sm">
                            {leads.filter(l => l.stage === stage).length}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {(() => {
                            const filteredLeads = leads
                              .filter(l => l.stage === stage)
                              .filter(l => !searchQuery || 
                                l.contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                l.contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                l.contact.company.toLowerCase().includes(searchQuery.toLowerCase())
                              );
                            
                            const currentPage = columnPages[stage] || 0;
                            const start = currentPage * LEADS_PER_PAGE;
                            const paginatedLeads = filteredLeads.slice(start, start + LEADS_PER_PAGE);
                            const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
                            
                            return (
                              <>
                                {paginatedLeads.map(lead => (
                              <motion.div
                                key={lead.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                whileHover={{ scale: 1.02 }}
                                className="cursor-move"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowLeadDetails(true);
                                }}
                              >
                                <GlassCard className="p-4 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="text-white font-semibold">
                                        {lead.contact.firstName} {lead.contact.lastName}
                                      </p>
                                      <p className="text-white/60 text-sm">{lead.contact.company}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      lead.score.value > 0.7 ? 'bg-red-500/20 text-red-400' :
                                      lead.score.value > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {lead.score.label}
                                    </span>
                                  </div>
                                  
                                  <p className="text-white/40 text-xs mb-2">{lead.contact.email}</p>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-green-400 font-bold">
                                      €{(lead.amountExpected/1000).toFixed(0)}K
                                    </span>
                                    <div className="flex gap-1">
                                      {lead.consents.email && <span title="Email consent">✉️</span>}
                                      {lead.consents.whatsapp && <span title="WhatsApp consent">💬</span>}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-1 mt-2">
                                    {lead.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                    <span className="text-white/40 text-xs">{lead.ownerUserId}</span>
                                    <div className="flex gap-2 text-xs text-white/40">
                                      <span>📝 {lead.meta.notesCount}</span>
                                      <span>✅ {lead.meta.tasksCount}</span>
                                    </div>
                                  </div>
                                </GlassCard>
                              </motion.div>
                            ))}
                                
                                {totalPages > 1 && (
                                  <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                                    <button
                                      onClick={() => setColumnPages({...columnPages, [stage]: Math.max(0, currentPage - 1)})}
                                      disabled={currentPage === 0}
                                      className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                    >
                                      ←
                                    </button>
                                    <span className="text-white/60 text-sm px-3 py-1">
                                      {currentPage + 1} / {totalPages}
                                    </span>
                                    <button
                                      onClick={() => setColumnPages({...columnPages, [stage]: Math.min(totalPages - 1, currentPage + 1)})}
                                      disabled={currentPage >= totalPages - 1}
                                      className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                    >
                                      →
                                    </button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Vue Table */
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/60 pb-3">Lead</th>
                            <th className="text-left text-white/60 pb-3">Company</th>
                            <th className="text-left text-white/60 pb-3">Stage</th>
                            <th className="text-left text-white/60 pb-3">Score</th>
                            <th className="text-left text-white/60 pb-3">Value</th>
                            <th className="text-left text-white/60 pb-3">Owner</th>
                            <th className="text-left text-white/60 pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads
                            .filter(l => activeFilters.stage === 'all' || l.stage === activeFilters.stage)
                            .filter(l => !searchQuery || 
                              l.contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              l.contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              l.contact.company.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(lead => (
                              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3">
                                  <div>
                                    <p className="text-white font-medium">
                                      {lead.contact.firstName} {lead.contact.lastName}
                                    </p>
                                    <p className="text-white/40 text-sm">{lead.contact.email}</p>
                                  </div>
                                </td>
                                <td className="text-white/70">{lead.contact.company}</td>
                                <td>
                                  <span className="px-2 py-1 rounded-full text-xs" style={{
                                    backgroundColor: pipelineConfig[lead.stage].color + '20',
                                    color: pipelineConfig[lead.stage].color
                                  }}>
                                    {pipelineConfig[lead.stage].icon} {pipelineConfig[lead.stage].label}
                                  </span>
                                </td>
                                <td>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    lead.score.value > 0.7 ? 'bg-red-500/20 text-red-400' :
                                    lead.score.value > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {lead.score.label}
                                  </span>
                                </td>
                                <td className="text-green-400 font-bold">
                                  €{(lead.amountExpected/1000).toFixed(0)}K
                                </td>
                                <td className="text-white/60">{lead.ownerUserId}</td>
                                <td>
                                  <button 
                                    onClick={() => enrichLead(lead.id)}
                                    className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30"
                                  >
                                    Enrich
                                  </button>
                                </td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'revenues' && (
              <motion.div
                key="revenues"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Revenue Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {locale === 'fr' ? 'Revenus par Canal' : 'Revenue by Channel'}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Meta', value: 45000, fill: '#8B5CF6' },
                            { name: 'Google', value: 60000, fill: '#3B82F6' },
                            { name: 'Direct', value: 35000, fill: '#10B981' },
                            { name: 'Other', value: 25000, fill: '#F59E0B' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0, 1, 2, 3].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {locale === 'fr' ? 'ROAS Réel par Campagne' : 'Real ROAS by Campaign'}
                    </h3>
                    <div className="space-y-4">
                      {[
                        { campaign: 'CMP-2024-01', spend: 12000, revenue: 45000, roas: 3.75 },
                        { campaign: 'CMP-2024-02', spend: 8000, revenue: 28000, roas: 3.5 },
                        { campaign: 'CMP-2024-03', spend: 15000, revenue: 60000, roas: 4.0 }
                      ].map(item => (
                        <div key={item.campaign} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{item.campaign}</p>
                            <p className="text-white/40 text-sm">
                              Spend: €{(item.spend/1000).toFixed(0)}K → Revenue: €{(item.revenue/1000).toFixed(0)}K
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${item.roas > 3.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {item.roas.toFixed(2)}x
                            </p>
                            <p className="text-white/40 text-xs">ROAS</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                {/* Revenue Table */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Historique des Revenus' : 'Revenue History'}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 pb-3">Date</th>
                          <th className="text-left text-white/60 pb-3">Lead</th>
                          <th className="text-left text-white/60 pb-3">Amount</th>
                          <th className="text-left text-white/60 pb-3">Type</th>
                          <th className="text-left text-white/60 pb-3">Channel</th>
                          <th className="text-left text-white/60 pb-3">Campaign</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenues.map(revenue => {
                          const lead = leads.find(l => l.id === revenue.leadId);
                          return (
                            <tr key={revenue.id} className="border-b border-white/5">
                              <td className="py-3 text-white/60">
                                {new Date(revenue.date).toLocaleDateString()}
                              </td>
                              <td className="text-white">
                                {lead ? `${lead.contact.firstName} ${lead.contact.lastName}` : 'Unknown'}
                              </td>
                              <td className="text-green-400 font-bold">
                                €{(revenue.amount/1000).toFixed(0)}K
                              </td>
                              <td className="text-white/60">{revenue.type}</td>
                              <td className="text-white/60">{revenue.channel}</td>
                              <td className="text-white/60">{revenue.linked?.campaignId || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'automations' && (
              <motion.div
                key="automations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {locale === 'fr' ? 'Règles d\'Automation' : 'Automation Rules'}
                  </h2>
                  <Button 
                    variant="gradient" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => setShowAutomationModal(true)}
                  >
                    ➕ {locale === 'fr' ? 'Nouvelle Règle' : 'New Rule'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {automationRules.map(rule => (
                    <GlassCard key={rule.id} className="p-6 backdrop-blur-xl bg-white/5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                          <p className="text-white/40 text-sm mt-1">
                            Trigger: <span className="text-purple-400">{rule.trigger}</span>
                          </p>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-500'} relative cursor-pointer`}>
                          <div className={`absolute top-1 ${rule.enabled ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`} />
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Conditions:</p>
                        {rule.conditions.map((cond, i) => (
                          <div key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded text-xs mb-1">
                            {cond.field} {cond.op} {cond.value}
                          </div>
                        ))}
                      </div>

                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Actions:</p>
                        {rule.actions.map((action, i) => (
                          <div key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs mb-1">
                            {action}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex gap-4 text-sm">
                          <span className="text-white/60">
                            Runs: <span className="text-white">{rule.runs}</span>
                          </span>
                          <span className="text-white/60">
                            Success: <span className="text-green-400">{rule.successRate}%</span>
                          </span>
                        </div>
                        <button className="text-purple-400 hover:text-purple-300 text-sm">
                          {locale === 'fr' ? 'Voir logs' : 'View logs'}
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'forecast' && (
              <motion.div
                key="forecast"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Prévisions de Revenus' : 'Revenue Forecast'}
                  </h3>
                  
                  {/* Forecast Chart */}
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={[
                      { month: 'Jan', actual: 45000, forecast: 42000 },
                      { month: 'Feb', actual: 52000, forecast: 48000 },
                      { month: 'Mar', actual: 48000, forecast: 51000 },
                      { month: 'Apr', actual: null, forecast: 58000 },
                      { month: 'May', actual: null, forecast: 65000 },
                      { month: 'Jun', actual: null, forecast: 72000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#ffffff40" />
                      <YAxis stroke="#ffffff40" />
                      <Tooltip />
                      <Bar dataKey="actual" fill="#10B981" />
                      <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* What-if Simulator */}
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Simulateur What-If' : 'What-If Simulator'}
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(pipelineConfig).filter(([stage]) => stage !== 'LOST').map(([stage, config]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <span className="text-white">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={config.probability * 100}
                            className="w-32"
                            onChange={(e) => {}}
                          />
                          <span className="text-white/60 w-12">{(config.probability * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Forecast ajusté (30j):</span>
                      <span className="text-3xl font-bold text-purple-400">
                        €{(metrics.forecast30d/1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'enrichment' && (
              <motion.div
                key="enrichment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Enrichissement des Leads' : 'Lead Enrichment'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-400">73%</div>
                      <p className="text-white/60 text-sm">Complétude moyenne</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400">156</div>
                      <p className="text-white/60 text-sm">Leads enrichis</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400">12</div>
                      <p className="text-white/60 text-sm">Doublons détectés</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white/80 font-medium">{locale === 'fr' ? 'Leads à enrichir' : 'Leads to enrich'}</h4>
                    {leads.filter(l => !l.enrichmentScore).map(lead => (
                      <div key={lead.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">
                            {lead.contact.firstName} {lead.contact.lastName}
                          </p>
                          <p className="text-white/40 text-sm">{lead.contact.company}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{ width: '45%' }}
                            />
                          </div>
                          <button
                            onClick={() => enrichLead(lead.id)}
                            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30"
                          >
                            Enrichir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6 backdrop-blur-xl bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Conseils IA' : 'AI Insights'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { lead: 'Jean Dupont', advice: 'Meilleur canal: Email. Créneau optimal: Mardi 10h-11h', confidence: 85 },
                      { lead: 'Marie Laurent', advice: 'Meilleur canal: LinkedIn. Argument clé: ROI démontré', confidence: 92 },
                      { lead: 'Sophie Moreau', advice: 'Meilleur canal: WhatsApp. Focus: Support premium', confidence: 78 }
                    ].map(item => (
                      <div key={item.lead} className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{item.lead}</p>
                            <p className="text-white/60 text-sm mt-1">{item.advice}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            {item.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notice d'utilisation - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <GlassCard className="backdrop-blur-xl bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-500/20">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">
                      {locale === 'fr' ? 'Guide d\'utilisation - HubCRM Elite' : 'User Guide - HubCRM Elite'}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {locale === 'fr' ? 'Cliquez pour afficher le guide complet' : 'Click to show the complete guide'}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showGuide ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/60"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">🎯 Pipeline</h4>
                          <p className="text-white/60">
                            {locale === 'fr' 
                              ? 'Gérez vos leads en Kanban ou Table. Glissez-déposez entre les stades. Cliquez sur un lead pour voir ses détails. Utilisez les filtres pour affiner l\'affichage.'
                              : 'Manage leads in Kanban or Table view. Drag & drop between stages. Click on a lead for details. Use filters to refine display.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">💰 Revenus</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Suivez vos revenus par canal et campagne. Calculez le ROAS réel automatiquement. Visualisez l\'historique des transactions.'
                              : 'Track revenue by channel and campaign. Calculate real ROAS automatically. View transaction history.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">⚡ Automations</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Configurez des règles automatiques : assignation, relances, tâches. Activez/désactivez avec le toggle. Consultez les logs d\'exécution.'
                              : 'Set up automatic rules: assignment, follow-ups, tasks. Enable/disable with toggle. Check execution logs.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">📊 Prévisions</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Visualisez les prévisions de revenus. Utilisez le simulateur What-If pour ajuster les probabilités par stade.'
                              : 'View revenue forecasts. Use What-If simulator to adjust probabilities by stage.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">🔍 Enrichissement</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Enrichissez vos leads avec des données complémentaires (SIRET, NAF). Détectez les doublons. Obtenez des conseils IA personnalisés.'
                              : 'Enrich leads with additional data (SIRET, NAF). Detect duplicates. Get personalized AI insights.'}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-purple-400 font-semibold mb-2">🌐 UTMs & Attribution</h4>
                          <p className="text-white/60">
                            {locale === 'fr'
                              ? 'Tracking automatique des UTMs. Attribution first-touch des revenus. Mapping avec les campagnes Meta/Google.'
                              : 'Automatic UTM tracking. First-touch revenue attribution. Mapping with Meta/Google campaigns.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-green-400 text-sm flex items-center gap-2">
                          <span>✨</span>
                          {locale === 'fr'
                            ? 'Astuce : Utilisez Cmd/Ctrl + clic pour sélectionner plusieurs leads à la fois.'
                            : 'Tip: Use Cmd/Ctrl + click to select multiple leads at once.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Lead Details Modal - Fully Editable */}
      <AnimatePresence>
        {showLeadDetails && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowLeadDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editingLead?.contact?.firstName || selectedLead.contact.firstName}
                      onChange={(e) => setEditingLead({
                        ...editingLead || selectedLead,
                        contact: { ...(editingLead || selectedLead).contact, firstName: e.target.value }
                      })}
                      className="text-2xl font-bold bg-transparent border-b border-white/20 text-white focus:border-purple-500 transition-colors outline-none"
                      placeholder={locale === 'fr' ? 'Prénom' : 'First Name'}
                    />
                    <input
                      type="text"
                      value={editingLead?.contact?.lastName || selectedLead.contact.lastName}
                      onChange={(e) => setEditingLead({
                        ...editingLead || selectedLead,
                        contact: { ...(editingLead || selectedLead).contact, lastName: e.target.value }
                      })}
                      className="text-2xl font-bold bg-transparent border-b border-white/20 text-white focus:border-purple-500 transition-colors outline-none"
                      placeholder={locale === 'fr' ? 'Nom' : 'Last Name'}
                    />
                  </div>
                  <input
                    type="text"
                    value={editingLead?.contact?.company || selectedLead.contact.company}
                    onChange={(e) => setEditingLead({
                      ...editingLead || selectedLead,
                      contact: { ...(editingLead || selectedLead).contact, company: e.target.value }
                    })}
                    className="mt-2 bg-transparent border-b border-white/20 text-white/60 focus:border-purple-500 transition-colors outline-none w-full"
                    placeholder={locale === 'fr' ? 'Société' : 'Company'}
                  />
                </div>
                <button 
                  onClick={() => {
                    setShowLeadDetails(false);
                    setEditingLead(null);
                  }}
                  className="text-white/40 hover:text-white ml-4"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">{locale === 'fr' ? 'Informations de Contact' : 'Contact Information'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Email' : 'Email'}</label>
                      <input
                        type="email"
                        value={editingLead?.contact?.email || selectedLead.contact.email}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, email: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Téléphone' : 'Phone'}</label>
                      <input
                        type="tel"
                        value={editingLead?.contact?.phone || selectedLead.contact.phone}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, phone: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Site Web' : 'Website'}</label>
                      <input
                        type="url"
                        value={editingLead?.contact?.website || selectedLead.contact.website || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, website: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Ville' : 'City'}</label>
                      <input
                        type="text"
                        value={editingLead?.contact?.city || selectedLead.contact.city || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, city: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Decision Maker & Assignment */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">{locale === 'fr' ? 'Contact & Assignation' : 'Contact & Assignment'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Nom du Contact' : 'Contact Name'}</label>
                      <input
                        type="text"
                        value={editingLead?.contact?.contactName || selectedLead.contact.contactName || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, contactName: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Poste du Contact' : 'Contact Position'}</label>
                      <input
                        type="text"
                        value={editingLead?.contact?.position || selectedLead.contact.position || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          contact: { ...(editingLead || selectedLead).contact, position: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Décisionnaire' : 'Decision Maker'}</label>
                      <select
                        value={editingLead?.decisionMaker || selectedLead.decisionMaker || 'false'}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          decisionMaker: e.target.value === 'true'
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="false">{locale === 'fr' ? 'Non' : 'No'}</option>
                        <option value="true">{locale === 'fr' ? 'Oui' : 'Yes'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Personne Assignée' : 'Assigned To'}</label>
                      <select
                        value={editingLead?.ownerUserId || selectedLead.ownerUserId}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          ownerUserId: e.target.value
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="user_1">Sarah Martin</option>
                        <option value="user_2">Marc Dupont</option>
                        <option value="user_3">Julie Bernard</option>
                        <option value="user_4">Thomas Petit</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Deal Information */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">{locale === 'fr' ? 'Informations Deal' : 'Deal Information'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Statut' : 'Status'}</label>
                      <select
                        value={editingLead?.stage || selectedLead.stage}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          stage: e.target.value
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="NEW">{locale === 'fr' ? 'Nouveau' : 'New'}</option>
                        <option value="CONTACTED">{locale === 'fr' ? 'Contacté' : 'Contacted'}</option>
                        <option value="QUALIFIED">{locale === 'fr' ? 'Qualifié' : 'Qualified'}</option>
                        <option value="NEGOTIATION">{locale === 'fr' ? 'Négociation' : 'Negotiation'}</option>
                        <option value="WON">{locale === 'fr' ? 'Gagné' : 'Won'}</option>
                        <option value="LOST">{locale === 'fr' ? 'Perdu' : 'Lost'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Valeur' : 'Value'}</label>
                      <input
                        type="number"
                        value={editingLead?.value || selectedLead.value}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          value: parseFloat(e.target.value) || 0
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Source' : 'Source'}</label>
                      <input
                        type="text"
                        value={editingLead?.source || selectedLead.source || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          source: e.target.value
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Ex: Site Web, LinkedIn, etc.' : 'Ex: Website, LinkedIn, etc.'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">{locale === 'fr' ? 'Produit Concerné' : 'Product'}</label>
                      <input
                        type="text"
                        value={editingLead?.product || selectedLead.product || ''}
                        onChange={(e) => setEditingLead({
                          ...editingLead || selectedLead,
                          product: e.target.value
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* UTM & Campaign */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">{locale === 'fr' ? 'Source & Campagne' : 'Source & Campaign'}</h3>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/40 text-xs block mb-1">UTM Source</label>
                        <input
                          type="text"
                          value={editingLead?.utms?.source || selectedLead.utms?.source || ''}
                          onChange={(e) => setEditingLead({
                            ...editingLead || selectedLead,
                            utms: { ...(editingLead || selectedLead).utms, source: e.target.value }
                          })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-purple-500 transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs block mb-1">UTM Medium</label>
                        <input
                          type="text"
                          value={editingLead?.utms?.medium || selectedLead.utms?.medium || ''}
                          onChange={(e) => setEditingLead({
                            ...editingLead || selectedLead,
                            utms: { ...(editingLead || selectedLead).utms, medium: e.target.value }
                          })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-purple-500 transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs block mb-1">UTM Campaign</label>
                        <input
                          type="text"
                          value={editingLead?.utms?.campaign || selectedLead.utms?.campaign || ''}
                          onChange={(e) => setEditingLead({
                            ...editingLead || selectedLead,
                            utms: { ...(editingLead || selectedLead).utms, campaign: e.target.value }
                          })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-purple-500 transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs block mb-1">UTM Content</label>
                        <input
                          type="text"
                          value={editingLead?.utms?.content || selectedLead.utms?.content || ''}
                          onChange={(e) => setEditingLead({
                            ...editingLead || selectedLead,
                            utms: { ...(editingLead || selectedLead).utms, content: e.target.value }
                          })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-purple-500 transition-colors outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">{locale === 'fr' ? 'Notes' : 'Notes'}</h3>
                  <textarea
                    value={editingLead?.notes || selectedLead.notes || ''}
                    onChange={(e) => setEditingLead({
                      ...editingLead || selectedLead,
                      notes: e.target.value
                    })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none resize-none"
                    placeholder={locale === 'fr' ? 'Ajoutez vos notes ici...' : 'Add your notes here...'}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button 
                    variant="gradient" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => {
                      // Save the changes
                      const updatedLead = editingLead || selectedLead;
                      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
                      setEditingLead(null);
                      setShowLeadDetails(false);
                    }}
                  >
                    💾 {locale === 'fr' ? 'Enregistrer' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingLead(null);
                      setShowLeadDetails(false);
                    }}
                  >
                    {locale === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button variant="outline">
                    📞 {locale === 'fr' ? 'Appeler' : 'Call'}
                  </Button>
                  <Button variant="outline">
                    ✉️ {locale === 'fr' ? 'Email' : 'Email'}
                  </Button>
                  <Button variant="outline">
                    ✅ {locale === 'fr' ? 'Créer tâche' : 'Create task'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddLeadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">➕</span>
                  {locale === 'fr' ? 'Ajouter un nouveau lead' : 'Add new lead'}
                </h2>
                <button 
                  onClick={() => setShowAddLeadModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">
                    {locale === 'fr' ? 'Informations de Contact' : 'Contact Information'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Prénom *' : 'First Name *'}
                      </label>
                      <input
                        type="text"
                        value={newLead.contact.firstName}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, firstName: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Jean' : 'John'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Nom *' : 'Last Name *'}
                      </label>
                      <input
                        type="text"
                        value={newLead.contact.lastName}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, lastName: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Dupont' : 'Doe'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Email *' : 'Email *'}
                      </label>
                      <input
                        type="email"
                        value={newLead.contact.email}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, email: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Téléphone' : 'Phone'}
                      </label>
                      <input
                        type="tel"
                        value={newLead.contact.phone}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, phone: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Société *' : 'Company *'}
                      </label>
                      <input
                        type="text"
                        value={newLead.contact.company}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, company: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Nom de la société' : 'Company name'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Site Web' : 'Website'}
                      </label>
                      <input
                        type="url"
                        value={newLead.contact.website}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, website: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">
                    {locale === 'fr' ? 'Détails supplémentaires' : 'Additional Details'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Poste' : 'Position'}
                      </label>
                      <input
                        type="text"
                        value={newLead.contact.position}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, position: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Directeur Marketing' : 'Marketing Director'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Ville' : 'City'}
                      </label>
                      <input
                        type="text"
                        value={newLead.contact.city}
                        onChange={(e) => setNewLead({
                          ...newLead,
                          contact: { ...newLead.contact, city: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Paris' : 'New York'}
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Source' : 'Source'}
                      </label>
                      <select
                        value={newLead.source}
                        onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="Manuel">{locale === 'fr' ? 'Ajout manuel' : 'Manual entry'}</option>
                        <option value="Site Web">Site Web</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Email">Email</option>
                        <option value="Téléphone">{locale === 'fr' ? 'Téléphone' : 'Phone'}</option>
                        <option value="Salon">{locale === 'fr' ? 'Salon/Événement' : 'Trade Show/Event'}</option>
                        <option value="Recommandation">{locale === 'fr' ? 'Recommandation' : 'Referral'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Produit/Service intéressé' : 'Product/Service Interest'}
                      </label>
                      <input
                        type="text"
                        value={newLead.product}
                        onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder={locale === 'fr' ? 'Ex: Marketing Automation' : 'Ex: Marketing Automation'}
                      />
                    </div>
                  </div>
                </div>

                {/* Deal Information */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">
                    {locale === 'fr' ? 'Informations Deal' : 'Deal Information'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Valeur estimée (€)' : 'Estimated Value (€)'}
                      </label>
                      <input
                        type="number"
                        value={newLead.value}
                        onChange={(e) => setNewLead({ ...newLead, value: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Score de qualification (0-10)' : 'Qualification Score (0-10)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={newLead.score}
                        onChange={(e) => setNewLead({ ...newLead, score: parseInt(e.target.value) || 5 })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Étape initiale' : 'Initial Stage'}
                      </label>
                      <select
                        value={newLead.stage}
                        onChange={(e) => setNewLead({ ...newLead, stage: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="NEW">{locale === 'fr' ? 'Nouveau' : 'New'}</option>
                        <option value="CONTACTED">{locale === 'fr' ? 'Contacté' : 'Contacted'}</option>
                        <option value="QUALIFIED">{locale === 'fr' ? 'Qualifié' : 'Qualified'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">
                        {locale === 'fr' ? 'Assigné à' : 'Assigned To'}
                      </label>
                      <select
                        value={newLead.ownerUserId}
                        onChange={(e) => setNewLead({ ...newLead, ownerUserId: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none"
                      >
                        <option value="user_1">Sarah Martin</option>
                        <option value="user_2">Marc Dupont</option>
                        <option value="user_3">Julie Bernard</option>
                        <option value="user_4">Thomas Petit</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newLead.decisionMaker}
                        onChange={(e) => setNewLead({ ...newLead, decisionMaker: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">
                        {locale === 'fr' ? 'Est un décisionnaire' : 'Is a decision maker'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">
                    {locale === 'fr' ? 'Notes' : 'Notes'}
                  </h3>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 transition-colors outline-none resize-none"
                    placeholder={locale === 'fr' ? 'Ajoutez vos notes ici...' : 'Add your notes here...'}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button 
                    variant="gradient" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                    onClick={() => {
                      // Validation basique
                      if (!newLead.contact.firstName || !newLead.contact.lastName || !newLead.contact.email || !newLead.contact.company) {
                        alert(locale === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields');
                        return;
                      }

                      // Ajouter le lead
                      const leadToAdd = {
                        ...newLead,
                        id: Date.now(), // ID temporaire
                        createdAt: new Date().toISOString(),
                        lastActivity: new Date().toISOString(),
                        temperature: 'warm',
                        events: [
                          {
                            type: 'created',
                            timestamp: new Date().toISOString(),
                            description: locale === 'fr' ? 'Lead créé manuellement' : 'Lead created manually'
                          }
                        ]
                      };

                      setLeads(prev => [leadToAdd, ...prev]);
                      setShowAddLeadModal(false);
                      
                      // Reset form
                      setNewLead({
                        contact: {
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          company: '',
                          website: '',
                          city: '',
                          contactName: '',
                          position: ''
                        },
                        stage: 'NEW',
                        value: 0,
                        score: 5,
                        ownerUserId: 'user_1',
                        source: 'Manuel',
                        product: '',
                        notes: '',
                        decisionMaker: false,
                        utms: {
                          source: 'direct',
                          medium: 'manual',
                          campaign: '',
                          content: ''
                        }
                      });

                      // Notification (optionnel)
                      alert(locale === 'fr' ? '✅ Lead ajouté avec succès!' : '✅ Lead added successfully!');
                    }}
                  >
                    💾 {locale === 'fr' ? 'Ajouter le lead' : 'Add lead'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowAddLeadModal(false);
                      // Reset form
                      setNewLead({
                        contact: {
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          company: '',
                          website: '',
                          city: '',
                          contactName: '',
                          position: ''
                        },
                        stage: 'NEW',
                        value: 0,
                        score: 5,
                        ownerUserId: 'user_1',
                        source: 'Manuel',
                        product: '',
                        notes: '',
                        decisionMaker: false,
                        utms: {
                          source: 'direct',
                          medium: 'manual',
                          campaign: '',
                          content: ''
                        }
                      });
                    }}
                  >
                    {locale === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}