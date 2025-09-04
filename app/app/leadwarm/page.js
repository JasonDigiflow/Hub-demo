'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '@/components/ui/Sidebar';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function LeadWarmPage() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showPlaybookEditor, setShowPlaybookEditor] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [showConnectorSetup, setShowConnectorSetup] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [brandMemory, setBrandMemory] = useState({
    tone: 'professional',
    keywords: ['innovation', 'performance', 'résultats'],
    values: ['transparence', 'efficacité', 'créativité']
  });
  
  const [aiConfig, setAiConfig] = useState({
    companyName: '',
    industry: '',
    targetAudience: '',
    mainProduct: '',
    painPoints: [],
    uniqueValue: '',
    competitors: '',
    objectives: [],
    noGoTopics: [],
    setupComplete: false
  });
  
  const [currentSetupStep, setCurrentSetupStep] = useState(0);
  const [trainingMode, setTrainingMode] = useState('config'); // 'config' | 'qa' | 'simulator'
  const [qaExamples, setQaExamples] = useState([]);
  const [currentQaCategory, setCurrentQaCategory] = useState('discovery');
  const [showAddQa, setShowAddQa] = useState(false);
  const [simulatorMessage, setSimulatorMessage] = useState('');
  const [simulatorResponse, setSimulatorResponse] = useState('');

  const tabs = [
    { id: 'conversations', label: locale === 'fr' ? 'Conversations' : 'Conversations', icon: '💬', badge: '12' },
    { id: 'playbooks', label: locale === 'fr' ? 'Playbooks' : 'Playbooks', icon: '📚' },
    { id: 'connectors', label: locale === 'fr' ? 'Connecteurs' : 'Connectors', icon: '🔌' },
    { id: 'analytics', label: locale === 'fr' ? 'Analytiques' : 'Analytics', icon: '📊' },
    { id: 'memory', label: locale === 'fr' ? 'Mémoire' : 'Memory', icon: '🧠' },
    { id: 'calendar', label: locale === 'fr' ? 'Calendrier' : 'Calendar', icon: '📅' },
  ];

  // État des connecteurs
  const [connectorStatus, setConnectorStatus] = useState({
    whatsapp: 'connected',
    email: 'connected',
    sms: 'pending'
  });

  // Mock data pour les conversations
  const [conversations, setConversations] = useState([
    {
      id: 1,
      contact: 'Marie Dupont',
      channel: 'whatsapp',
      lastMessage: 'Merci pour ces informations !',
      timestamp: '10:23',
      unread: 2,
      status: 'active',
      score: 85,
      stage: 'Intéressé',
      playbook: 'Discovery B2B',
      messages: [
        { sender: 'bot', text: 'Bonjour Marie, j\'ai vu que vous cherchez une solution pour automatiser vos processus marketing.', time: '10:15' },
        { sender: 'contact', text: 'Oui exactement ! Pouvez-vous m\'en dire plus ?', time: '10:18' },
        { sender: 'bot', text: 'Bien sûr ! Notre plateforme permet d\'automatiser jusqu\'à 80% de vos tâches répétitives. Voici nos principaux avantages...', time: '10:20' },
        { sender: 'contact', text: 'Merci pour ces informations !', time: '10:23' }
      ]
    },
    {
      id: 2,
      contact: 'Thomas Martin',
      channel: 'email',
      lastMessage: 'Pouvez-vous me faire une démo ?',
      timestamp: '09:45',
      unread: 0,
      status: 'active',
      score: 92,
      stage: 'Décision',
      playbook: 'Demo Request'
    },
    {
      id: 3,
      contact: 'Sophie Bernard',
      channel: 'sms',
      lastMessage: 'OK pour un RDV demain',
      timestamp: 'Hier',
      unread: 0,
      status: 'scheduled',
      score: 78,
      stage: 'Qualification',
      playbook: 'Booking Confirmation'
    }
  ]);

  // Mock data pour les playbooks
  const [playbooks, setPlaybooks] = useState([
    {
      id: 1,
      name: 'Discovery B2B',
      status: 'active',
      conversations: 45,
      conversionRate: 32,
      avgScore: 78,
      steps: [
        { type: 'message', content: 'Bonjour {prenom}, j\'ai vu que...', delay: 0 },
        { type: 'wait', duration: '2h' },
        { type: 'condition', if: 'response', then: 'qualify', else: 'followup' },
        { type: 'score', action: 'increment', value: 10 }
      ],
      channels: ['whatsapp', 'email'],
      triggers: ['form_submission', 'website_visit']
    },
    {
      id: 2,
      name: 'Demo Request',
      status: 'active',
      conversations: 28,
      conversionRate: 68,
      avgScore: 89,
      steps: [
        { type: 'message', content: 'Parfait ! Je peux vous proposer...', delay: 0 },
        { type: 'calendar', action: 'propose_slots' },
        { type: 'sync', target: 'hubcrm', action: 'update_stage' }
      ],
      channels: ['whatsapp', 'email'],
      triggers: ['demo_request', 'high_score']
    },
    {
      id: 3,
      name: 'Nurturing Long',
      status: 'draft',
      conversations: 0,
      conversionRate: 0,
      avgScore: 0,
      steps: [
        { type: 'message', content: 'Contenu de valeur...', delay: '7d' },
        { type: 'message', content: 'Case study...', delay: '14d' },
        { type: 'message', content: 'Offre spéciale...', delay: '30d' }
      ],
      channels: ['email'],
      triggers: ['cold_lead', 'no_response']
    }
  ]);

  // Mock data pour les analytics
  const analyticsData = [
    { date: '01/01', messages: 120, responses: 98, bookings: 12 },
    { date: '02/01', messages: 145, responses: 112, bookings: 18 },
    { date: '03/01', messages: 138, responses: 105, bookings: 15 },
    { date: '04/01', messages: 165, responses: 134, bookings: 22 },
    { date: '05/01', messages: 152, responses: 128, bookings: 19 },
    { date: '06/01', messages: 178, responses: 145, bookings: 25 },
    { date: '07/01', messages: 190, responses: 158, bookings: 28 }
  ];

  // Données de performance par canal
  const channelPerformance = [
    { channel: 'WhatsApp', value: 68, fill: '#25D366' },
    { channel: 'Email', value: 22, fill: '#4285F4' },
    { channel: 'SMS', value: 10, fill: '#FF6B6B' }
  ];

  // Crédits et utilisation
  const [credits, setCredits] = useState({
    available: 4500,
    used: 1500,
    total: 6000
  });

  const renderConversations = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des conversations */}
      <GlassCard className="lg:col-span-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Inbox</h3>
          <select 
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm border border-white/20"
          >
            <option value="all">{locale === 'fr' ? 'Tous' : 'All'}</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="space-y-3">
          {conversations.map(conv => (
            <motion.div
              key={conv.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedConversation?.id === conv.id
                  ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {conv.channel === 'whatsapp' ? '💬' : conv.channel === 'email' ? '✉️' : '📱'}
                  </span>
                  <div>
                    <p className="text-white font-semibold">{conv.contact}</p>
                    <p className="text-white/40 text-xs">{conv.playbook}</p>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {conv.unread}
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm truncate">{conv.lastMessage}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/40 text-xs">{conv.timestamp}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-white/40 text-xs">{conv.score}%</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {conv.stage}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Zone de conversation */}
      <GlassCard className="lg:col-span-2 p-6">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedConversation.contact.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{selectedConversation.contact}</p>
                  <p className="text-white/40 text-sm">Score: {selectedConversation.score}% • {selectedConversation.stage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 transition-all">
                  🔄 {locale === 'fr' ? 'Sync HubCRM' : 'Sync HubCRM'}
                </button>
                <button className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 transition-all">
                  📊 {locale === 'fr' ? 'Détails' : 'Details'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 py-4 overflow-y-auto">
              {selectedConversation.messages?.map((msg, idx) => (
                <div key={idx} className={`mb-4 flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl ${
                    msg.sender === 'bot'
                      ? 'bg-white/10 text-white'
                      : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={locale === 'fr' ? "Tapez votre message..." : "Type your message..."}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/40 border border-white/20 focus:border-orange-500/50 focus:outline-none"
                />
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  📎
                </button>
                <Button variant="gradient" className="bg-gradient-to-r from-orange-600 to-red-600">
                  {locale === 'fr' ? 'Envoyer' : 'Send'}
                </Button>
              </div>
              <p className="text-white/40 text-xs mt-2">
                💰 Coût: 0.2 crédits IA • {locale === 'fr' ? 'Crédits restants' : 'Remaining credits'}: {credits.available}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/40">
            {locale === 'fr' ? 'Sélectionnez une conversation' : 'Select a conversation'}
          </div>
        )}
      </GlassCard>
    </div>
  );

  const renderPlaybooks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          {locale === 'fr' ? 'Playbooks & Scénarios' : 'Playbooks & Scenarios'}
        </h3>
        <Button 
          onClick={() => setShowPlaybookEditor(true)}
          variant="gradient" 
          className="bg-gradient-to-r from-orange-600 to-red-600"
        >
          ➕ {locale === 'fr' ? 'Nouveau Playbook' : 'New Playbook'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <GlassCard key={playbook.id} className="p-6 hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">{playbook.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                playbook.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {playbook.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{locale === 'fr' ? 'Conversations' : 'Conversations'}</span>
                <span className="text-white font-semibold">{playbook.conversations}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{locale === 'fr' ? 'Conversion' : 'Conversion'}</span>
                <span className="text-white font-semibold">{playbook.conversionRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{locale === 'fr' ? 'Score moyen' : 'Avg Score'}</span>
                <span className="text-white font-semibold">{playbook.avgScore}%</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white/60 text-xs mb-2">{locale === 'fr' ? 'Canaux' : 'Channels'}</p>
              <div className="flex items-center gap-2">
                {playbook.channels.includes('whatsapp') && <span>💬</span>}
                {playbook.channels.includes('email') && <span>✉️</span>}
                {playbook.channels.includes('sms') && <span>📱</span>}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2">{locale === 'fr' ? 'Étapes' : 'Steps'}: {playbook.steps.length}</p>
              <Button variant="outline" className="w-full">
                {locale === 'fr' ? 'Éditer' : 'Edit'}
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Éditeur de Playbook */}
      <AnimatePresence>
        {showPlaybookEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {locale === 'fr' ? 'Créer un nouveau Playbook' : 'Create New Playbook'}
              </h3>

              {/* Formulaire du playbook */}
              <div className="space-y-6">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    {locale === 'fr' ? 'Nom du playbook' : 'Playbook Name'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 focus:border-orange-500/50 focus:outline-none"
                    placeholder="Ex: Discovery B2B"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    {locale === 'fr' ? 'Canaux' : 'Channels'}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-white">WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-white">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-white">SMS</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    {locale === 'fr' ? 'Étapes du scénario' : 'Scenario Steps'}
                  </label>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <select className="w-full px-3 py-1 bg-white/10 rounded text-white mb-2">
                        <option>Message</option>
                        <option>Wait</option>
                        <option>Condition</option>
                        <option>Score</option>
                      </select>
                      <textarea
                        className="w-full px-3 py-2 bg-white/10 rounded text-white placeholder-white/40"
                        placeholder={locale === 'fr' ? "Contenu du message..." : "Message content..."}
                        rows={3}
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      ➕ {locale === 'fr' ? 'Ajouter une étape' : 'Add Step'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPlaybookEditor(false)}
                  >
                    {locale === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button variant="gradient" className="bg-gradient-to-r from-orange-600 to-red-600">
                    {locale === 'fr' ? 'Créer le Playbook' : 'Create Playbook'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderConnectors = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">
        {locale === 'fr' ? 'Connecteurs & Intégrations' : 'Connectors & Integrations'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h4 className="text-white font-bold">WhatsApp Business</h4>
                <p className="text-white/40 text-sm">Cloud API</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              connectorStatus.whatsapp === 'connected'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {connectorStatus.whatsapp}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Messages/jour</span>
              <span className="text-white">1,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Fallback</span>
              <span className="text-white">Email</span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            {locale === 'fr' ? 'Configurer' : 'Configure'}
          </Button>
        </GlassCard>

        {/* Email */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <div>
                <h4 className="text-white font-bold">Email SMTP</h4>
                <p className="text-white/40 text-sm">Gmail/Outlook</p>
              </div>
            </div>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
              {connectorStatus.email}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Emails/jour</span>
              <span className="text-white">500</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Fallback</span>
              <span className="text-white">SMS</span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            {locale === 'fr' ? 'Configurer' : 'Configure'}
          </Button>
        </GlassCard>

        {/* SMS */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h4 className="text-white font-bold">SMS</h4>
                <p className="text-white/40 text-sm">Twilio</p>
              </div>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold">
              {connectorStatus.sms}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">SMS/jour</span>
              <span className="text-white">250</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Fallback</span>
              <span className="text-white">-</span>
            </div>
          </div>

          <Button 
            onClick={() => setShowConnectorSetup(true)}
            variant="outline" 
            className="w-full"
          >
            {locale === 'fr' ? 'Configurer' : 'Configure'}
          </Button>
        </GlassCard>
      </div>

      {/* Webhooks et intégrations */}
      <GlassCard className="p-6">
        <h4 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Webhooks & API' : 'Webhooks & API'}
        </h4>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Webhook Entrant</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <code className="text-orange-400 text-sm">
              https://api.leadwarm.io/webhook/inbound/abc123
            </code>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">API Key</span>
              <button className="text-blue-400 text-sm hover:text-blue-300">
                {locale === 'fr' ? 'Régénérer' : 'Regenerate'}
              </button>
            </div>
            <code className="text-orange-400 text-sm">
              lw_live_sk_********************
            </code>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">
        {locale === 'fr' ? 'Analytiques & Performance' : 'Analytics & Performance'}
      </h3>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💬</span>
            <span className="text-green-400 text-sm">+15%</span>
          </div>
          <p className="text-3xl font-bold text-white">3,456</p>
          <p className="text-white/60 text-sm">{locale === 'fr' ? 'Messages envoyés' : 'Messages Sent'}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📈</span>
            <span className="text-green-400 text-sm">+8%</span>
          </div>
          <p className="text-3xl font-bold text-white">78%</p>
          <p className="text-white/60 text-sm">{locale === 'fr' ? 'Taux de réponse' : 'Response Rate'}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-green-400 text-sm">+23%</span>
          </div>
          <p className="text-3xl font-bold text-white">234</p>
          <p className="text-white/60 text-sm">{locale === 'fr' ? 'Leads qualifiés' : 'Qualified Leads'}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📅</span>
            <span className="text-green-400 text-sm">+31%</span>
          </div>
          <p className="text-3xl font-bold text-white">89</p>
          <p className="text-white/60 text-sm">{locale === 'fr' ? 'RDV bookés' : 'Meetings Booked'}</p>
        </GlassCard>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            {locale === 'fr' ? 'Activité sur 7 jours' : '7-Day Activity'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analyticsData}>
              <defs>
                <linearGradient id="gradientMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FB923C" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientResponses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff40" />
              <YAxis stroke="#ffffff40" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="messages" stroke="#FB923C" fillOpacity={1} fill="url(#gradientMessages)" />
              <Area type="monotone" dataKey="responses" stroke="#EF4444" fillOpacity={1} fill="url(#gradientResponses)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            {locale === 'fr' ? 'Répartition par canal' : 'Channel Distribution'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={channelPerformance}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {channelPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {channelPerformance.map((channel) => (
              <div key={channel.channel} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.fill }}></div>
                <span className="text-white/60 text-sm">{channel.channel} ({channel.value}%)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Crédits */}
      <GlassCard className="p-6">
        <h4 className="text-lg font-bold text-white mb-4">
          {locale === 'fr' ? 'Utilisation des crédits IA' : 'AI Credits Usage'}
        </h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">{locale === 'fr' ? 'Crédits utilisés' : 'Credits Used'}</span>
              <span className="text-white font-semibold">{credits.used} / {credits.total}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(credits.used / credits.total) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{locale === 'fr' ? 'Crédits restants' : 'Remaining Credits'}</span>
            <span className="text-white font-bold">{credits.available}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{locale === 'fr' ? 'Coût moyen/conversation' : 'Avg Cost/Conversation'}</span>
            <span className="text-white">0.2 crédits</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  // Catégories de Q&A prédéfinies avec exemples
  const qaCategories = {
    discovery: {
      name: locale === 'fr' ? 'Découverte' : 'Discovery',
      icon: '🔍',
      examples: [
        { 
          question: "Bonjour, qu'est-ce que vous proposez exactement ?",
          response: "Bonjour ! Nous proposons [VOTRE SOLUTION]. En quelques mots, nous aidons les entreprises comme la vôtre à [BÉNÉFICE PRINCIPAL]. Qu'est-ce qui vous amène à chercher ce type de solution aujourd'hui ?",
          category: 'discovery',
          tags: ['intro', 'présentation']
        },
        {
          question: "Comment ça marche votre truc ?",
          response: "C'est très simple ! Notre solution fonctionne en 3 étapes : 1) [ÉTAPE 1], 2) [ÉTAPE 2], 3) [ÉTAPE 3]. La plupart de nos clients voient des résultats dès [DÉLAI]. Voulez-vous que je vous montre un exemple concret ?",
          category: 'discovery',
          tags: ['fonctionnement', 'process']
        },
        {
          question: "C'est pour quel type d'entreprise ?",
          response: "Nous travaillons principalement avec [CIBLE]. Nos meilleurs résultats sont avec des entreprises qui [CRITÈRES]. Dans quel secteur êtes-vous ?",
          category: 'discovery',
          tags: ['ciblage', 'qualification']
        }
      ]
    },
    pricing: {
      name: locale === 'fr' ? 'Prix & Budget' : 'Pricing & Budget',
      icon: '💰',
      examples: [
        {
          question: "C'est combien ?",
          response: "Nos tarifs dépendent de vos besoins spécifiques. En général, nos clients investissent entre [FOURCHETTE]. Pour vous donner un prix précis, j'aurais besoin de comprendre [CRITÈRES]. Quel est votre volume mensuel de [MÉTRIQUE] ?",
          category: 'pricing',
          tags: ['prix', 'direct']
        },
        {
          question: "C'est trop cher pour nous",
          response: "Je comprends votre préoccupation. Beaucoup de nos clients avaient la même réaction au début. Mais quand ils ont vu qu'ils économisaient [ÉCONOMIE] et gagnaient [GAIN], l'investissement était rentabilisé en [DÉLAI]. Qu'est-ce qui serait un budget acceptable pour vous ?",
          category: 'pricing',
          tags: ['objection', 'prix']
        }
      ]
    },
    objections: {
      name: locale === 'fr' ? 'Objections' : 'Objections',
      icon: '🚫',
      examples: [
        {
          question: "On a déjà un prestataire",
          response: "C'est très bien ! Beaucoup de nos meilleurs clients avaient aussi un prestataire avant. Qu'est-ce qui fonctionne bien avec votre solution actuelle ? Et y a-t-il des points d'amélioration que vous aimeriez voir ?",
          category: 'objections',
          tags: ['concurrent', 'existant']
        },
        {
          question: "Je n'ai pas le temps",
          response: "Je comprends totalement, le temps est précieux. Justement, notre solution vous fait gagner [TEMPS] par semaine. Nous avons aussi un accompagnement complet pour la mise en place. Quand seriez-vous plus disponible pour en discuter, même 15 minutes ?",
          category: 'objections',
          tags: ['temps', 'urgence']
        }
      ]
    },
    qualification: {
      name: locale === 'fr' ? 'Qualification' : 'Qualification',
      icon: '✅',
      examples: [
        {
          question: "Qui êtes-vous ?",
          response: "Je suis [NOM], de [ENTREPRISE]. Nous aidons les entreprises comme la vôtre à [BÉNÉFICE]. J'ai vu que vous [TRIGGER]. C'est bien le cas ?",
          category: 'qualification',
          tags: ['présentation', 'personnelle']
        }
      ]
    },
    closing: {
      name: locale === 'fr' ? 'Closing' : 'Closing',
      icon: '🎯',
      examples: [
        {
          question: "OK je suis intéressé, quelle est la suite ?",
          response: "Parfait ! La prochaine étape est simple : 1) On planifie une démo personnalisée de 30min, 2) Je vous prépare une proposition sur-mesure, 3) Si ça vous convient, on peut démarrer sous 48h. Quel créneau vous conviendrait cette semaine ?",
          category: 'closing',
          tags: ['intérêt', 'suite']
        }
      ]
    },
    support: {
      name: locale === 'fr' ? 'Support' : 'Support',
      icon: '🛠️',
      examples: [
        {
          question: "J'ai un problème avec mon compte",
          response: "Je suis désolé que vous rencontriez ce problème. Je vais vous aider immédiatement. Pouvez-vous me dire : 1) Quel est votre email de compte ? 2) Quel est le problème exact ? 3) Depuis quand ça se produit ?",
          category: 'support',
          tags: ['problème', 'aide']
        }
      ]
    }
  };

  // Fonction pour générer des exemples de Q&A par défaut
  const generateDefaultQaExamples = () => {
    const defaultExamples = [];
    
    // On génère une liste complète d'exemples
    const questionsTemplates = [
      // Discovery (20 questions)
      { q: "Qui êtes-vous ?", r: "Réponse personnalisée sur l'entreprise", cat: 'discovery' },
      { q: "Comment avez-vous eu mon contact ?", r: "Réponse sur la source du lead", cat: 'discovery' },
      { q: "Pourquoi me contactez-vous ?", r: "Réponse sur la raison du contact", cat: 'discovery' },
      { q: "Qu'est-ce que vous vendez ?", r: "Présentation claire du produit/service", cat: 'discovery' },
      { q: "En quoi êtes-vous différent ?", r: "USP et différenciation", cat: 'discovery' },
      { q: "Avez-vous des références clients ?", r: "Cas clients et témoignages", cat: 'discovery' },
      { q: "Depuis quand existez-vous ?", r: "Histoire et expérience de l'entreprise", cat: 'discovery' },
      { q: "Où êtes-vous basés ?", r: "Localisation et présence", cat: 'discovery' },
      { q: "Quelle est la taille de votre entreprise ?", r: "Taille et capacités", cat: 'discovery' },
      { q: "Travaillez-vous avec des entreprises comme la nôtre ?", r: "Expérience sectorielle", cat: 'discovery' },
      
      // Pricing (15 questions)
      { q: "Y a-t-il des frais cachés ?", r: "Transparence sur les coûts", cat: 'pricing' },
      { q: "Proposez-vous des essais gratuits ?", r: "Options d'essai", cat: 'pricing' },
      { q: "Avez-vous des réductions ?", r: "Politique de remises", cat: 'pricing' },
      { q: "Comment se passe la facturation ?", r: "Process de facturation", cat: 'pricing' },
      { q: "Puis-je annuler à tout moment ?", r: "Conditions d'annulation", cat: 'pricing' },
      { q: "Y a-t-il un engagement minimum ?", r: "Durée d'engagement", cat: 'pricing' },
      { q: "Acceptez-vous les paiements échelonnés ?", r: "Options de paiement", cat: 'pricing' },
      { q: "Quel est le ROI attendu ?", r: "Retour sur investissement", cat: 'pricing' },
      
      // Objections (20 questions)
      { q: "Je n'ai pas de budget", r: "Gérer l'objection budget", cat: 'objections' },
      { q: "Ce n'est pas le bon moment", r: "Gérer l'objection timing", cat: 'objections' },
      { q: "Je dois en parler à mon associé", r: "Gérer les décideurs multiples", cat: 'objections' },
      { q: "Je ne suis pas convaincu", r: "Renforcer la proposition de valeur", cat: 'objections' },
      { q: "C'est trop compliqué", r: "Simplifier la proposition", cat: 'objections' },
      { q: "On n'a pas besoin de ça", r: "Créer le besoin", cat: 'objections' },
      { q: "On fait déjà ça en interne", r: "Valeur vs interne", cat: 'objections' },
      { q: "J'ai eu une mauvaise expérience avant", r: "Rassurer sur la différence", cat: 'objections' },
      
      // Qualification (15 questions)
      { q: "Quels sont vos besoins exactement ?", r: "Questions de qualification", cat: 'qualification' },
      { q: "Quel est votre budget ?", r: "Qualifier le budget", cat: 'qualification' },
      { q: "Qui prend les décisions ?", r: "Identifier le décideur", cat: 'qualification' },
      { q: "Quand voulez-vous commencer ?", r: "Timeline du prospect", cat: 'qualification' },
      { q: "Combien d'utilisateurs ?", r: "Dimensionnement", cat: 'qualification' },
      
      // Closing (10 questions)
      { q: "Comment on procède ?", r: "Process de closing", cat: 'closing' },
      { q: "Quelles sont les étapes ?", r: "Étapes suivantes", cat: 'closing' },
      { q: "Combien de temps pour démarrer ?", r: "Délai de mise en place", cat: 'closing' },
      { q: "Qui sera mon interlocuteur ?", r: "Point de contact", cat: 'closing' },
      
      // Support (10 questions)
      { q: "Comment fonctionne le support ?", r: "Organisation du support", cat: 'support' },
      { q: "Avez-vous une documentation ?", r: "Ressources disponibles", cat: 'support' },
      { q: "Proposez-vous des formations ?", r: "Options de formation", cat: 'support' },
      { q: "Quel est le SLA ?", r: "Niveau de service", cat: 'support' }
    ];

    return questionsTemplates;
  };

  const renderMemory = () => {
    // Mode d'entraînement : Config, Q&A ou Simulator
    if (trainingMode === 'qa') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {locale === 'fr' ? "Entraînement Q&A de l'IA" : "AI Q&A Training"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                {qaExamples.length + Object.values(qaCategories).reduce((sum, cat) => sum + cat.examples.length, 0)} Q&A
              </span>
              <Button 
                variant="outline"
                onClick={() => setTrainingMode('config')}
              >
                {locale === 'fr' ? '← Retour' : '← Back'}
              </Button>
            </div>
          </div>

          {/* Tabs pour les catégories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Object.entries(qaCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setCurrentQaCategory(key)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentQaCategory === key
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="px-2 py-0.5 bg-black/20 rounded-full text-xs">
                  {category.examples.length + qaExamples.filter(qa => qa.category === key).length}
                </span>
              </button>
            ))}
          </div>

          {/* Bouton d'ajout */}
          <Button
            onClick={() => setShowAddQa(true)}
            variant="gradient"
            className="bg-gradient-to-r from-orange-600 to-red-600 w-full"
          >
            ➕ {locale === 'fr' ? 'Ajouter une Q&A' : 'Add Q&A'}
          </Button>

          {/* Liste des Q&A */}
          <div className="grid grid-cols-1 gap-4">
            {/* Q&A prédéfinies */}
            {qaCategories[currentQaCategory]?.examples.map((qa, idx) => (
              <GlassCard key={`preset-${idx}`} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                    {locale === 'fr' ? 'Prédéfini' : 'Preset'}
                  </span>
                  <div className="flex items-center gap-2">
                    {qa.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Question client' : 'Customer question'}</p>
                    <p className="text-white bg-white/5 rounded-lg p-3">{qa.question}</p>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Réponse IA suggérée' : 'AI suggested response'}</p>
                    <p className="text-green-400 bg-green-400/10 rounded-lg p-3">{qa.response}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    {locale === 'fr' ? 'Personnaliser' : 'Customize'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400">
                    {locale === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              </GlassCard>
            ))}

            {/* Q&A personnalisées */}
            {qaExamples.filter(qa => qa.category === currentQaCategory).map((qa, idx) => (
              <GlassCard key={`custom-${idx}`} className="p-4 border-green-500/20">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    {locale === 'fr' ? 'Personnalisé' : 'Custom'}
                  </span>
                  <div className="flex items-center gap-2">
                    {qa.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Question client' : 'Customer question'}</p>
                    <p className="text-white bg-white/5 rounded-lg p-3">{qa.question}</p>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Votre réponse' : 'Your response'}</p>
                    <p className="text-green-400 bg-green-400/10 rounded-lg p-3">{qa.response}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    {locale === 'fr' ? 'Éditer' : 'Edit'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400">
                    {locale === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Modal d'ajout de Q&A */}
          <AnimatePresence>
            {showAddQa && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    {locale === 'fr' ? 'Ajouter une Question-Réponse' : 'Add Question-Answer'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        {locale === 'fr' ? 'Catégorie' : 'Category'}
                      </label>
                      <select className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20">
                        {Object.entries(qaCategories).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        {locale === 'fr' ? 'Question du client' : 'Customer Question'}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40"
                        rows={2}
                        placeholder={locale === 'fr' ? "Ex: Comment ça marche ?" : "Ex: How does it work?"}
                      />
                    </div>

                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        {locale === 'fr' ? 'Réponse souhaitée' : 'Desired Response'}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40"
                        rows={4}
                        placeholder={locale === 'fr' ? "La réponse que l'IA devrait donner..." : "The response AI should give..."}
                      />
                    </div>

                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        Tags (optionnel)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40"
                        placeholder={locale === 'fr' ? "prix, objection, technique..." : "price, objection, technical..."}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddQa(false)}
                    >
                      {locale === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                      variant="gradient"
                      className="bg-gradient-to-r from-orange-600 to-red-600"
                      onClick={() => {
                        // Ajouter la Q&A
                        setShowAddQa(false);
                      }}
                    >
                      {locale === 'fr' ? 'Ajouter' : 'Add'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Mode simulateur
    if (trainingMode === 'simulator') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {locale === 'fr' ? 'Simulateur de Conversation' : 'Conversation Simulator'}
            </h3>
            <Button 
              variant="outline"
              onClick={() => setTrainingMode('config')}
            >
              {locale === 'fr' ? '← Retour' : '← Back'}
            </Button>
          </div>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h4 className="text-white font-bold">
                  {locale === 'fr' ? "Testez les réponses de votre IA" : "Test your AI responses"}
                </h4>
                <p className="text-white/60 text-sm">
                  {locale === 'fr' 
                    ? "Envoyez un message comme si vous étiez un client"
                    : "Send a message as if you were a customer"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Zone de conversation */}
              <div className="h-96 bg-black/20 rounded-lg p-4 overflow-y-auto">
                {simulatorMessage && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="max-w-[70%] p-3 bg-blue-600 rounded-xl">
                        <p className="text-white text-sm">{simulatorMessage}</p>
                      </div>
                    </div>
                    {simulatorResponse && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] p-3 bg-white/10 rounded-xl">
                          <p className="text-white text-sm">{simulatorResponse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={simulatorMessage}
                  onChange={(e) => setSimulatorMessage(e.target.value)}
                  placeholder={locale === 'fr' ? "Tapez un message client..." : "Type a customer message..."}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Simuler la réponse IA
                      setSimulatorResponse(locale === 'fr' 
                        ? "Voici une réponse basée sur votre configuration..."
                        : "Here's a response based on your configuration...");
                    }
                  }}
                />
                <Button
                  variant="gradient"
                  className="bg-gradient-to-r from-orange-600 to-red-600"
                  onClick={() => {
                    // Simuler la réponse IA
                    setSimulatorResponse(locale === 'fr' 
                      ? "Voici une réponse basée sur votre configuration..."
                      : "Here's a response based on your configuration...");
                  }}
                >
                  {locale === 'fr' ? 'Tester' : 'Test'}
                </Button>
              </div>

              {/* Analyse de la réponse */}
              {simulatorResponse && (
                <GlassCard className="p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
                  <h5 className="text-white font-bold mb-2">
                    {locale === 'fr' ? 'Analyse de la réponse' : 'Response Analysis'}
                  </h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">{locale === 'fr' ? 'Ton' : 'Tone'}</p>
                      <p className="text-white">✅ Professionnel</p>
                    </div>
                    <div>
                      <p className="text-white/60">{locale === 'fr' ? 'Pertinence' : 'Relevance'}</p>
                      <p className="text-white">⭐ 92%</p>
                    </div>
                    <div>
                      <p className="text-white/60">{locale === 'fr' ? 'Action' : 'Action'}</p>
                      <p className="text-white">📅 Propose RDV</p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </GlassCard>
        </div>
      );
    }

    // Mode configuration par défaut
    // Questions de configuration IA
    const setupQuestions = [
      {
        id: 'company',
        title: locale === 'fr' ? "Parlons de votre entreprise" : "Tell us about your company",
        questions: [
          {
            label: locale === 'fr' ? "Nom de votre entreprise" : "Company Name",
            field: 'companyName',
            type: 'text',
            placeholder: 'DigiFlow Agency'
          },
          {
            label: locale === 'fr' ? "Secteur d'activité" : "Industry",
            field: 'industry',
            type: 'select',
            options: ['Tech/SaaS', 'E-commerce', 'Services B2B', 'Services B2C', 'Finance', 'Santé', 'Education', 'Autre']
          },
          {
            label: locale === 'fr' ? "Votre produit/service principal" : "Main Product/Service",
            field: 'mainProduct',
            type: 'textarea',
            placeholder: locale === 'fr' ? "Décrivez en 2-3 phrases votre offre principale" : "Describe your main offering in 2-3 sentences"
          }
        ]
      },
      {
        id: 'audience',
        title: locale === 'fr' ? "Votre audience cible" : "Your Target Audience",
        questions: [
          {
            label: locale === 'fr' ? "Qui sont vos clients idéaux ?" : "Who are your ideal customers?",
            field: 'targetAudience',
            type: 'textarea',
            placeholder: locale === 'fr' ? "Ex: PME de 10-50 employés dans le secteur tech" : "Ex: SMBs with 10-50 employees in tech"
          },
          {
            label: locale === 'fr' ? "Leurs principaux problèmes" : "Their Main Pain Points",
            field: 'painPoints',
            type: 'tags',
            placeholder: locale === 'fr' ? "Ajoutez les problèmes que vous résolvez" : "Add problems you solve"
          }
        ]
      },
      {
        id: 'positioning',
        title: locale === 'fr' ? "Votre positionnement" : "Your Positioning",
        questions: [
          {
            label: locale === 'fr' ? "Qu'est-ce qui vous rend unique ?" : "What makes you unique?",
            field: 'uniqueValue',
            type: 'textarea',
            placeholder: locale === 'fr' ? "Votre proposition de valeur unique" : "Your unique value proposition"
          },
          {
            label: locale === 'fr' ? "Vos principaux concurrents" : "Main Competitors",
            field: 'competitors',
            type: 'text',
            placeholder: locale === 'fr' ? "Listez 2-3 concurrents" : "List 2-3 competitors"
          }
        ]
      },
      {
        id: 'objectives',
        title: locale === 'fr' ? "Vos objectifs" : "Your Objectives",
        questions: [
          {
            label: locale === 'fr' ? "Objectifs de conversation" : "Conversation Goals",
            field: 'objectives',
            type: 'checkboxes',
            options: [
              locale === 'fr' ? 'Qualifier les leads' : 'Qualify leads',
              locale === 'fr' ? 'Prendre des RDV' : 'Book meetings',
              locale === 'fr' ? 'Éduquer sur le produit' : 'Product education',
              locale === 'fr' ? 'Support client' : 'Customer support',
              locale === 'fr' ? 'Collecter des feedbacks' : 'Collect feedback'
            ]
          },
          {
            label: locale === 'fr' ? "Sujets à éviter" : "Topics to Avoid",
            field: 'noGoTopics',
            type: 'tags',
            placeholder: locale === 'fr' ? "Ex: prix, politique, religion..." : "Ex: pricing, politics, religion..."
          }
        ]
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {locale === 'fr' ? 'Mémoire de Marque & Configuration IA' : 'Brand Memory & AI Configuration'}
          </h3>
          {aiConfig.setupComplete && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
              ✓ {locale === 'fr' ? 'Configuration complète' : 'Setup Complete'}
            </span>
          )}
        </div>

        {/* Sélection du mode d'entraînement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard 
            className={`p-6 cursor-pointer transition-all ${
              trainingMode === 'config' 
                ? 'border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-red-900/20' 
                : 'hover:border-white/20'
            }`}
            onClick={() => setTrainingMode('config')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h4 className="text-white font-bold">{locale === 'fr' ? 'Configuration' : 'Configuration'}</h4>
            </div>
            <p className="text-white/60 text-sm">
              {locale === 'fr' 
                ? "Paramétrez les informations de base de votre entreprise"
                : "Set up your company's basic information"}
            </p>
            {aiConfig.setupComplete && (
              <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                ✓ {locale === 'fr' ? 'Complété' : 'Complete'}
              </span>
            )}
          </GlassCard>

          <GlassCard 
            className={`p-6 cursor-pointer transition-all ${
              trainingMode === 'qa' 
                ? 'border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-red-900/20' 
                : 'hover:border-white/20'
            }`}
            onClick={() => setTrainingMode('qa')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="text-white font-bold">{locale === 'fr' ? 'Q&A Training' : 'Q&A Training'}</h4>
            </div>
            <p className="text-white/60 text-sm">
              {locale === 'fr' 
                ? "Entraînez l'IA avec vos exemples de conversations"
                : "Train AI with your conversation examples"}
            </p>
            <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              {qaExamples.length + Object.values(qaCategories).reduce((sum, cat) => sum + cat.examples.length, 0)} Q&A
            </span>
          </GlassCard>

          <GlassCard 
            className={`p-6 cursor-pointer transition-all ${
              trainingMode === 'simulator' 
                ? 'border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-red-900/20' 
                : 'hover:border-white/20'
            }`}
            onClick={() => setTrainingMode('simulator')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-white font-bold">{locale === 'fr' ? 'Simulateur' : 'Simulator'}</h4>
            </div>
            <p className="text-white/60 text-sm">
              {locale === 'fr' 
                ? "Testez les réponses de votre IA en temps réel"
                : "Test your AI responses in real-time"}
            </p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
              {locale === 'fr' ? 'Mode test' : 'Test mode'}
            </span>
          </GlassCard>
        </div>

        {/* Assistant de configuration IA */}
        {trainingMode === 'config' && !aiConfig.setupComplete && (
          <GlassCard className="p-8 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">
                  {locale === 'fr' ? "Configuration de l'IA Conversationnelle" : "Conversational AI Setup"}
                </h4>
                <p className="text-white/60">
                  {locale === 'fr' 
                    ? "Répondez à ces questions pour personnaliser votre IA"
                    : "Answer these questions to personalize your AI"}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">
                  {locale === 'fr' ? 'Étape' : 'Step'} {currentSetupStep + 1} / {setupQuestions.length}
                </span>
                <span className="text-white/60 text-sm">
                  {Math.round(((currentSetupStep + 1) / setupQuestions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSetupStep + 1) / setupQuestions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Current step questions */}
            <div className="space-y-6">
              <h5 className="text-lg font-bold text-white">
                {setupQuestions[currentSetupStep].title}
              </h5>
              
              {setupQuestions[currentSetupStep].questions.map((question) => (
                <div key={question.field}>
                  <label className="text-white/80 text-sm mb-2 block">
                    {question.label}
                  </label>
                  
                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={aiConfig[question.field] || ''}
                      onChange={(e) => setAiConfig({...aiConfig, [question.field]: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40 focus:border-orange-500/50 focus:outline-none"
                      placeholder={question.placeholder}
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea
                      value={aiConfig[question.field] || ''}
                      onChange={(e) => setAiConfig({...aiConfig, [question.field]: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40 focus:border-orange-500/50 focus:outline-none"
                      placeholder={question.placeholder}
                      rows={3}
                    />
                  )}
                  
                  {question.type === 'select' && (
                    <select
                      value={aiConfig[question.field] || ''}
                      onChange={(e) => setAiConfig({...aiConfig, [question.field]: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 focus:border-orange-500/50 focus:outline-none"
                    >
                      <option value="">{locale === 'fr' ? 'Sélectionnez...' : 'Select...'}</option>
                      {question.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {question.type === 'tags' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(aiConfig[question.field] || []).map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-2">
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = [...aiConfig[question.field]];
                                newTags.splice(idx, 1);
                                setAiConfig({...aiConfig, [question.field]: newTags});
                              }}
                              className="text-orange-400 hover:text-red-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={question.placeholder}
                        className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20 placeholder-white/40"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.target.value.trim();
                            if (value) {
                              setAiConfig({
                                ...aiConfig,
                                [question.field]: [...(aiConfig[question.field] || []), value]
                              });
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {question.type === 'checkboxes' && (
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(aiConfig[question.field] || []).includes(option)}
                            onChange={(e) => {
                              const current = aiConfig[question.field] || [];
                              if (e.target.checked) {
                                setAiConfig({...aiConfig, [question.field]: [...current, option]});
                              } else {
                                setAiConfig({...aiConfig, [question.field]: current.filter(o => o !== option)});
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-white/80">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentSetupStep(Math.max(0, currentSetupStep - 1))}
                disabled={currentSetupStep === 0}
              >
                {locale === 'fr' ? '← Précédent' : '← Previous'}
              </Button>
              
              {currentSetupStep < setupQuestions.length - 1 ? (
                <Button
                  variant="gradient"
                  className="bg-gradient-to-r from-orange-600 to-red-600"
                  onClick={() => setCurrentSetupStep(currentSetupStep + 1)}
                >
                  {locale === 'fr' ? 'Suivant →' : 'Next →'}
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                  onClick={() => setAiConfig({...aiConfig, setupComplete: true})}
                >
                  {locale === 'fr' ? '✓ Terminer la configuration' : '✓ Complete Setup'}
                </Button>
              )}
            </div>
          </GlassCard>
        )}

        {/* Configuration existante (affichée après setup) */}
        {aiConfig.setupComplete && (
          <>
            {/* Résumé de la configuration */}
            <GlassCard className="p-6 bg-gradient-to-br from-green-900/10 to-emerald-900/10 border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  {locale === 'fr' ? 'Configuration IA Active' : 'AI Configuration Active'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAiConfig({...aiConfig, setupComplete: false});
                    setCurrentSetupStep(0);
                  }}
                >
                  {locale === 'fr' ? 'Reconfigurer' : 'Reconfigure'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Entreprise' : 'Company'}</p>
                  <p className="text-white font-semibold">{aiConfig.companyName}</p>
                  <p className="text-white/60 text-sm">{aiConfig.industry}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Audience' : 'Audience'}</p>
                  <p className="text-white text-sm">{aiConfig.targetAudience}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">{locale === 'fr' ? 'Objectifs' : 'Objectives'}</p>
                  <p className="text-white text-sm">{(aiConfig.objectives || []).length} actifs</p>
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ton et style */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-bold text-white mb-4">
                  {locale === 'fr' ? 'Ton & Style' : 'Tone & Style'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      {locale === 'fr' ? 'Ton de communication' : 'Communication Tone'}
                    </label>
                    <select 
                      value={brandMemory.tone}
                      onChange={(e) => setBrandMemory({...brandMemory, tone: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg text-white border border-white/20"
                    >
                      <option value="professional">Professionnel</option>
                      <option value="friendly">Amical</option>
                      <option value="casual">Décontracté</option>
                      <option value="formal">Formel</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      {locale === 'fr' ? 'Mots-clés de marque' : 'Brand Keywords'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {brandMemory.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                      <button className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-sm hover:bg-white/20">
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Valeurs et USP */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-bold text-white mb-4">
                  {locale === 'fr' ? 'Valeurs & USP' : 'Values & USP'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      {locale === 'fr' ? 'Valeurs principales' : 'Core Values'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {brandMemory.values.map((value, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      {locale === 'fr' ? 'Proposition unique' : 'Unique Proposition'}
                    </label>
                    <p className="text-white text-sm">{aiConfig.uniqueValue}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Templates personnalisés */}
            <GlassCard className="p-6">
              <h4 className="text-lg font-bold text-white mb-4">
                {locale === 'fr' ? 'Templates Personnalisés' : 'Custom Templates'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h5 className="text-white font-semibold mb-2">Introduction Produit</h5>
                  <p className="text-white/60 text-sm mb-3">
                    Bonjour {'{prenom}'}, j'ai remarqué que votre entreprise...
                  </p>
                  <Button variant="outline" size="sm">
                    {locale === 'fr' ? 'Éditer' : 'Edit'}
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h5 className="text-white font-semibold mb-2">Suivi Intérêt</h5>
                  <p className="text-white/60 text-sm mb-3">
                    Merci pour votre intérêt ! Notre solution peut...
                  </p>
                  <Button variant="outline" size="sm">
                    {locale === 'fr' ? 'Éditer' : 'Edit'}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">
        {locale === 'fr' ? 'Calendrier & RDV' : 'Calendar & Meetings'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            {locale === 'fr' ? 'Disponibilités' : 'Availability'}
          </h4>
          {/* Calendrier simplifié */}
          <div className="grid grid-cols-7 gap-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
              <div key={idx} className="text-center text-white/60 text-sm py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                  i % 7 === 5 || i % 7 === 6
                    ? 'bg-white/5 text-white/40'
                    : 'bg-white/10 text-white hover:bg-orange-500/20'
                }`}
              >
                {i + 1 <= 31 ? i + 1 : ''}
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <h4 className="text-lg font-bold text-white mb-4">
              {locale === 'fr' ? 'Prochains RDV' : 'Upcoming Meetings'}
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white font-semibold">Marie Dupont</p>
                <p className="text-white/60 text-sm">Demain 14:00</p>
                <p className="text-blue-400 text-sm">Zoom</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white font-semibold">Thomas Martin</p>
                <p className="text-white/60 text-sm">Jeudi 10:30</p>
                <p className="text-green-400 text-sm">Google Meet</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-lg font-bold text-white mb-4">
              {locale === 'fr' ? 'Intégrations' : 'Integrations'}
            </h4>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-white">Google Calendar</p>
                    <p className="text-green-400 text-sm">Connecté</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <p className="text-white">Calendly</p>
                    <p className="text-white/40 text-sm">Non connecté</p>
                  </div>
                </div>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        moduleIcon="🔥"
        moduleName="LeadWarm"
      />
      
      <div className="min-h-screen relative overflow-hidden pl-72">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
              LeadWarm
            </h1>
            <p className="text-white/70 mt-2">
              {locale === 'fr' ? 'IA conversationnelle multi-canal pour qualifier vos leads' : 'Multi-channel conversational AI to qualify your leads'}
            </p>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'conversations' && (
              <motion.div
                key="conversations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderConversations()}
              </motion.div>
            )}

            {activeTab === 'playbooks' && (
              <motion.div
                key="playbooks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderPlaybooks()}
              </motion.div>
            )}

            {activeTab === 'connectors' && (
              <motion.div
                key="connectors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderConnectors()}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderAnalytics()}
              </motion.div>
            )}

            {activeTab === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderMemory()}
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderCalendar()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}