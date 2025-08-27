'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PERIODS = [
  { value: 'today', label: "Aujourd'hui", group: 'Jour' },
  { value: 'yesterday', label: 'Hier', group: 'Jour' },
  { value: 'last_7d', label: '7 derniers jours', group: 'Semaine' },
  { value: 'last_15d', label: '15 derniers jours', group: 'Semaine' },
  { value: 'last_30d', label: '30 derniers jours', group: 'Mois' },
  { value: 'current_month', label: 'Mois en cours', group: 'Mois' },
  { value: 'last_month', label: 'Mois dernier', group: 'Mois' },
  { value: 'last_90d', label: '90 derniers jours', group: 'Trimestre' },
  { value: 'custom', label: 'Personnalisé', group: 'Custom' },
];

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function PeriodSelector({ value, onChange, showComparison = true, onCompareToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [compareEnabled, setCompareEnabled] = useState(true);
  const dropdownRef = useRef(null);
  
  // Get current period label
  const getCurrentLabel = () => {
    if (value.type === 'month') {
      return `${MONTHS[value.month]} ${value.year}`;
    }
    if (value.type === 'custom') {
      return `${formatDate(value.start)} - ${formatDate(value.end)}`;
    }
    return PERIODS.find(p => p.value === value.period)?.label || 'Sélectionner';
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  
  const handlePeriodSelect = (period) => {
    if (period === 'custom') {
      setShowMonthPicker(true);
      return;
    }
    
    onChange({
      type: 'predefined',
      period
    });
    setIsOpen(false);
  };
  
  const handleMonthSelect = (month, year) => {
    onChange({
      type: 'month',
      month,
      year
    });
    setShowMonthPicker(false);
    setIsOpen(false);
  };
  
  const handleCustomDate = () => {
    if (customStart && customEnd) {
      onChange({
        type: 'custom',
        start: customStart,
        end: customEnd
      });
      setShowMonthPicker(false);
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowMonthPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Period Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{getCurrentLabel()}</span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Comparison Toggle */}
        {showComparison && (
          <button
            onClick={() => {
              setCompareEnabled(!compareEnabled);
              onCompareToggle && onCompareToggle(!compareEnabled);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              compareEnabled 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Comparer
          </button>
        )}
      </div>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !showMonthPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-64 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Grouped Periods */}
            {['Jour', 'Semaine', 'Mois', 'Trimestre', 'Custom'].map(group => (
              <div key={group}>
                {group !== 'Custom' && (
                  <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                    {group}
                  </div>
                )}
                {PERIODS.filter(p => p.group === group).map(period => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodSelect(period.value)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                  >
                    {period.label}
                    {value.period === period.value && (
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
                {group === 'Mois' && (
                  <button
                    onClick={() => setShowMonthPicker(true)}
                    className="w-full px-4 py-2 text-left text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2 border-t border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choisir un mois...
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Month Picker */}
        {isOpen && showMonthPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-80 bg-gray-900 border border-white/20 rounded-xl shadow-2xl p-4 z-50"
          >
            {/* Year Selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white font-medium">{selectedYear}</span>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {MONTHS.map((month, index) => (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(index, selectedYear)}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    value.type === 'month' && value.month === index && value.year === selectedYear
                      ? 'bg-blue-500 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
            
            {/* Custom Date Range */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-xs text-gray-400 mb-2">Période personnalisée</div>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                />
                <span className="text-white">→</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                />
              </div>
              <button
                onClick={handleCustomDate}
                disabled={!customStart || !customEnd}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                Appliquer
              </button>
            </div>
            
            {/* Back Button */}
            <button
              onClick={() => setShowMonthPicker(false)}
              className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Retour aux périodes
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}