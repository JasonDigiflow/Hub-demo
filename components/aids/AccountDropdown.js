'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AccountDropdown({ 
  accounts, 
  selectedAccount, 
  onAccountChange, 
  metaConnected,
  changingAccount 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = async (accountId) => {
    await onAccountChange(accountId);
    setIsOpen(false);
  };

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  if (!metaConnected) {
    return <span className="text-gray-500 text-sm">Non connecté</span>;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between hover:bg-white/5 p-2 rounded transition-colors"
      >
        <span className="text-sm font-bold text-white truncate">
          {selectedAccount || 'Sélectionner un compte'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {mounted && isOpen && accounts.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 99999,
            pointerEvents: 'auto'
          }}
          className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
        >
          {accounts.map((account) => (
            <button
              key={account.id || account}
              onClick={() => handleSelect(account.id || account)}
              disabled={changingAccount}
              className={`w-full text-left p-3 hover:bg-white/10 transition-colors text-sm ${
                (account.id || account) === selectedAccount 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-white'
              } ${changingAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-medium">{account.name || account}</div>
              {account.id && (
                <div className="text-xs text-gray-400 mt-1">ID: {account.id}</div>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}