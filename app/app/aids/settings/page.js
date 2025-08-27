'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Eye, EyeOff, CheckCircle, 
  XCircle, AlertCircle, Zap, Settings, 
  Key, Cloud, Palette, Brain, ChevronRight,
  Shield, Sparkles, Activity, Database
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    meta: {
      accessToken: '',
      adAccountId: '',
      pixelId: '',
      isConfigured: false
    },
    llm: {
      provider: 'anthropic',
      apiKey: '',
      model: 'claude-3-opus-20240229',
      isConfigured: false
    },
    image: {
      provider: 'openai',
      apiKey: '',
      model: 'dall-e-3',
      quality: 'hd',
      isConfigured: false
    },
    storage: {
      provider: 's3',
      bucket: '',
      region: 'us-east-1',
      accessKey: '',
      secretKey: '',
      isConfigured: false
    },
    automation: {
      enabled: false,
      frequency: 'daily',
      timeOfDay: '09:00',
      autoValidation: true,
      autoLaunch: false,
      budgetLimit: 1000
    }
  });

  const [showTokens, setShowTokens] = useState({});
  const [saving, setSaving] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [activeTab, setActiveTab] = useState('meta');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/aids/config/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/aids/config/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          meta: { ...prev.meta, isConfigured: !!prev.meta.accessToken },
          llm: { ...prev.llm, isConfigured: !!prev.llm.apiKey },
          image: { ...prev.image, isConfigured: !!prev.image.apiKey },
          storage: { ...prev.storage, isConfigured: !!prev.storage.accessKey }
        }));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setSaving(false);
  };

  const testConnection = async (service) => {
    setTestResults(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      const response = await fetch(`/api/aids/config/test/${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings[service])
      });
      
      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        [service]: data.success ? 'success' : 'error' 
      }));
      
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [service]: null }));
      }, 3000);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [service]: null }));
      }, 3000);
    }
  };

  const toggleTokenVisibility = (field) => {
    setShowTokens(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const renderTestButton = (service) => {
    const result = testResults[service];
    
    if (result === 'testing') {
      return (
        <motion.button 
          disabled 
          className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl flex items-center gap-3 border border-white/20"
          whileHover={{ scale: 1 }}
        >
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Testing connection...
        </motion.button>
      );
    }
    
    if (result === 'success') {
      return (
        <motion.button 
          disabled 
          className="px-6 py-3 bg-green-500/20 backdrop-blur-sm text-green-400 rounded-xl flex items-center gap-3 border border-green-500/30"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <CheckCircle className="w-5 h-5" />
          Connected successfully!
        </motion.button>
      );
    }
    
    if (result === 'error') {
      return (
        <motion.button 
          disabled 
          className="px-6 py-3 bg-red-500/20 backdrop-blur-sm text-red-400 rounded-xl flex items-center gap-3 border border-red-500/30"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <XCircle className="w-5 h-5" />
          Connection failed
        </motion.button>
      );
    }
    
    return (
      <motion.button
        onClick={() => testConnection(service)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-3 shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Activity className="w-5 h-5" />
        Test Connection
      </motion.button>
    );
  };

  const tabs = [
    { id: 'meta', label: 'Meta Ads', icon: Database, color: 'from-blue-500 to-cyan-500' },
    { id: 'llm', label: 'AI Model', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'image', label: 'Images', icon: Palette, color: 'from-green-500 to-emerald-500' },
    { id: 'storage', label: 'Storage', icon: Cloud, color: 'from-orange-500 to-red-500' },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
      </div>

      {/* Glass overlay pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/app/aids" className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white mb-6 transition-all rounded-lg hover:bg-white/5 backdrop-blur-sm group">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black text-white mb-3">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  Settings
                </span>
              </h1>
              <p className="text-gray-300 text-xl">Configure your AIDs automation and integrations</p>
            </div>
            
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3 shadow-2xl overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white relative z-10"></div>
                  <span className="relative z-10">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-semibold">Save All Settings</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          {Object.entries({
            'Meta': settings.meta.isConfigured,
            'AI': settings.llm.isConfigured,
            'Images': settings.image.isConfigured,
            'Storage': settings.storage.isConfigured
          }).map(([name, configured], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-5 rounded-2xl backdrop-blur-xl border-2 transition-all hover:scale-105 ${
                configured 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/40 shadow-green-500/20 shadow-lg' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{name}</span>
                {configured ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Shield className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className={`text-xs mt-1 ${configured ? 'text-green-400' : 'text-gray-500'}`}>
                {configured ? 'Connected' : 'Not configured'}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-3"
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 p-3 shadow-2xl shadow-purple-500/10">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-5 py-4 rounded-2xl mb-2 flex items-center justify-between transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-2xl scale-105' 
                        : 'hover:bg-white/10 text-gray-300 hover:text-white hover:shadow-lg'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-5 h-5" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Info Card */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-2xl rounded-3xl border-2 border-purple-500/30 shadow-xl shadow-purple-500/10"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Pro Tip</h4>
                  <p className="text-xs text-gray-400">
                    Enable automation to let Octavia AI optimize your campaigns 24/7 with smart budget allocation.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-9"
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 p-10 shadow-2xl shadow-purple-500/10">
              <AnimatePresence mode="wait">
                {/* Meta Ads Settings */}
                {activeTab === 'meta' && (
                  <motion.div
                    key="meta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Meta Marketing API</h3>
                        <p className="text-gray-400">Connect your Facebook Ads account</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={showTokens['metaToken'] ? 'text' : 'password'}
                            value={settings.meta.accessToken}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              meta: { ...prev.meta, accessToken: e.target.value }
                            }))}
                            placeholder="EAAxxxxxx..."
                            className="w-full px-5 py-4 pr-12 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => toggleTokenVisibility('metaToken')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showTokens['metaToken'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ad Account ID
                        </label>
                        <input
                          type="text"
                          value={settings.meta.adAccountId}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            meta: { ...prev.meta, adAccountId: e.target.value }
                          }))}
                          placeholder="act_123456789"
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pixel ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={settings.meta.pixelId}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            meta: { ...prev.meta, pixelId: e.target.value }
                          }))}
                          placeholder="123456789"
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                        />
                      </div>

                      <div className="pt-4">
                        {renderTestButton('meta')}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* LLM Settings */}
                {activeTab === 'llm' && (
                  <motion.div
                    key="llm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">AI Model</h3>
                        <p className="text-gray-400">Configure your AI provider</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Provider
                        </label>
                        <select
                          value={settings.llm.provider}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            llm: { ...prev.llm, provider: e.target.value }
                          }))}
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                        >
                          <option value="anthropic" className="bg-gray-900">Anthropic (Claude)</option>
                          <option value="openai" className="bg-gray-900">OpenAI (GPT)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key
                        </label>
                        <div className="relative">
                          <input
                            type={showTokens['llmKey'] ? 'text' : 'password'}
                            value={settings.llm.apiKey}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              llm: { ...prev.llm, apiKey: e.target.value }
                            }))}
                            placeholder={settings.llm.provider === 'anthropic' ? 'sk-ant-xxxxx' : 'sk-xxxxx'}
                            className="w-full px-5 py-4 pr-12 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => toggleTokenVisibility('llmKey')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showTokens['llmKey'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Model
                        </label>
                        <select
                          value={settings.llm.model}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            llm: { ...prev.llm, model: e.target.value }
                          }))}
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                        >
                          {settings.llm.provider === 'anthropic' ? (
                            <>
                              <option value="claude-3-opus-20240229" className="bg-gray-900">Claude 3 Opus</option>
                              <option value="claude-3-sonnet-20240229" className="bg-gray-900">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku-20240307" className="bg-gray-900">Claude 3 Haiku</option>
                            </>
                          ) : (
                            <>
                              <option value="gpt-4-turbo" className="bg-gray-900">GPT-4 Turbo</option>
                              <option value="gpt-4" className="bg-gray-900">GPT-4</option>
                              <option value="gpt-3.5-turbo" className="bg-gray-900">GPT-3.5 Turbo</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="pt-4">
                        {renderTestButton('llm')}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Automation Settings */}
                {activeTab === 'automation' && (
                  <motion.div
                    key="automation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Automation</h3>
                        <p className="text-gray-400">Configure automatic optimization</p>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-lg font-semibold text-white">Enable Automation</div>
                          <div className="text-sm text-gray-400">Let Octavia optimize your campaigns automatically</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.automation.enabled}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              automation: { ...prev.automation, enabled: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {settings.automation.enabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Frequency
                                </label>
                                <select
                                  value={settings.automation.frequency}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    automation: { ...prev.automation, frequency: e.target.value }
                                  }))}
                                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                                >
                                  <option value="hourly" className="bg-gray-900">Every Hour</option>
                                  <option value="daily" className="bg-gray-900">Daily</option>
                                  <option value="weekly" className="bg-gray-900">Weekly</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Budget Limit ($)
                                </label>
                                <input
                                  type="number"
                                  value={settings.automation.budgetLimit}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    automation: { ...prev.automation, budgetLimit: parseInt(e.target.value) }
                                  }))}
                                  min="0"
                                  step="100"
                                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:bg-white/15"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={settings.automation.autoValidation}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    automation: { ...prev.automation, autoValidation: e.target.checked }
                                  }))}
                                  className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700"
                                />
                                <div>
                                  <span className="text-white font-medium">Auto-validate creatives</span>
                                  <p className="text-xs text-gray-400">Automatically approve AI-generated content</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={settings.automation.autoLaunch}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    automation: { ...prev.automation, autoLaunch: e.target.checked }
                                  }))}
                                  className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700"
                                />
                                <div>
                                  <span className="text-white font-medium">Auto-launch campaigns</span>
                                  <p className="text-xs text-gray-400">Start campaigns without manual approval</p>
                                </div>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-300">Important Notice</h4>
                          <p className="text-sm text-yellow-200/80 mt-1">
                            Automation will run according to your schedule and may incur costs based on your API usage and ad spend.
                            Always set appropriate budget limits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300\% {
          background-size: 300% 300%;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}