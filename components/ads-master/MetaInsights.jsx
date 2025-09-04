'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { useLocale } from '@/lib/contexts/LocaleContext';

export default function MetaInsights({ isConnected, insights, loading, selectedAdAccount }) {
  const { t, locale } = useLocale();
  const [selectedMetric, setSelectedMetric] = useState('spend');
  const [dateRange, setDateRange] = useState('7days');
  const [chartType, setChartType] = useState('line');

  // Mock data pour la démo (sera remplacé par les vraies données de l'API)
  const mockData = insights || {
    summary: {
      spend: 1234.56,
      impressions: 45678,
      clicks: 890,
      ctr: 1.95,
      cpc: 1.39,
      cpm: 27.01,
      conversions: 23,
      roas: 3.45
    },
    timeline: [
      { date: '2025-08-27', spend: 150, ctr: 1.8, cpc: 1.2, cpm: 25, conversions: 3, roas: 3.2 },
      { date: '2025-08-28', spend: 180, ctr: 2.1, cpc: 1.3, cpm: 26, conversions: 4, roas: 3.5 },
      { date: '2025-08-29', spend: 165, ctr: 1.9, cpc: 1.4, cpm: 27, conversions: 3, roas: 3.1 },
      { date: '2025-08-30', spend: 195, ctr: 2.2, cpc: 1.5, cpm: 28, conversions: 5, roas: 3.8 },
      { date: '2025-08-31', spend: 175, ctr: 2.0, cpc: 1.3, cpm: 26, conversions: 4, roas: 3.4 },
      { date: '2025-09-01', spend: 185, ctr: 2.1, cpc: 1.4, cpm: 27, conversions: 4, roas: 3.6 },
      { date: '2025-09-02', spend: 184.56, ctr: 1.95, cpc: 1.39, cpm: 27.01, conversions: 0, roas: 0 }
    ],
    campaigns: [
      { 
        id: '1', 
        name: 'Summer Sale 2025', 
        status: 'ACTIVE',
        spend: 456.78, 
        impressions: 12345, 
        clicks: 234,
        ctr: 1.9, 
        cpc: 1.95, 
        conversions: 8,
        roas: 4.2 
      },
      { 
        id: '2', 
        name: 'Brand Awareness', 
        status: 'ACTIVE',
        spend: 389.12, 
        impressions: 18900, 
        clicks: 312,
        ctr: 1.65, 
        cpc: 1.25, 
        conversions: 6,
        roas: 3.1 
      },
      { 
        id: '3', 
        name: 'Retargeting Campaign', 
        status: 'PAUSED',
        spend: 234.56, 
        impressions: 8900, 
        clicks: 198,
        ctr: 2.22, 
        cpc: 1.18, 
        conversions: 7,
        roas: 4.5 
      },
      { 
        id: '4', 
        name: 'New Product Launch', 
        status: 'ACTIVE',
        spend: 154.10, 
        impressions: 5533, 
        clicks: 146,
        ctr: 2.64, 
        cpc: 1.06, 
        conversions: 2,
        roas: 2.8 
      }
    ],
    audiences: [
      { name: '18-24', spend: 234, conversions: 5, roas: 2.8 },
      { name: '25-34', spend: 456, conversions: 10, roas: 3.9 },
      { name: '35-44', spend: 345, conversions: 6, roas: 3.2 },
      { name: '45-54', spend: 199, conversions: 2, roas: 2.1 }
    ]
  };

  const metrics = [
    { id: 'spend', name: t('adsMaster.metrics.spend'), unit: '€', color: '#8b5cf6' },
    { id: 'ctr', name: t('adsMaster.metrics.ctr'), unit: '%', color: '#3b82f6' },
    { id: 'cpc', name: t('adsMaster.metrics.cpc'), unit: '€', color: '#10b981' },
    { id: 'cpm', name: t('adsMaster.metrics.cpm'), unit: '€', color: '#f59e0b' },
    { id: 'conversions', name: t('adsMaster.metrics.conversions'), unit: '', color: '#ef4444' },
    { id: 'roas', name: t('adsMaster.metrics.roas'), unit: 'x', color: '#ec4899' }
  ];

  const dateRanges = [
    { id: '7days', name: t('adsMaster.dateRanges.7days') },
    { id: '14days', name: t('adsMaster.dateRanges.14days') },
    { id: '30days', name: t('adsMaster.dateRanges.30days') },
    { id: 'custom', name: t('adsMaster.dateRanges.custom') }
  ];

  if (!isConnected) {
    return (
      <GlassCard className="p-12 text-center">
        <span className="text-6xl mb-4 block">📊</span>
        <h3 className="text-2xl font-bold text-white mb-2">{t('adsMaster.notConnected.title')}</h3>
        <p className="text-white/60 mb-6">{t('adsMaster.notConnected.description')}</p>
        <button
          onClick={() => window.location.href = '/api/ads-master/meta/auth'}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {t('adsMaster.connectMeta')}
        </button>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded animate-pulse" />
          <div className="h-64 bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-white/10 rounded animate-pulse" />
            <div className="h-24 bg-white/10 rounded animate-pulse" />
            <div className="h-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!insights && !loading) {
    return (
      <GlassCard className="p-12 text-center">
        <span className="text-6xl mb-4 block">📈</span>
        <h3 className="text-2xl font-bold text-white mb-2">{t('adsMaster.noData.title')}</h3>
        <p className="text-white/60">{t('adsMaster.noData.description')}</p>
      </GlassCard>
    );
  }

  const currentMetric = metrics.find(m => m.id === selectedMetric);

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div>
            <label className="text-white/40 text-xs block mb-1">{t('adsMaster.period')}</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="text-white/40 text-xs block mb-1">{t('adsMaster.metric')}</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>{metric.name}</option>
              ))}
            </select>
          </div>

          {/* Chart Type */}
          <div>
            <label className="text-white/40 text-xs block mb-1">{t('adsMaster.chartType')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  chartType === 'line' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                📈 {t('adsMaster.lineChart')}
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  chartType === 'bar' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                📊 {t('adsMaster.barChart')}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(mockData.summary).slice(0, 4).map(([key, value]) => {
          const metric = metrics.find(m => m.id === key);
          return (
            <GlassCard key={key} className="p-4">
              <p className="text-white/40 text-xs mb-1">{metric?.name || key}</p>
              <p className="text-2xl font-bold text-white">
                {metric?.unit && metric.unit !== 'x' && metric.unit}{' '}
                {typeof value === 'number' ? value.toLocaleString(locale, { maximumFractionDigits: 2 }) : value}
                {metric?.unit === 'x' && 'x'}
                {metric?.unit === '%' && '%'}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {currentMetric?.name} {t('adsMaster.evolution')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={mockData.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={currentMetric?.color || '#8b5cf6'}
                strokeWidth={2}
                dot={{ fill: currentMetric?.color || '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={mockData.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey={selectedMetric} 
                fill={currentMetric?.color || '#8b5cf6'}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </GlassCard>

      {/* Campaigns Table */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('adsMaster.campaigns')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 text-xs font-medium pb-3">{t('adsMaster.campaignName')}</th>
                <th className="text-left text-white/60 text-xs font-medium pb-3">{t('adsMaster.status')}</th>
                <th className="text-right text-white/60 text-xs font-medium pb-3">{t('adsMaster.metrics.spend')}</th>
                <th className="text-right text-white/60 text-xs font-medium pb-3">{t('adsMaster.metrics.ctr')}</th>
                <th className="text-right text-white/60 text-xs font-medium pb-3">{t('adsMaster.metrics.conversions')}</th>
                <th className="text-right text-white/60 text-xs font-medium pb-3">{t('adsMaster.metrics.roas')}</th>
              </tr>
            </thead>
            <tbody>
              {mockData.campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-white text-sm">{campaign.name}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 text-white text-sm text-right">€ {campaign.spend.toFixed(2)}</td>
                  <td className="py-3 text-white text-sm text-right">{campaign.ctr.toFixed(2)}%</td>
                  <td className="py-3 text-white text-sm text-right">{campaign.conversions}</td>
                  <td className="py-3 text-white text-sm text-right">{campaign.roas.toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Audience Matrix */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('adsMaster.audienceMatrix')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.audiences.map((audience) => (
            <div 
              key={audience.name}
              className="relative p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-white/10"
            >
              <p className="text-white font-medium mb-2">{audience.name}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">{t('adsMaster.metrics.spend')}</span>
                  <span className="text-white">€ {audience.spend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">{t('adsMaster.metrics.conversions')}</span>
                  <span className="text-white">{audience.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">{t('adsMaster.metrics.roas')}</span>
                  <span className="text-white font-semibold">{audience.roas.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}