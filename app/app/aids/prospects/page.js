'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [metaConnected, setMetaConnected] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProspects, setFilteredProspects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Facebook',
    campaignId: '',
    campaignName: '',
    adId: '',
    status: 'new',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    checkMetaConnection();
    loadProspects();
  }, []);

  useEffect(() => {
    // Filtrer les prospects basé sur la recherche
    if (searchQuery.trim() === '') {
      setFilteredProspects(prospects);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = prospects.filter(prospect => 
        prospect.name?.toLowerCase().includes(query) ||
        prospect.email?.toLowerCase().includes(query) ||
        prospect.phone?.includes(query) ||
        prospect.company?.toLowerCase().includes(query) ||
        prospect.status?.toLowerCase().includes(query) ||
        prospect.source?.toLowerCase().includes(query)
      );
      setFilteredProspects(filtered);
    }
  }, [searchQuery, prospects]);

  const loadProspects = async () => {
    setLoading(true);
    try {
      // Charger depuis Firebase
      const response = await fetch('/api/aids/prospects');
      const data = await response.json();
      
      console.log('=== LOAD PROSPECTS RESPONSE ===');
      console.log('Success:', data.success);
      console.log('Count:', data.count);
      console.log('Prospects array length:', data.prospects?.length);
      if (data.prospects?.length > 0) {
        console.log('First prospect:', data.prospects[0]);
      }
      
      if (data.success) {
        // Toujours définir les prospects même si vide
        const prospects = data.prospects || [];
        // Filtrer les données agrégées (ne pas les afficher)
        const realProspects = prospects.filter(p => 
          !p.isAggregated && 
          !p.name?.includes('[Données agrégées') &&
          !p.name?.includes('[Données campagne')
        );
        setProspects(realProspects);
        console.log(`Loaded ${realProspects.length} real prospects from Firebase (filtered from ${prospects.length} total)`);
      } else {
        // Fallback to localStorage if Firebase fails
        const savedProspects = localStorage.getItem('aids_prospects');
        if (savedProspects) {
          const localProspects = JSON.parse(savedProspects);
          setProspects(localProspects);
          console.log(`Loaded ${localProspects.length} prospects from localStorage (fallback)`);
          
          // Try to migrate to Firebase
          if (localProspects.length > 0) {
            migrateLocalProspectsToFirebase(localProspects);
          }
        } else {
          setProspects([]);
        }
      }
      
      // Retirer la sync automatique qui cause le rechargement
      // L'utilisateur doit cliquer sur le bouton pour synchroniser
    } catch (error) {
      console.error('Error loading prospects:', error);
      // Fallback to localStorage
      const savedProspects = localStorage.getItem('aids_prospects');
      if (savedProspects) {
        setProspects(JSON.parse(savedProspects));
      } else {
        setProspects([]);
      }
    }
    setLoading(false);
  };

  const migrateLocalProspectsToFirebase = async (localProspects) => {
    try {
      console.log('Migrating local prospects to Firebase...');
      const response = await fetch('/api/aids/prospects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospects: localProspects,
          source: 'localStorage_migration'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`Migrated ${data.imported} prospects to Firebase`);
        // Clear localStorage after successful migration
        localStorage.removeItem('aids_prospects');
      }
    } catch (error) {
      console.error('Error migrating prospects to Firebase:', error);
    }
  };

  const syncMetaLeads = async (showLoading = true, forceSync = false) => {
    if (showLoading) setSyncLoading(true);
    
    try {
      // Utiliser la nouvelle route Lead Center pour récupérer TOUS les leads
      const url = '/api/aids/meta/leadcenter';
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('=== SYNC RESPONSE ===');
      console.log('Success:', data.success);
      console.log('Leads count:', data.leads?.length || 0);
      console.log('Source:', data.source);
      console.log('Message:', data.message);
      if (data.leads && data.leads.length > 0) {
        console.log('First lead:', data.leads[0]);
      }
      
      if (data.success && data.leads && data.leads.length > 0) {
        console.log(`Récupéré ${data.leads.length} leads depuis Meta`);
        
        // Les leads sont maintenant automatiquement sauvegardés dans Firebase par l'API
        const savedCount = data.savedToFirebase || 0;
        const skippedCount = data.skipped || 0;
        const totalCount = data.totalCount || data.leads.length;
        
        if (savedCount > 0) {
          console.log(`✅ ${savedCount} prospects automatiquement sauvegardés dans Firebase`);
        }
        
        // Recharger les prospects depuis Firebase
        await loadProspects();
        
        if (showLoading) {
          let message;
          if (savedCount > 0) {
            message = `✅ ${savedCount} nouveaux prospects importés depuis Meta!\n`;
            if (skippedCount > 0) message += `${skippedCount} déjà existants.\n`;
            message += `\nTotal: ${totalCount} prospects\nSource: ${data.source || 'Meta Ads'}`;
          } else if (totalCount > 0) {
            message = `ℹ️ ${totalCount} prospects récupérés depuis Meta.\n`;
            if (skippedCount > 0) {
              message += `Tous les prospects sont déjà importés.\n${skippedCount} prospects existants.`;
            } else {
              message += `Vérifiez votre centre de prospects.`;
            }
          } else {
            message = `ℹ️ Aucun nouveau prospect à importer.`;
          }
          alert(message);
        }
      } else if (showLoading) {
        alert(`⚠️ ${data.message || 'Aucun lead trouvé dans votre compte Meta.'}\n\nVérifiez que vous avez:\n- Des formulaires de leads configurés\n- Des campagnes actives\n- Les bonnes permissions`);
      }
    } catch (error) {
      console.error('Error syncing Meta leads:', error);
      if (showLoading) {
        alert('❌ Erreur lors de la synchronisation avec Meta.\n\n' + error.message);
      }
    }
    
    if (showLoading) setSyncLoading(false);
  };

  const checkMetaConnection = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      setMetaConnected(data.connected || true); // Toujours activer les boutons pour l'instant
      
      if (data.connected) {
        // Charger les campagnes Meta si connecté
        loadMetaCampaigns();
      }
    } catch (error) {
      console.error('Error checking Meta connection:', error);
      setMetaConnected(true); // En cas d'erreur, activer quand même les boutons
    }
  };

  const loadMetaCampaigns = async () => {
    try {
      // Simuler le chargement des campagnes Meta
      // En production, cela viendrait de l'API Meta
      const demoCampaigns = [
        { id: 'CAM_FB_001', name: 'Campagne Acquisition Q4', platform: 'Facebook' },
        { id: 'CAM_FB_002', name: 'Retargeting Paniers', platform: 'Facebook' },
        { id: 'CAM_FB_003', name: 'Lookalike Clients', platform: 'Facebook' },
        { id: 'CAM_IG_001', name: 'Stories Branding', platform: 'Instagram' },
        { id: 'CAM_IG_002', name: 'Reels Performance', platform: 'Instagram' }
      ];
      setCampaigns(demoCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const prospectData = {
      ...formData,
      id: editingProspect?.id || `PROS${Date.now()}`,
      createdAt: editingProspect?.createdAt || new Date().toISOString()
    };

    try {
      // Sauvegarder dans Firebase
      const url = editingProspect 
        ? `/api/aids/prospects/${editingProspect.id}`
        : '/api/aids/prospects';
      
      const method = editingProspect ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospectData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recharger les prospects depuis Firebase
        await loadProspects();
      } else {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving prospect:', error);
      alert('❌ Erreur lors de la sauvegarde du prospect');
      resetForm();
    }
  };

  const handleEdit = (prospect) => {
    setEditingProspect(prospect);
    setFormData({
      name: prospect.name,
      email: prospect.email || '',
      phone: prospect.phone || '',
      company: prospect.company || '',
      source: prospect.source,
      campaignId: prospect.campaignId,
      campaignName: prospect.campaignName || '',
      adId: prospect.adId || '',
      status: prospect.status,
      notes: prospect.notes || '',
      date: prospect.date
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce prospect ?')) return;

    try {
      const response = await fetch(`/api/aids/prospects/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recharger les prospects depuis Firebase
        await loadProspects();
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting prospect:', error);
      alert('❌ Erreur lors de la suppression du prospect');
    }
  };

  const clearLocalCache = async () => {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer tous les prospects ?\n\nCela supprimera tous les prospects enregistrés dans Firebase.\nVous pourrez les réimporter depuis Meta.')) return;
    
    try {
      // Supprimer tous les prospects un par un (Firebase ne supporte pas la suppression en masse)
      const deletePromises = prospects.map(prospect => 
        fetch(`/api/aids/prospects/${prospect.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Vider aussi localStorage au cas où
      localStorage.removeItem('aids_prospects');
      setProspects([]);
      
      alert('✅ Tous les prospects ont été supprimés avec succès!\n\nCliquez sur "Synchroniser Meta Ads" pour réimporter vos prospects.');
    } catch (error) {
      console.error('Error clearing prospects:', error);
      alert('❌ Erreur lors de la suppression des prospects');
    }
  };

  const handleStatusChange = async (id, newStatus, revenueAmount = null) => {
    try {
      const prospect = prospects.find(p => p.id === id);
      if (!prospect) return;
      
      const updateData = { 
        status: newStatus 
      };
      
      // Si c'est un closing avec montant, on l'ajoute
      if (newStatus === 'closing' && revenueAmount) {
        updateData.revenueAmount = revenueAmount;
        updateData.closingDate = new Date().toISOString();
        updateData.notes = (prospect.notes ? prospect.notes + '\n' : '') + 
          `💰 Closing: ${revenueAmount}€ HT (${new Date().toLocaleDateString('fr-FR')})`;
      }
      
      const response = await fetch(`/api/aids/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Mettre à jour localement pour éviter un rechargement complet
        const updatedProspects = prospects.map(p => 
          p.id === id ? { ...p, ...updateData } : p
        );
        setProspects(updatedProspects);
      }
    } catch (error) {
      console.error('Error updating prospect status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'Facebook',
      campaignId: '',
      campaignName: '',
      adId: '',
      status: 'new',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingProspect(null);
    setShowAddModal(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'qualified': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'closing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'converted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status, prospect = null) => {
    switch(status) {
      case 'new': return 'Nouveau';
      case 'contacted': return 'Contacté';
      case 'qualified': return 'Qualifié';
      case 'closing': 
        if (prospect?.revenueAmount) {
          return `Closing (${prospect.revenueAmount}€ HT)`;
        }
        return 'Closing';
      case 'converted': return 'Converti';
      case 'lost': return 'Perdu';
      default: return status;
    }
  };

  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    qualified: prospects.filter(p => p.status === 'qualified').length,
    converted: prospects.filter(p => p.status === 'converted').length,
    conversionRate: prospects.length > 0 
      ? ((prospects.filter(p => p.status === 'converted').length / prospects.length) * 100).toFixed(1)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Chargement des prospects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centre de Prospects
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez vos prospects issus de vos campagnes publicitaires
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => syncMetaLeads(true, false)}
            disabled={syncLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {syncLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <span className="text-xl">🔄</span>
                Synchroniser Meta Ads
              </>
            )}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-medium flex items-center gap-2"
            >
              <span className="text-xl">⚙️</span>
              Options
            </button>
            
            {showAdvancedOptions && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 z-10 min-w-[200px]">
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        if (confirm('Voulez-vous vraiment forcer la resynchronisation complète?\n\nCela va récupérer TOUS les prospects depuis Meta, même ceux déjà importés.')) {
                          setSyncLoading(true);
                          try {
                            console.log('Forçage de la resynchronisation...');
                            
                            // Utiliser la route Lead Center pour récupérer TOUS les leads
                            const response = await fetch('/api/aids/meta/leadcenter');
                            const data = await response.json();
                            
                            if (data.success) {
                              console.log(`Force sync: ${data.savedToFirebase} saved, ${data.skipped} skipped`);
                              
                              // Recharger les prospects
                              await loadProspects();
                              
                              const message = data.message || `✅ Resynchronisation terminée!\n${data.totalCount} prospects traités.`;
                              alert(message);
                            } else {
                              alert(`❌ Erreur: ${data.error || 'Impossible de récupérer les leads depuis Meta'}`);
                            }
                          } catch (error) {
                            console.error('Error during force sync:', error);
                            alert('❌ Erreur lors de la resynchronisation forcée: ' + error.message);
                          }
                          setSyncLoading(false);
                        }
                      }}
                      disabled={syncLoading}
                      className="w-full text-left px-3 py-2 text-sm text-orange-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🔃</span>
                      Forcer la resynchronisation complète
                    </button>
                    <button
                      onClick={() => {
                        setShowAdvancedOptions(false);
                        clearLocalCache();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🗑️</span>
                      Vider le cache local
                    </button>
                    <div className="border-t border-gray-700 my-2"></div>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        const response = await fetch('/api/aids/meta/debug-leads');
                        const data = await response.json();
                        console.log('=== DEBUG LEADS RESULTS ===');
                        console.log(JSON.stringify(data, null, 2));
                        
                        // Afficher un résumé
                        let summary = '📊 Debug Meta Leads:\n\n';
                        data.tests?.forEach(test => {
                          summary += `${test.success ? '✅' : '❌'} ${test.name}\n`;
                          if (test.count !== undefined) {
                            summary += `   → ${test.count} résultats\n`;
                          }
                          if (test.error) {
                            summary += `   → Erreur: ${test.error}\n`;
                          }
                        });
                        
                        alert(summary + '\n\nDétails complets dans la console (F12)');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-yellow-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🐛</span>
                      Debug Meta Leads
                    </button>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        const response = await fetch('/api/aids/meta/test-leads');
                        const data = await response.json();
                        console.log('=== TEST API RESULTS ===');
                        console.log(JSON.stringify(data, null, 2));
                        alert('Vérifiez la console pour voir les résultats du test API');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🧪</span>
                      Tester l'API Facebook
                    </button>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        setSyncLoading(true);
                        
                        try {
                          console.log('=== TEST LEAD CENTER API ===');
                          const response = await fetch('/api/aids/meta/leadcenter');
                          const data = await response.json();
                          
                          console.log('Lead Center response:', data);
                          
                          if (data.success) {
                            alert(`✅ Lead Center API:\n\n${data.totalCount} prospects trouvés\n${data.savedToFirebase || 0} nouveaux sauvegardés\n${data.skipped || 0} déjà existants\n\nVos prospects devraient maintenant apparaître dans la liste.`);
                            // Recharger les prospects
                            await loadProspects();
                          } else {
                            alert(`❌ Erreur Lead Center:\n${data.error || 'Erreur inconnue'}\n\nDétails: ${data.details || 'Aucun détail'}`);
                          }
                        } catch (error) {
                          console.error('Lead Center error:', error);
                          alert('❌ Erreur: ' + error.message);
                        }
                        
                        setSyncLoading(false);
                      }}
                      disabled={syncLoading}
                      className="w-full text-left px-3 py-2 text-sm text-purple-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🎯</span>
                      Récupérer les 107 prospects du Lead Center
                    </button>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        setSyncLoading(true);
                        
                        try {
                          console.log('=== TEST DIRECT LEADS ===');
                          const response = await fetch('/api/aids/meta/direct-leads');
                          const data = await response.json();
                          
                          console.log('Direct leads response:', data);
                          
                          if (data.success && data.leads && data.leads.length > 0) {
                            // Les leads sont automatiquement sauvegardés dans Firebase par l'API
                            if (data.savedToFirebase && data.savedToFirebase > 0) {
                              console.log(`✅ ${data.savedToFirebase} prospects automatiquement sauvegardés dans Firebase`);
                              // Recharger les prospects depuis Firebase
                              await loadProspects();
                              alert(`✅ ${data.savedToFirebase} nouveaux prospects importés avec succès!\n${data.skipped} déjà existants.\n\n${data.message}`);
                            } else if (data.skipped > 0) {
                              alert(`ℹ️ Tous les prospects sont déjà importés.\n${data.skipped} prospects existants dans Firebase.`);
                            } else {
                              alert(`✅ ${data.leads.length} prospects récupérés.\n\n${data.message}`);
                              // Recharger au cas où
                              await loadProspects();
                            }
                          } else {
                            alert(`❌ Erreur: ${data.message || data.error?.message || 'Impossible de récupérer les leads'}\n\nVérifiez la console pour plus de détails.`);
                            console.error('Direct leads error:', data);
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert('❌ Erreur lors de la récupération directe');
                        }
                        
                        setSyncLoading(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🎯</span>
                      Import direct (106 prospects)
                    </button>
                    <div className="border-t border-gray-700 my-2"></div>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        console.log('Running FULL debug...');
                        const response = await fetch('/api/aids/meta/full-debug');
                        const data = await response.json();
                        
                        console.log('=== FULL DEBUG RESULTS ===');
                        console.log(data);
                        
                        let message = '🔍 DEBUG COMPLET:\n\n';
                        
                        if (data.summary) {
                          message += `📊 RÉSUMÉ:\n`;
                          message += `- Total leads trouvés: ${data.summary.totalLeadsFound}\n`;
                          message += `- Nombre de comptes pub: ${data.summary.totalAdAccounts}\n`;
                          message += `- Compte sélectionné: ${data.summary.currentlySelected || 'AUCUN'}\n\n`;
                          
                          if (data.summary.accountWithMostLeads) {
                            message += `🎯 COMPTE AVEC LE PLUS DE LEADS:\n`;
                            message += `"${data.summary.accountWithMostLeads.name}"\n`;
                            message += `${data.summary.accountWithMostLeads.leads} leads\n`;
                            message += `ID: ${data.summary.accountWithMostLeads.id}\n\n`;
                          }
                        }
                        
                        if (data.recommendations?.length > 0) {
                          message += `💡 RECOMMANDATIONS:\n`;
                          data.recommendations.forEach(rec => {
                            message += `${rec}\n`;
                          });
                        }
                        
                        message += '\n📋 Détails COMPLETS dans la console (F12)';
                        alert(message);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-purple-500 hover:bg-gray-800 rounded flex items-center gap-2 font-bold"
                    >
                      <span>🚨</span>
                      DEBUG ULTIME - Trouve mes 107 prospects!
                    </button>
                    <button
                      onClick={async () => {
                        setShowAdvancedOptions(false);
                        console.log('Running Lead Center diagnostic...');
                        const response = await fetch('/api/aids/meta/test-leadcenter');
                        const data = await response.json();
                        
                        console.log('=== LEAD CENTER DIAGNOSTIC ===');
                        console.log(data);
                        
                        let message = '🔍 Diagnostic Lead Center:\n\n';
                        
                        // Check each test
                        data.tests?.forEach(test => {
                          if (test.test === 'Token Validity') {
                            message += test.valid ? '✅ Token valide\n' : '❌ Token invalide\n';
                          }
                          if (test.test === 'Permissions') {
                            message += test.hasLeadsRetrieval ? '✅ Permission leads_retrieval\n' : '❌ Permission leads_retrieval manquante\n';
                          }
                          if (test.test === 'Lead Forms in Account') {
                            message += `📊 ${test.formsCount} formulaires, ${test.totalLeadsAcrossForms} leads total\n`;
                          }
                          if (test.test === 'Pages and Their Forms') {
                            message += `📄 ${test.totalLeadsAcrossPages} leads dans les pages\n`;
                          }
                        });
                        
                        if (data.recommendations?.length > 0) {
                          message += '\n💡 Recommandations:\n';
                          data.recommendations.forEach(rec => {
                            message += `${rec}\n`;
                          });
                        }
                        
                        message += '\n📋 Détails complets dans la console (F12)';
                        alert(message);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span>🔍</span>
                      Diagnostic: Pourquoi 0 prospects?
                    </button>
                    <div className="px-3 py-2 text-xs text-gray-500 mt-2">
                      {prospects.length} prospects en cache
                    </div>
                  </div>
                )}
              </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Ajouter un prospect
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-4 border border-blue-600/20"
        >
          <div className="text-gray-400 text-sm mb-1">Total prospects</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/10 rounded-xl p-4 border border-cyan-600/20"
        >
          <div className="text-gray-400 text-sm mb-1">Nouveaux</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.new}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-4 border border-purple-600/20"
        >
          <div className="text-gray-400 text-sm mb-1">Qualifiés</div>
          <div className="text-2xl font-bold text-purple-400">{stats.qualified}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-4 border border-green-600/20"
        >
          <div className="text-gray-400 text-sm mb-1">Convertis</div>
          <div className="text-2xl font-bold text-green-400">{stats.converted}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl p-4 border border-orange-600/20"
        >
          <div className="text-gray-400 text-sm mb-1">Taux conversion</div>
          <div className="text-2xl font-bold text-orange-400">{stats.conversionRate}%</div>
        </motion.div>
      </div>

      {/* Prospects Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Liste des prospects</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Rechercher un prospect..."
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 w-80"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="text-sm text-gray-400">
                  {filteredProspects.length} résultat{filteredProspects.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID / Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nom Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProspects.map((prospect) => (
                <motion.tr
                  key={prospect.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(prospect.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-gray-400">{prospect.id}</div>
                    <div className="text-xs text-gray-500">
                      {prospect.adName ? `Ad: ${prospect.adName.substring(0, 30)}...` : prospect.source}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prospect.isAggregated ? (
                      <div>
                        <div className="text-sm font-medium text-yellow-400">{prospect.name}</div>
                        <div className="text-xs text-gray-500">{prospect.company}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-white">{prospect.name || 'Sans nom'}</div>
                        {prospect.company && (
                          <div className="text-xs text-gray-500">{prospect.company}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-gray-300">{prospect.email || '-'}</div>
                    <div className="text-gray-500 text-xs">{prospect.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prospect.source === 'Facebook' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {prospect.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>{prospect.campaignId}</div>
                    <div className="text-xs text-gray-500">{prospect.campaignName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={prospect.status}
                      onChange={(e) => handleStatusChange(prospect.id, e.target.value)}
                      className={`px-3 py-1 text-xs rounded-lg border bg-black/50 ${getStatusColor(prospect.status)}`}
                    >
                      <option value="new">Nouveau</option>
                      <option value="contacted">Contacté</option>
                      <option value="qualified">Qualifié</option>
                      <option value="converted">Converti</option>
                      <option value="lost">Perdu</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {prospect.rawData && (
                        <button
                          onClick={() => {
                            setSelectedProspect(prospect);
                            setShowRawData(true);
                          }}
                          className="text-purple-400 hover:text-purple-300"
                          title="Voir les données brutes"
                        >
                          🔍
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(prospect)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(prospect.id)}
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
          
          {prospects.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Aucun prospect enregistré. Commencez par ajouter vos premiers prospects.
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
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingProspect ? 'Modifier le prospect' : 'Ajouter un prospect'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Société ABC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="jean@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Source *
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google Ads</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Direct">Direct</option>
                      <option value="Other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      ID Campagne
                    </label>
                    {metaConnected && campaigns.length > 0 ? (
                      <select
                        value={formData.campaignId}
                        onChange={(e) => {
                          const campaign = campaigns.find(c => c.id === e.target.value);
                          setFormData({
                            ...formData, 
                            campaignId: e.target.value,
                            campaignName: campaign?.name || ''
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Sélectionner --</option>
                        {campaigns.map(campaign => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.name} ({campaign.platform})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.campaignId}
                        onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        placeholder="CAM_FB_001"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      ID Publicité
                    </label>
                    <input
                      type="text"
                      value={formData.adId}
                      onChange={(e) => setFormData({...formData, adId: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="AD_001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="qualified">Qualifié</option>
                    <option value="converted">Converti</option>
                    <option value="lost">Perdu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    rows="3"
                    placeholder="Informations complémentaires..."
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                  >
                    {editingProspect ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raw Data Modal */}
      <AnimatePresence>
        {showRawData && selectedProspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowRawData(false);
              setSelectedProspect(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-3xl w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Données brutes Facebook - {selectedProspect.name}
              </h2>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">Informations traitées</h3>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><span className="text-gray-500">ID:</span> {selectedProspect.id}</div>
                    <div><span className="text-gray-500">Nom extrait:</span> {selectedProspect.name}</div>
                    <div><span className="text-gray-500">Email:</span> {selectedProspect.email || 'Non fourni'}</div>
                    <div><span className="text-gray-500">Téléphone:</span> {selectedProspect.phone || 'Non fourni'}</div>
                    <div><span className="text-gray-500">Entreprise:</span> {selectedProspect.company || 'Non fourni'}</div>
                  </div>
                </div>
                
                {selectedProspect.rawData && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Champs reçus de Facebook</h3>
                    <div className="text-xs font-mono bg-black/50 rounded p-3 overflow-x-auto">
                      {Object.entries(selectedProspect.rawData).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="text-yellow-400">"{key}"</span>:
                          <span className="text-green-400 ml-2">"{value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-400 mb-2">Métadonnées</h3>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><span className="text-gray-500">Campagne ID:</span> {selectedProspect.campaignId}</div>
                    <div><span className="text-gray-500">Campagne:</span> {selectedProspect.campaignName}</div>
                    <div><span className="text-gray-500">Publicité ID:</span> {selectedProspect.adId}</div>
                    <div><span className="text-gray-500">Publicité:</span> {selectedProspect.adName}</div>
                    <div><span className="text-gray-500">Formulaire:</span> {selectedProspect.formName}</div>
                    <div><span className="text-gray-500">Date:</span> {new Date(selectedProspect.date).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-xs text-yellow-400">
                    💡 Si le nom n'apparaît pas correctement, vérifiez les champs ci-dessus.
                    Facebook utilise des noms de champs différents selon la langue du formulaire.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowRawData(false);
                  setSelectedProspect(null);
                }}
                className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}