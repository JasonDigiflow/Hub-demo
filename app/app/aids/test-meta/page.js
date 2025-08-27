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
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-3 rounded">
                <div className="text-gray-400 text-sm">Total Spend</div>
                <div className="text-white font-bold">€{response.analysis.totalSpend?.toFixed(2) || 0}</div>
              </div>
              <div className="bg-black/20 p-3 rounded">
                <div className="text-gray-400 text-sm">Total Clicks</div>
                <div className="text-white font-bold">{response.analysis.totalClicks || 0}</div>
              </div>
              <div className="bg-black/20 p-3 rounded">
                <div className="text-gray-400 text-sm">Total Results</div>
                <div className="text-white font-bold">{response.analysis.totalResults || 0}</div>
              </div>
              <div className="bg-black/20 p-3 rounded">
                <div className="text-gray-400 text-sm">Date Range</div>
                <div className="text-white text-xs">
                  {response.analysis.dateRange?.start} to {response.analysis.dateRange?.stop}
                </div>
              </div>
            </div>
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