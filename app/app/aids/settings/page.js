'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';
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
        // Show success message
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
        <button disabled className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></div>
          Testing...
        </button>
      );
    }
    
    if (result === 'success') {
      return (
        <button disabled className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Connected
        </button>
      );
    }
    
    if (result === 'error') {
      return (
        <button disabled className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Failed
        </button>
      );
    }
    
    return (
      <button
        onClick={() => testConnection(service)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <TestTube className="w-4 h-4" />
        Test Connection
      </button>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/app/aids" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">AIDs Settings</h1>
        <p className="text-gray-600">Configure your API keys and automation preferences</p>
      </div>

      {/* Status Banner */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Configuration Status:</span>
            <div className="flex gap-2">
              {Object.entries({
                'Meta': settings.meta.isConfigured,
                'LLM': settings.llm.isConfigured,
                'Images': settings.image.isConfigured,
                'Storage': settings.storage.isConfigured
              }).map(([name, configured]) => (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    configured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {configured ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'meta', label: 'Meta Ads', icon: '📱' },
              { id: 'llm', label: 'AI Model', icon: '🤖' },
              { id: 'image', label: 'Image Generation', icon: '🎨' },
              { id: 'storage', label: 'Storage', icon: '💾' },
              { id: 'automation', label: 'Automation', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Meta Ads Settings */}
          {activeTab === 'meta' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Meta Marketing API Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility('metaToken')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTokens['metaToken'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-4">
                {renderTestButton('meta')}
              </div>
            </div>
          )}

          {/* LLM Settings */}
          {activeTab === 'llm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">AI Model Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={settings.llm.provider}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, provider: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility('llmKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTokens['llmKey'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  value={settings.llm.model}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, model: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {settings.llm.provider === 'anthropic' ? (
                    <>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-4">
                {renderTestButton('llm')}
              </div>
            </div>
          )}

          {/* Image Generation Settings */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Image Generation Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={settings.image.provider}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    image: { ...prev.image, provider: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="openai">OpenAI (DALL-E)</option>
                  <option value="stability">Stability AI</option>
                  <option value="midjourney">Midjourney</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showTokens['imageKey'] ? 'text' : 'password'}
                    value={settings.image.apiKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      image: { ...prev.image, apiKey: e.target.value }
                    }))}
                    placeholder="sk-xxxxx"
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility('imageKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTokens['imageKey'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {settings.image.provider === 'openai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <select
                      value={settings.image.model}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        image: { ...prev.image, model: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="dall-e-2">DALL-E 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality
                    </label>
                    <select
                      value={settings.image.quality}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        image: { ...prev.image, quality: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="hd">HD (High Quality)</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4">
                {renderTestButton('image')}
              </div>
            </div>
          )}

          {/* Storage Settings */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Storage Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={settings.storage.provider}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    storage: { ...prev.storage, provider: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="s3">Amazon S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bucket Name
                </label>
                <input
                  type="text"
                  value={settings.storage.bucket}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    storage: { ...prev.storage, bucket: e.target.value }
                  }))}
                  placeholder="my-creatives-bucket"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {settings.storage.provider === 's3' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <select
                      value={settings.storage.region}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, region: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Key ID
                    </label>
                    <input
                      type="text"
                      value={settings.storage.accessKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, accessKey: e.target.value }
                      }))}
                      placeholder="AKIAXXXXXXXXX"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Access Key
                    </label>
                    <div className="relative">
                      <input
                        type={showTokens['storageSecret'] ? 'text' : 'password'}
                        value={settings.storage.secretKey}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, secretKey: e.target.value }
                        }))}
                        placeholder="Secret key..."
                        className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleTokenVisibility('storageSecret')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showTokens['storageSecret'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4">
                {renderTestButton('storage')}
              </div>
            </div>
          )}

          {/* Automation Settings */}
          {activeTab === 'automation' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Automation Configuration</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Enable Automation</div>
                  <div className="text-sm text-gray-600">Run the pipeline automatically on schedule</div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {settings.automation.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={settings.automation.frequency}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        automation: { ...prev.automation, frequency: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="hourly">Every Hour</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom Schedule</option>
                    </select>
                  </div>

                  {settings.automation.frequency === 'daily' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time of Day
                      </label>
                      <input
                        type="time"
                        value={settings.automation.timeOfDay}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          automation: { ...prev.automation, timeOfDay: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.automation.autoValidation}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          automation: { ...prev.automation, autoValidation: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Automatically validate creatives
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.automation.autoLaunch}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          automation: { ...prev.automation, autoLaunch: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Automatically launch validated creatives
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Budget Limit ($)
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Automation will run according to your schedule and may incur costs based on your API usage and ad spend.
                      Make sure to set appropriate budget limits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}