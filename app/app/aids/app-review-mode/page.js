'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoData, getRealtimeMetrics, generateNewLead } from '@/lib/demo-data/aids-demo';

export default function AppReviewMode() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [leads, setLeads] = useState(demoData.leads);
  const [metrics, setMetrics] = useState(demoData.campaigns[0]);
  const [showNotification, setShowNotification] = useState(false);

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getRealtimeMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simuler l'arrivée de nouveaux leads
  useEffect(() => {
    const interval = setInterval(() => {
      const newLead = generateNewLead();
      setLeads(prev => [newLead, ...prev]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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
              AIDs - Mode App Review
            </h1>
            <p className="text-sm text-gray-400">Démonstration des permissions Facebook</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
              Connecté: DigiFlow Agency
            </span>
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
              Mode Démo Actif
            </span>
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
            className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            🎉 Nouveau lead reçu !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Section - ads_read */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Tableau de Bord (ads_read)</h2>
            
            {/* Métriques en temps réel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Budget Dépensé"
                value={`${metrics.spent.toLocaleString()} €`}
                change="+12%"
                color="blue"
              />
              <MetricCard
                title="Impressions"
                value={metrics.impressions.toLocaleString()}
                change="+8%"
                color="green"
              />
              <MetricCard
                title="Clics"
                value={metrics.clicks.toLocaleString()}
                change="+15%"
                color="purple"
              />
              <MetricCard
                title="Conversions"
                value={metrics.conversions}
                change="+22%"
                color="pink"
              />
            </div>

            {/* Graphique de performance */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Performance sur 7 jours</h3>
              <div className="h-64 flex items-end gap-2">
                {demoData.insights.performance.daily.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                      style={{ height: `${(day.clicks / 700) * 100}%` }}
                    />
                    <span className="text-xs mt-2">{day.date.split('-')[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Section - ads_management */}
        {activeSection === 'campaigns' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Gestion des Campagnes (ads_management)</h2>
            
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold">
              + Créer une nouvelle campagne
            </button>

            <div className="space-y-4">
              {demoData.campaigns.map(campaign => (
                <div key={campaign.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        campaign.status === 'ACTIVE' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                        Modifier
                      </button>
                      <button className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">
                        Dupliquer
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <p className="font-bold">{campaign.budget} €</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dépensé:</span>
                      <p className="font-bold">{campaign.spent} €</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CTR:</span>
                      <p className="font-bold">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversions:</span>
                      <p className="font-bold">{campaign.conversions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Section - leads_retrieval */}
        {activeSection === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Centre de Prospects (leads_retrieval)</h2>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
                🔄 Synchroniser Meta Leads
              </button>
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
                  {leads.slice(0, 10).map(lead => (
                    <tr key={lead.id} className="border-t border-gray-700">
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
                        <span className="px-2 py-1 bg-blue-600 rounded text-sm">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-purple-400 hover:text-purple-300">
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700">
              Exporter en CSV
            </button>
          </div>
        )}

        {/* Insights Section - read_insights */}
        {activeSection === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Insights Avancés (read_insights)</h2>

            {/* Démographie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Répartition par âge</h3>
                {demoData.insights.demographics.age.map(age => (
                  <div key={age.range} className="flex items-center justify-between mb-2">
                    <span>{age.range} ans</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full"
                          style={{ width: `${age.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{age.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Répartition par genre</h3>
                {demoData.insights.demographics.gender.map(gender => (
                  <div key={gender.type} className="flex items-center justify-between mb-2">
                    <span className="capitalize">{gender.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-4 rounded-full"
                          style={{ width: `${gender.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{gender.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse temporelle */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Meilleurs créneaux horaires</h3>
              <div className="flex items-end gap-2">
                {demoData.insights.timeAnalysis.bestHours.map(hour => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-t"
                      style={{ height: `${hour.performance}px` }}
                    />
                    <span className="text-xs mt-2">{hour.hour}</span>
                  </div>
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
              <h3 className="text-xl font-bold mb-4">Parcours de conversion</h3>
              {demoData.attribution.conversionPaths.map((path, i) => (
                <div key={i} className="mb-4 p-4 bg-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    {path.path.map((step, j) => (
                      <React.Fragment key={j}>
                        <span className="px-3 py-1 bg-purple-600 rounded">
                          {step}
                        </span>
                        {j < path.path.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{path.conversions} conversions</span>
                    <span>{path.value} € de valeur</span>
                    <span>{path.avgDays} jours en moyenne</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Modèle Last Click</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Facebook</span>
                    <span>{demoData.attribution.models.lastClick.facebook}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instagram</span>
                    <span>{demoData.attribution.models.lastClick.instagram}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Modèle Linear</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Facebook</span>
                    <span>{demoData.attribution.models.linear.facebook}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instagram</span>
                    <span>{demoData.attribution.models.linear.instagram}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Section - page_events */}
        {activeSection === 'events' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Tracking Événements (page_events)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoData.events.map(event => (
                <div key={event.type} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-2">{event.type}</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {event.count.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {event.uniqueUsers} utilisateurs uniques
                  </p>
                  {event.avgValue > 0 && (
                    <p className="text-sm text-green-400 mt-2">
                      Valeur moy: {event.avgValue} €
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Entonnoir de conversion</h3>
              <div className="space-y-2">
                {demoData.events.map((event, i) => (
                  <div key={event.type} className="flex items-center gap-4">
                    <span className="w-32">{event.type}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-8">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-8 rounded-full flex items-center justify-end pr-4"
                        style={{ width: `${(event.count / demoData.events[0].count) * 100}%` }}
                      >
                        <span className="text-sm font-bold">
                          {((event.count / demoData.events[0].count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Section - Octavia */}
        {activeSection === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">🤖 IA Octavia - Recommandations</h2>

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-xl font-bold mb-4">Analyse en temps réel par l\'IA</h3>
              <p className="text-gray-300">
                Octavia analyse vos campagnes 24/7 et génère des recommandations personnalisées
                basées sur vos objectifs et performances.
              </p>
            </div>

            <div className="space-y-4">
              {demoData.aiRecommendations.map((rec, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-600">
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
                    <button className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">
                      Appliquer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Chat avec Octavia</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-lg p-3">
                    <p>
                      Bonjour ! Je suis Octavia, votre assistante IA spécialisée en publicité digitale.
                      J\'ai analysé vos campagnes et j\'ai identifié 4 opportunités d\'optimisation.
                      Voulez-vous que je vous les explique ?
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Posez votre question à Octavia..."
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, color }) {
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
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border`}
    >
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-green-400 text-sm mt-1">{change}</div>
    </motion.div>
  );
}