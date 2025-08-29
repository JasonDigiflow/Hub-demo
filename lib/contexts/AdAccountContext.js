'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AdAccountContext = createContext({});

export function AdAccountProvider({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les comptes au montage
  useEffect(() => {
    loadAccounts();
  }, []);

  // Récupérer l'account depuis l'URL ou localStorage
  useEffect(() => {
    const urlAccount = searchParams.get('ad_account');
    const storedAccount = localStorage.getItem('selected_ad_account');
    
    if (urlAccount) {
      setSelectedAccount(urlAccount);
      localStorage.setItem('selected_ad_account', urlAccount);
    } else if (storedAccount) {
      setSelectedAccount(storedAccount);
    } else if (accounts.length > 0 && !selectedAccount) {
      // Sélectionner le premier compte actif par défaut
      const defaultAccount = accounts.find(a => a.status === 1) || accounts[0];
      if (defaultAccount) {
        selectAccount(defaultAccount.id);
      }
    }
  }, [searchParams, accounts]);

  // Charger les comptes depuis l'API
  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les comptes depuis l'organisation
      const response = await fetch('/api/meta/accounts');
      const data = await response.json();
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
        
        // Si aucun compte sélectionné, prendre le premier actif
        if (!selectedAccount && data.accounts.length > 0) {
          const defaultAccount = data.accounts.find(a => a.status === 1) || data.accounts[0];
          if (defaultAccount) {
            setSelectedAccount(defaultAccount.id);
            localStorage.setItem('selected_ad_account', defaultAccount.id);
          }
        }
      } else if (data.needsReauth) {
        setError('Veuillez vous reconnecter à Meta');
      } else {
        setError(data.error || 'Erreur lors du chargement des comptes');
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  // Sélectionner un compte
  function selectAccount(accountId) {
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    
    // Mettre à jour l'URL
    const current = new URLSearchParams(searchParams.toString());
    current.set('ad_account', accountId);
    
    // Mettre à jour le cookie pour le serveur
    document.cookie = `selected_ad_account=${accountId}; path=/; max-age=${60*60*24*30}`;
    
    // Rafraîchir la page pour recharger les données avec le nouveau compte
    router.push(`${window.location.pathname}?${current.toString()}`);
  }

  // Récupérer le compte actuellement sélectionné
  function getSelectedAccount() {
    return accounts.find(a => a.id === selectedAccount);
  }

  // Vérifier si un compte est sélectionné
  function hasSelectedAccount() {
    return !!selectedAccount && accounts.some(a => a.id === selectedAccount);
  }

  // Rafraîchir les comptes
  async function refreshAccounts() {
    await loadAccounts();
  }

  const value = {
    selectedAccount,
    accounts,
    loading,
    error,
    selectAccount,
    getSelectedAccount,
    hasSelectedAccount,
    refreshAccounts
  };

  return (
    <AdAccountContext.Provider value={value}>
      {children}
    </AdAccountContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useAdAccount() {
  const context = useContext(AdAccountContext);
  if (!context) {
    throw new Error('useAdAccount must be used within AdAccountProvider');
  }
  return context;
}

export default AdAccountContext;