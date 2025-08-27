'use client';

import { useState } from 'react';

export default function TestMetaPage() {
  const [timeRange, setTimeRange] = useState('last_30d');
  const [endpoint, setEndpoint] = useState('insights');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const testMetaAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aids/debug-meta?time_range=${timeRange}&endpoint=${endpoint}`);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Test Meta API</h1>
      
      <div className="bg-white/5 rounded-lg p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-black/50 text-white px-4 py-2 rounded"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_30d">Last 30 days</option>
            <option value="last_90d">Last 90 days</option>
            <option value="lifetime">Lifetime</option>
          </select>

          <select 
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="bg-black/50 text-white px-4 py-2 rounded"
          >
            <option value="insights">Insights</option>
            <option value="campaigns">Campaigns</option>
          </select>

          <button
            onClick={testMetaAPI}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>
      </div>

      {response && (
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Response Analysis</h2>
          
          {response.analysis && (
            <>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Total Spend</div>
                  <div className="text-white font-bold">€{response.analysis.totalSpend?.toFixed(2) || 0}</div>
                </div>
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Total Clicks</div>
                  <div className="text-white font-bold">{response.analysis.totalClicks || 0}</div>
                </div>
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Total Reach</div>
                  <div className="text-white font-bold">{response.analysis.totalReach || 0}</div>
                </div>
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Total Results</div>
                  <div className="text-white font-bold">{response.analysis.totalResults || 0}</div>
                </div>
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Total Leads</div>
                  <div className="text-white font-bold text-green-400">{response.analysis.totalLeads || 0}</div>
                </div>
                <div className="bg-black/20 p-3 rounded">
                  <div className="text-gray-400 text-sm">Date Range</div>
                  <div className="text-white text-xs">
                    {response.analysis.dateRange?.start || 'N/A'} to {response.analysis.dateRange?.stop || 'N/A'}
                  </div>
                </div>
              </div>
              
              {response.analysis.leadSources && Object.keys(response.analysis.leadSources).length > 0 && (
                <div className="mb-4 bg-yellow-900/20 p-4 rounded">
                  <h3 className="text-yellow-400 font-bold mb-2">Lead Sources Found:</h3>
                  {Object.entries(response.analysis.leadSources).map(([source, count]) => (
                    <div key={source} className="text-white text-sm">
                      {source}: {count} leads
                    </div>
                  ))}
                </div>
              )}
              
              {response.analysis.actions && response.analysis.actions.length > 0 && (
                <div className="mb-4 bg-blue-900/20 p-4 rounded">
                  <h3 className="text-blue-400 font-bold mb-2">All Actions:</h3>
                  {response.analysis.actions.map((action, idx) => (
                    <div key={idx} className="text-white text-sm">
                      {action.type}: {action.value}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="bg-black/20 p-4 rounded overflow-auto">
            <pre className="text-xs text-gray-300">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {response.debugFile && (
            <div className="mt-4 text-sm text-gray-400">
              Debug file saved: {response.debugFile}
            </div>
          )}
        </div>
      )}
    </div>
  );
}