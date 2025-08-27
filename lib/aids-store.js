'use client';

import { create } from 'zustand';

// Helper to calculate date ranges
const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let since, until;
  
  switch(preset) {
    case 'today':
      since = today.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
      break;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      since = yesterday.toISOString().split('T')[0];
      until = yesterday.toISOString().split('T')[0];
      break;
    case 'last_7d':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      since = sevenDaysAgo.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
      break;
    case 'last_30d':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      since = thirtyDaysAgo.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
      break;
    case 'last_90d':
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      since = ninetyDaysAgo.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
      break;
    case 'lifetime':
      // For lifetime, use last 90 days as Meta API limit
      const lifetimeStart = new Date(today);
      lifetimeStart.setDate(lifetimeStart.getDate() - 89);
      since = lifetimeStart.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
      break;
    default:
      const defaultStart = new Date(today);
      defaultStart.setDate(defaultStart.getDate() - 29);
      since = defaultStart.toISOString().split('T')[0];
      until = today.toISOString().split('T')[0];
  }
  
  return { since, until };
};

const useAidsStore = create((set, get) => ({
  // Account state
  adAccountId: null,
  accounts: [],
  metaConnected: false,
  
  // Period state
  datePreset: 'last_30d',
  dateRange: getDateRange('last_30d'),
  
  // Sync state
  lastSync: null,
  nextSync: null,
  syncInProgress: false,
  
  // Actions
  setAdAccountId: (adAccountId) => set({ adAccountId }),
  
  setAccounts: (accounts) => set({ accounts }),
  
  setMetaConnected: (connected) => set({ metaConnected: connected }),
  
  setDatePreset: (preset) => {
    const dateRange = getDateRange(preset);
    set({ 
      datePreset: preset, 
      dateRange 
    });
  },
  
  setDateRange: (since, until) => set({ 
    dateRange: { since, until },
    datePreset: 'custom'
  }),
  
  setSyncStatus: (lastSync, nextSync) => set({ lastSync, nextSync }),
  
  setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),
  
  // Getters
  getTimeRangeQuery: () => {
    const { dateRange } = get();
    return `time_range={'since':'${dateRange.since}','until':'${dateRange.until}'}`;
  },
  
  getCacheKey: (level = 'account') => {
    const { adAccountId, dateRange } = get();
    return `${adAccountId}_${dateRange.since}_${dateRange.until}_${level}`;
  }
}));

export default useAidsStore;