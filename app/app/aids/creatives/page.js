'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, CheckCircle, XCircle, Clock, Download, Trash2, Filter, Search, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CreativesPage() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreative, setSelectedCreative] = useState(null);

  useEffect(() => {
    loadCreatives();
  }, []);

  const loadCreatives = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/creatives');
      const data = await response.json();
      setCreatives(data.creatives || generateDemoCreatives());
    } catch (error) {
      console.error('Error loading creatives:', error);
      setCreatives(generateDemoCreatives());
    }
    setLoading(false);
  };

  const generateDemoCreatives = () => {
    const statuses = ['generated', 'validated', 'launched', 'rejected'];
    const campaigns = ['Summer Sale 2025', 'Black Friday', 'New Product Launch', 'Brand Awareness'];
    const formats = ['Feed', 'Story', 'Reel', 'Carousel'];
    
    return Array.from({ length: 24 }, (_, i) => ({
      id: `creative_${i}`,
      name: `Creative ${i + 1}`,
      imageUrl: `https://picsum.photos/400/400?random=${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      format: formats[Math.floor(Math.random() * formats.length)],
      headline: `Headline for Creative ${i + 1}`,
      description: `This is a compelling description for creative ${i + 1}`,
      cta: 'Shop Now',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      performance: {
        impressions: Math.floor(Math.random() * 50000),
        clicks: Math.floor(Math.random() * 1500),
        ctr: (Math.random() * 5 + 1).toFixed(2),
        conversions: Math.floor(Math.random() * 100),
        spend: (Math.random() * 500).toFixed(2)
      },
      validation: {
        score: Math.random(),
        issues: Math.random() > 0.7 ? ['Low contrast', 'Text too small'] : [],
        validatedAt: statuses[Math.floor(Math.random() * statuses.length)] === 'validated' 
          ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() 
          : null
      }
    }));
  };

  const handleValidate = async (creativeId) => {
    try {
      const response = await fetch(`/api/aids/creatives/${creativeId}/validate`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setCreatives(prev => prev.map(c => 
          c.id === creativeId 
            ? { ...c, status: 'validated', validation: data.validation }
            : c
        ));
      }
    } catch (error) {
      console.error('Error validating creative:', error);
    }
  };

  const handleLaunch = async (creativeId) => {
    try {
      const response = await fetch(`/api/aids/creatives/${creativeId}/launch`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setCreatives(prev => prev.map(c => 
          c.id === creativeId 
            ? { ...c, status: 'launched' }
            : c
        ));
      }
    } catch (error) {
      console.error('Error launching creative:', error);
    }
  };

  const handleReject = async (creativeId) => {
    try {
      const response = await fetch(`/api/aids/creatives/${creativeId}/reject`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setCreatives(prev => prev.map(c => 
          c.id === creativeId 
            ? { ...c, status: 'rejected' }
            : c
        ));
      }
    } catch (error) {
      console.error('Error rejecting creative:', error);
    }
  };

  const filteredCreatives = creatives.filter(creative => {
    const matchesFilter = filter === 'all' || creative.status === filter;
    const matchesSearch = creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creative.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creative.headline.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      generated: 'bg-blue-100 text-blue-800',
      validated: 'bg-green-100 text-green-800',
      launched: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      generated: <Clock className="w-4 h-4" />,
      validated: <CheckCircle className="w-4 h-4" />,
      launched: <Upload className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/app/aids" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Creative Gallery</h1>
        <p className="text-gray-600">Manage and track all your generated creatives</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search creatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({creatives.length})
            </button>
            <button
              onClick={() => setFilter('generated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'generated' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Generated ({creatives.filter(c => c.status === 'generated').length})
            </button>
            <button
              onClick={() => setFilter('validated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'validated' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Validated ({creatives.filter(c => c.status === 'validated').length})
            </button>
            <button
              onClick={() => setFilter('launched')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'launched' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Launched ({creatives.filter(c => c.status === 'launched').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({creatives.filter(c => c.status === 'rejected').length})
            </button>
          </div>
        </div>
      </div>

      {/* Creatives Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreatives.map((creative) => (
            <div
              key={creative.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCreative(creative)}
            >
              {/* Creative Image */}
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={creative.imageUrl}
                  alt={creative.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(creative.status)}`}>
                    {getStatusIcon(creative.status)}
                    {creative.status}
                  </span>
                </div>
              </div>

              {/* Creative Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{creative.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{creative.campaign}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{creative.format}</span>
                  <span>{new Date(creative.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Performance Metrics */}
                {creative.status === 'launched' && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">CTR</div>
                      <div className="font-semibold">{creative.performance.ctr}%</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Conv</div>
                      <div className="font-semibold">{creative.performance.conversions}</div>
                    </div>
                  </div>
                )}

                {/* Validation Issues */}
                {creative.validation.issues.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-red-600">
                      {creative.validation.issues.join(', ')}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {creative.status === 'generated' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidate(creative.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Validate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(creative.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {creative.status === 'validated' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunch(creative.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Launch
                    </button>
                  )}
                  
                  {creative.status === 'launched' && (
                    <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded cursor-default">
                      Live
                    </button>
                  )}
                  
                  {creative.status === 'rejected' && (
                    <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-sm rounded cursor-default">
                      Rejected
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCreatives.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No creatives found</p>
          <button
            onClick={loadCreatives}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Creative Detail Modal */}
      {selectedCreative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedCreative.name}</h2>
                <button
                  onClick={() => setSelectedCreative(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  <img
                    src={selectedCreative.imageUrl}
                    alt={selectedCreative.name}
                    className="w-full rounded-lg"
                  />
                </div>
                
                {/* Details */}
                <div>
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCreative.status)}`}>
                      {getStatusIcon(selectedCreative.status)}
                      {selectedCreative.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Campaign</div>
                      <div className="font-medium">{selectedCreative.campaign}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Format</div>
                      <div className="font-medium">{selectedCreative.format}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Headline</div>
                      <div className="font-medium">{selectedCreative.headline}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Description</div>
                      <div className="font-medium">{selectedCreative.description}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">CTA</div>
                      <div className="font-medium">{selectedCreative.cta}</div>
                    </div>
                    
                    {selectedCreative.status === 'launched' && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Performance</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Impressions</div>
                            <div className="font-semibold">{selectedCreative.performance.impressions.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Clicks</div>
                            <div className="font-semibold">{selectedCreative.performance.clicks.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">CTR</div>
                            <div className="font-semibold">{selectedCreative.performance.ctr}%</div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Conversions</div>
                            <div className="font-semibold">{selectedCreative.performance.conversions}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedCreative.validation.issues.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Validation Issues</div>
                        <div className="bg-red-50 rounded p-3">
                          <ul className="list-disc list-inside text-sm text-red-700">
                            {selectedCreative.validation.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {selectedCreative.status === 'generated' && (
                      <button
                        onClick={() => {
                          handleValidate(selectedCreative.id);
                          setSelectedCreative(null);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Validate
                      </button>
                    )}
                    {selectedCreative.status === 'validated' && (
                      <button
                        onClick={() => {
                          handleLaunch(selectedCreative.id);
                          setSelectedCreative(null);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Launch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}