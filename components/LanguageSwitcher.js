'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { localeNames } from '@/i18n.config';
import { useRouter, usePathname } from 'next/navigation';
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

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState('fr');
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Charger la langue sauvegardée
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'fr';
    setCurrentLocale(savedLocale);
    
    // Mettre à jour le cookie pour le serveur
    document.cookie = `NEXT_LOCALE=${savedLocale}; path=/; max-age=${60*60*24*365}`;
  }, []);

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

  const handleLocaleChange = (locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('locale', locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60*60*24*365}`;
    setIsOpen(false);
    
    // Recharger la page pour appliquer la nouvelle langue
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-200"
        title="Changer de langue / Change language"
      >
        <Globe className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-white">
          {currentLocale.toUpperCase()}
        </span>
      </button>

      <DropdownPortal isOpen={isOpen} targetRef={buttonRef}>
        <div 
          ref={dropdownRef}
          className="bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl py-1 min-w-[150px]"
        >
          {Object.entries(localeNames).map(([locale, name]) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                currentLocale === locale ? 'bg-purple-500/20' : ''
              }`}
            >
              <span className="text-sm text-white">{name}</span>
              {currentLocale === locale && (
                <Check className="w-4 h-4 text-purple-400" />
              )}
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  );
}