'use client';

import { useEffect, useRef } from 'react';
import useAidsStore from '@/lib/aids-store';

const AUTO_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

export default function AutoSyncManager() {
  const intervalRef = useRef(null);
  const { setSyncStatus, setSyncInProgress, dateRange } = useAidsStore();
  
  const performSync = async () => {
    console.log('[AutoSync] Starting automatic synchronization...');
    setSyncInProgress(true);
    
    try {
      const response = await fetch('/api/aids/insights/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          since: dateRange.since,
          until: dateRange.until
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('[AutoSync] Synchronization completed successfully');
        setSyncStatus(
          new Date().toISOString(),
          new Date(Date.now() + AUTO_SYNC_INTERVAL).toISOString()
        );
      } else {
        console.error('[AutoSync] Synchronization failed:', data.error);
      }
    } catch (error) {
      console.error('[AutoSync] Error during synchronization:', error);
    } finally {
      setSyncInProgress(false);
    }
  };
  
  useEffect(() => {
    // Initial sync check
    checkSyncStatus();
    
    // Perform initial sync
    performSync();
    
    // Set up interval for auto-sync
    intervalRef.current = setInterval(() => {
      performSync();
    }, AUTO_SYNC_INTERVAL);
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Run once on mount
  
  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/aids/insights/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.lastSync, data.nextSync);
        
        // If we're past the next sync time, sync now
        if (data.nextSync && new Date(data.nextSync) < new Date()) {
          performSync();
        }
      }
    } catch (error) {
      console.error('[AutoSync] Error checking sync status:', error);
    }
  };
  
  // This component doesn't render anything
  return null;
}