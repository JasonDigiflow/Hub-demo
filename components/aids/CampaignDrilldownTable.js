'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignDrilldownTable({ timeRange = 'last_30d' }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [expandedAdSets, setExpandedAdSets] = useState({});
  const [level, setLevel] = useState('campaign'); // campaign, adset, ad
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, [timeRange]);

  const loadCampaignData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/aids/meta/campaigns/hierarchy?time_range=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaign hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/aids/insights/sync', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        // Reload data after sync
        await loadCampaignData();
        // Show success toast (you can add a toast library)
        console.log('Synchronisation réussie');
      } else {
        console.error('Sync failed:', data.error);
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const toggleCampaign = (campaignId) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const toggleAdSet = (adSetId) => {
    setExpandedAdSets(prev => ({
      ...prev,
      [adSetId]: !prev[adSetId]
    }));
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-400/10';
      case 'PAUSED': return 'text-yellow-400 bg-yellow-400/10';
      case 'ARCHIVED': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Calculate totals for a campaign
  const getCampaignTotals = (campaign) => {
    if (!campaign.adsets || campaign.adsets.length === 0) {
      return campaign.insights || {};
    }

    const totals = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      leads: 0
    };

    campaign.adsets.forEach(adset => {
      totals.spend += parseFloat(adset.insights?.spend || 0);
      totals.impressions += parseInt(adset.insights?.impressions || 0);
      totals.clicks += parseInt(adset.insights?.clicks || 0);
      totals.reach = Math.max(totals.reach, parseInt(adset.insights?.reach || 0));
      
      // Count leads from actions
      if (adset.insights?.actions) {
        const leadActions = adset.insights.actions.filter(a => a.action_type === 'lead');
        totals.leads += leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
      }
    });

    // Calculate derived metrics
    totals.ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0';
    totals.cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : '0';
    totals.cpm = totals.impressions > 0 ? ((totals.spend / totals.impressions) * 1000).toFixed(2) : '0';
    totals.cost_per_result = totals.leads > 0 ? (totals.spend / totals.leads).toFixed(2) : '0';

    return totals;
  };

  // Calculate totals for an ad set
  const getAdSetTotals = (adSet) => {
    if (!adSet.ads || adSet.ads.length === 0) {
      return adSet.insights || {};
    }

    const totals = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      leads: 0
    };

    adSet.ads.forEach(ad => {
      totals.spend += parseFloat(ad.insights?.spend || 0);
      totals.impressions += parseInt(ad.insights?.impressions || 0);
      totals.clicks += parseInt(ad.insights?.clicks || 0);
      totals.reach = Math.max(totals.reach, parseInt(ad.insights?.reach || 0));
      
      if (ad.insights?.actions) {
        const leadActions = ad.insights.actions.filter(a => a.action_type === 'lead');
        totals.leads += leadActions.reduce((sum, a) => sum + parseInt(a.value || 0), 0);
      }
    });

    totals.ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0';
    totals.cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : '0';
    totals.cpm = totals.impressions > 0 ? ((totals.spend / totals.impressions) * 1000).toFixed(2) : '0';
    totals.cost_per_result = totals.leads > 0 ? (totals.spend / totals.leads).toFixed(2) : '0';

    return totals;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Chargement des campagnes...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Header with Sync Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          Hiérarchie des Campagnes
        </h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            syncing 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {syncing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Synchronisation...
            </span>
          ) : (
            'Synchroniser maintenant'
          )}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase">Nom</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase">Statut</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">Dépenses</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">Impressions</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">Clics</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">CTR</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">CPC</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">CPM</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">Leads</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase text-right">Coût/Lead</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const campaignTotals = getCampaignTotals(campaign);
              const isExpanded = expandedCampaigns[campaign.id];

              return (
                <React.Fragment key={campaign.id}>
                  {/* Campaign Row */}
                  <motion.tr
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => toggleCampaign(campaign.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-white">{campaign.name}</div>
                          <div className="text-xs text-gray-400">{campaign.objective}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatCurrency(campaignTotals.spend)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatNumber(campaignTotals.impressions)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatNumber(campaignTotals.clicks)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {campaignTotals.ctr || '0'}%
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatCurrency(campaignTotals.cpc)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatCurrency(campaignTotals.cpm)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatNumber(campaignTotals.leads)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-white">
                      {formatCurrency(campaignTotals.cost_per_result)}
                    </td>
                  </motion.tr>

                  {/* Ad Sets (if campaign is expanded) */}
                  <AnimatePresence>
                    {isExpanded && campaign.adsets?.map((adSet) => {
                      const adSetTotals = getAdSetTotals(adSet);
                      const isAdSetExpanded = expandedAdSets[adSet.id];

                      return (
                        <React.Fragment key={adSet.id}>
                          {/* Ad Set Row */}
                          <motion.tr
                            className="bg-black/20 border-b border-white/5 hover:bg-white/5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAdSet(adSet.id);
                            }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td className="py-3 px-4 pl-12">
                              <div className="flex items-center gap-2">
                                <svg 
                                  className={`w-3 h-3 text-gray-400 transition-transform ${isAdSetExpanded ? 'rotate-90' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="text-sm text-gray-300">{adSet.name}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(adSet.status)}`}>
                                {adSet.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatCurrency(adSetTotals.spend)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatNumber(adSetTotals.impressions)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatNumber(adSetTotals.clicks)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {adSetTotals.ctr || '0'}%
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatCurrency(adSetTotals.cpc)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatCurrency(adSetTotals.cpm)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatNumber(adSetTotals.leads)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-300">
                              {formatCurrency(adSetTotals.cost_per_result)}
                            </td>
                          </motion.tr>

                          {/* Ads (if ad set is expanded) */}
                          <AnimatePresence>
                            {isAdSetExpanded && adSet.ads?.map((ad) => (
                              <motion.tr
                                key={ad.id}
                                className="bg-black/10 border-b border-white/5 hover:bg-white/5"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <td className="py-3 px-4 pl-20">
                                  <div className="text-sm text-gray-400">{ad.name}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(ad.status)}`}>
                                    {ad.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatCurrency(ad.insights?.spend || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatNumber(ad.insights?.impressions || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatNumber(ad.insights?.clicks || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {ad.insights?.ctr || '0'}%
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatCurrency(ad.insights?.cpc || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatCurrency(ad.insights?.cpm || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatNumber(ad.insights?.leads || 0)}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-400">
                                  {formatCurrency(ad.insights?.cost_per_result || 0)}
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}