'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building2, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useAdAccount } from '@/lib/contexts/AdAccountContext';
import { createPortal } from 'react-dom';

function DropdownPortal({ children, isOpen, targetRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, targetRef]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export default function AdAccountSelector() {
  const { 
    selectedAccount, 
    accounts, 
    loading, 
    error, 
    selectAccount, 
    getSelectedAccount,
    refreshAccounts 
  } = useAdAccount();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRefresh = async (e) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshAccounts();
    setIsRefreshing(false);
  };

  const handleSelectAccount = (accountId) => {
    selectAccount(accountId);
    setIsOpen(false);
  };

  const currentAccount = getSelectedAccount();

  // Statuts des comptes
  const getStatusColor = (status) => {
    switch(status) {
      case 1: return 'text-green-500'; // Actif
      case 2: return 'text-red-500';   // Désactivé
      case 3: return 'text-orange-500'; // Non réglé
      case 7: return 'text-yellow-500'; // En révision
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 1: return 'Actif';
      case 2: return 'Désactivé';
      case 3: return 'Non réglé';
      case 7: return 'En révision';
      case 9: return 'Période de grâce';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
        <span className="text-sm text-white/70">Chargement des comptes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/20">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-400">{error}</span>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 backdrop-blur-md rounded-xl border border-yellow-500/20">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-yellow-400">Aucun compte publicitaire trouvé</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200 min-w-[250px]"
      >
        <Building2 className="w-5 h-5 text-purple-400" />
        <div className="flex-1 text-left">
          {currentAccount ? (
            <div>
              <div className="text-sm font-medium text-white">
                {currentAccount.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className={`${getStatusColor(currentAccount.status)}`}>
                  • {getStatusText(currentAccount.status)}
                </span>
                <span>{currentAccount.currency}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-white/70">Sélectionner un compte</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <DropdownPortal isOpen={isOpen} targetRef={buttonRef}>
        <div 
          ref={dropdownRef}
          className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 max-h-[400px] overflow-y-auto"
        >
          {/* Header avec refresh */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 mb-1">
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Comptes publicitaires
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              title="Rafraîchir les comptes"
            >
              <RefreshCw className={`w-3 h-3 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Liste des comptes */}
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleSelectAccount(account.id)}
              className={`w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 ${
                selectedAccount === account.id ? 'bg-purple-500/20' : ''
              }`}
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  {account.name}
                  {selectedAccount === account.id && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                  <span className={`${getStatusColor(account.status)}`}>
                    • {getStatusText(account.status)}
                  </span>
                  <span>{account.currency}</span>
                  <span className="text-white/40">{account.accountId || account.id}</span>
                </div>
              </div>
            </button>
          ))}

          {/* Footer info */}
          <div className="px-4 py-2 border-t border-white/10 mt-1">
            <p className="text-xs text-white/40">
              {accounts.length} compte{accounts.length > 1 ? 's' : ''} disponible{accounts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </DropdownPortal>
    </div>
  );
}